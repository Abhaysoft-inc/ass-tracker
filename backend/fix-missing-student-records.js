const { PrismaClient } = require('./src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Function to read and parse CSV to get roll numbers
function parseCSV(filePath) {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    const students = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
        const [rollNumber, studentName] = lines[i].split(',');
        if (rollNumber && studentName) {
            students.push({
                rollNumber: rollNumber.trim(),
                name: studentName.trim()
            });
        }
    }
    
    return students;
}

async function fixMissingStudentRecords() {
    try {
        console.log('🔧 Fixing missing Student records...\n');

        // Get the 2022 batch
        const batch2022 = await prisma.batches.findFirst({
            where: {
                BatchName: "2022",
                course: "B.Tech"
            }
        });

        if (!batch2022) {
            console.log('❌ 2022 Batch not found. Creating it...');
            const newBatch = await prisma.batches.create({
                data: {
                    BatchName: "2022",
                    course: "B.Tech",
                    currentSemester: 8, // Final year
                    isActive: true
                }
            });
            console.log(`✅ Created 2022 batch with ID: ${newBatch.BatchId}`);
            batch2022 = newBatch;
        }

        console.log(`📚 Using batch: ${batch2022.BatchName} (ID: ${batch2022.BatchId})\n`);

        // Get the CSV data to match roll numbers
        const csvPath = path.join(__dirname, 'finalyear-students-clean.csv');
        const csvStudents = parseCSV(csvPath);
        console.log(`📄 Found ${csvStudents.length} students in CSV\n`);

        // Create a map of email to roll number for quick lookup
        const emailToRollMap = {};
        csvStudents.forEach(student => {
            const firstName = student.name.split(' ')[0].toLowerCase();
            const email = `${firstName}.${student.rollNumber}@knit.ac.in`;
            emailToRollMap[email] = student.rollNumber;
        });

        // Find all student users without student records
        const studentsWithoutRecords = await prisma.user.findMany({
            where: {
                type: 'STUDENT',
                student: null
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        console.log(`🎯 Found ${studentsWithoutRecords.length} users without Student records\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const user of studentsWithoutRecords) {
            try {
                // Get roll number from email mapping
                const rollNumber = emailToRollMap[user.email];
                
                if (!rollNumber) {
                    console.log(`⚠️  Could not find roll number for ${user.email}, skipping...`);
                    continue;
                }

                // Create the missing Student record
                await prisma.student.create({
                    data: {
                        userId: user.id,
                        rollNumber: rollNumber,
                        course: "B.Tech",
                        batchId: batch2022.BatchId,
                        phone: "9999999999", // Default phone
                        isVerified: false
                    }
                });

                console.log(`✅ Created Student record for: ${user.name} (Roll: ${rollNumber})`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error creating Student record for ${user.name}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n🎉 Fix completed!');
        console.log(`✅ Successfully created: ${successCount} Student records`);
        console.log(`❌ Errors: ${errorCount} records`);
        console.log(`🎓 All students assigned to batch: ${batch2022.BatchName} (ID: ${batch2022.BatchId})`);

        // Verify the fix
        console.log('\n🔍 Verification:');
        const totalStudentRecords = await prisma.student.count();
        const studentsInBatch = await prisma.student.count({
            where: { batchId: batch2022.BatchId }
        });
        
        console.log(`Total Student records now: ${totalStudentRecords}`);
        console.log(`Students in 2022 batch: ${studentsInBatch}`);

    } catch (error) {
        console.error('💥 Fix failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the fix
fixMissingStudentRecords();