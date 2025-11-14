const { PrismaClient } = require('./src/generated/prisma/index.js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Function to generate email from name and roll number
function generateEmail(name, rollNumber) {
    // Extract first name and convert to lowercase
    const firstName = name.split(' ')[0].toLowerCase();
    return `${firstName}.${rollNumber}@knit.ac.in`;
}

// Function to hash password
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(5);
    return await bcrypt.hash(password, salt);
}

// Function to read and parse CSV
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

async function seedFinalYearStudents() {
    try {
        console.log('🚀 Starting to seed final year students...');

        const csvPath = path.join(__dirname, 'finalyear-students-clean.csv');
        const students = parseCSV(csvPath);
        
        console.log(`📊 Found ${students.length} students in CSV`);

        // Get the final year batch (2022 batch - currently in final year)
        // You might need to adjust this based on your batch structure
        let finalYearBatch = await prisma.batches.findFirst({
            where: {
                BatchName: "2022", // Final year students from 2022 batch
                course: "B.Tech"
            }
        });

        // If batch doesn't exist, create it
        if (!finalYearBatch) {
            console.log('📝 Creating final year batch...');
            finalYearBatch = await prisma.batches.create({
                data: {
                    BatchName: "2022",
                    course: "B.Tech",
                    currentSemester: 8, // Final year, 8th semester
                    isActive: true
                }
            });
            console.log(`✅ Created batch: ${finalYearBatch.BatchName} (ID: ${finalYearBatch.BatchId})`);
        }

        const defaultPassword = "Student@123"; // Default password for all students
        const hashedPassword = await hashPassword(defaultPassword);
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const student of students) {
            try {
                const email = generateEmail(student.name, student.rollNumber);
                
                // Check if user already exists
                const existingUser = await prisma.user.findUnique({
                    where: { email }
                });

                if (existingUser) {
                    console.log(`⚠️  User already exists: ${email}`);
                    skipCount++;
                    continue;
                }

                // Create user
                const user = await prisma.user.create({
                    data: {
                        name: student.name,
                        email: email,
                        password: hashedPassword,
                        type: 'STUDENT',
                        isActive: true
                    }
                });

                // Create student record
                await prisma.student.create({
                    data: {
                        userId: user.id,
                        rollNumber: student.rollNumber,
                        course: "B.Tech", // Course field is required
                        batchId: finalYearBatch.BatchId,
                        phone: "9999999999" // Default phone number
                    }
                });

                console.log(`✅ Created student: ${student.name} (${email})`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error creating student ${student.name}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n🎉 Seeding completed!');
        console.log(`✅ Successfully created: ${successCount} students`);
        console.log(`⚠️  Skipped (already exists): ${skipCount} students`);
        console.log(`❌ Errors: ${errorCount} students`);
        console.log(`📧 Email format: firstname.rollnumber@knit.ac.in`);
        console.log(`🔑 Default password: ${defaultPassword}`);
        console.log(`🎓 Batch: ${finalYearBatch.BatchName} (ID: ${finalYearBatch.BatchId})`);

    } catch (error) {
        console.error('💥 Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seeding
seedFinalYearStudents();