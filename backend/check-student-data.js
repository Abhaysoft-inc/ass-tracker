const { PrismaClient } = require('./src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function checkStudentData() {
    try {
        console.log('🔍 Checking current student data...\n');

        // Count total users by type
        const totalUsers = await prisma.user.count();
        const studentUsers = await prisma.user.count({
            where: { type: 'STUDENT' }
        });
        const hodUsers = await prisma.user.count({
            where: { type: 'HOD' }
        });
        const facultyUsers = await prisma.user.count({
            where: { type: 'FACULTY' }
        });

        console.log('👥 USER COUNTS:');
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Student Users: ${studentUsers}`);
        console.log(`HOD Users: ${hodUsers}`);
        console.log(`Faculty Users: ${facultyUsers}\n`);

        // Count student records
        const totalStudentRecords = await prisma.student.count();
        console.log('🎓 STUDENT RECORDS:');
        console.log(`Total Student records: ${totalStudentRecords}\n`);

        // Find users with STUDENT type but no corresponding student record
        const studentsWithoutRecords = await prisma.user.findMany({
            where: {
                type: 'STUDENT',
                student: null
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });

        console.log('❌ STUDENT USERS WITHOUT STUDENT RECORDS:');
        console.log(`Count: ${studentsWithoutRecords.length}`);
        if (studentsWithoutRecords.length > 0) {
            console.log('Sample records:');
            studentsWithoutRecords.slice(0, 10).forEach(user => {
                console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            });
        }

        // Check if 2022 batch exists
        console.log('\n🎯 BATCH INFORMATION:');
        const batch2022 = await prisma.batches.findFirst({
            where: {
                BatchName: "2022",
                course: "B.Tech"
            }
        });

        if (batch2022) {
            console.log(`✅ 2022 Batch exists: ID ${batch2022.BatchId}`);
            const studentsInBatch = await prisma.student.count({
                where: { batchId: batch2022.BatchId }
            });
            console.log(`Students in 2022 batch: ${studentsInBatch}`);
        } else {
            console.log('❌ 2022 Batch does not exist');
        }

        // Show recent users created (likely the ones from seeding)
        console.log('\n📅 RECENT STUDENT USERS (last 20):');
        const recentUsers = await prisma.user.findMany({
            where: { type: 'STUDENT' },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                student: {
                    select: {
                        rollNumber: true,
                        course: true,
                        batchId: true
                    }
                }
            }
        });

        recentUsers.forEach(user => {
            const hasStudentRecord = user.student ? '✅' : '❌';
            const rollNumber = user.student?.rollNumber || 'N/A';
            const batchId = user.student?.batchId || 'N/A';
            console.log(`${hasStudentRecord} ${user.name} (${user.email}) - Roll: ${rollNumber}, Batch: ${batchId}`);
        });

    } catch (error) {
        console.error('💥 Error checking data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkStudentData();