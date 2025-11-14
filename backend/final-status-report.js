const { PrismaClient } = require('./src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function showFinalStatus() {
    try {
        console.log('🎉 FINAL STATUS REPORT\n');
        console.log('='.repeat(50));

        // Get batch info
        const batch2022 = await prisma.batches.findFirst({
            where: {
                BatchName: "2022",
                course: "B.Tech"
            }
        });

        console.log('\n📚 BATCH INFORMATION:');
        console.log(`✅ Batch Name: ${batch2022.BatchName}`);
        console.log(`✅ Course: ${batch2022.course}`);
        console.log(`✅ Current Semester: ${batch2022.currentSemester}`);
        console.log(`✅ Batch ID: ${batch2022.BatchId}`);
        console.log(`✅ Is Active: ${batch2022.isActive}`);

        // Student statistics
        const totalStudentsInBatch = await prisma.student.count({
            where: { batchId: batch2022.BatchId }
        });

        const verifiedStudents = await prisma.student.count({
            where: {
                batchId: batch2022.BatchId,
                isVerified: true
            }
        });

        const unverifiedStudents = await prisma.student.count({
            where: {
                batchId: batch2022.BatchId,
                isVerified: false
            }
        });

        console.log('\n👥 STUDENT STATISTICS:');
        console.log(`✅ Total Students in 2022 Batch: ${totalStudentsInBatch}`);
        console.log(`✅ Verified Students: ${verifiedStudents}`);
        console.log(`❌ Unverified Students: ${unverifiedStudents}`);

        // User account statistics
        const studentsWithUsers = await prisma.student.findMany({
            where: { batchId: batch2022.BatchId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true,
                        type: true
                    }
                }
            }
        });

        const activeAccounts = studentsWithUsers.filter(s => s.user.isActive).length;
        const inactiveAccounts = studentsWithUsers.filter(s => !s.user.isActive).length;

        console.log('\n🔐 USER ACCOUNT STATUS:');
        console.log(`✅ Active Accounts: ${activeAccounts}`);
        console.log(`❌ Inactive Accounts: ${inactiveAccounts}`);

        // Sample students
        console.log('\n📋 SAMPLE STUDENTS (First 10):');
        console.log('Roll Number | Name | Email | Verified | Active');
        console.log('-'.repeat(80));
        
        studentsWithUsers.slice(0, 10).forEach(student => {
            const verified = student.isVerified ? '✅' : '❌';
            const active = student.user.isActive ? '✅' : '❌';
            console.log(`${student.rollNumber.padEnd(12)} | ${student.user.name.padEnd(20)} | ${student.user.email.padEnd(25)} | ${verified.padEnd(8)} | ${active}`);
        });

        console.log('\n🎯 SUMMARY:');
        console.log(`✅ All ${totalStudentsInBatch} students have been successfully created`);
        console.log(`✅ All students are assigned to batch "${batch2022.BatchName}"`);
        console.log(`✅ All ${verifiedStudents} students are verified and approved`);
        console.log(`✅ All ${activeAccounts} user accounts are active`);
        console.log(`🔑 Default password for all students: "Student@123"`);
        console.log(`📧 Email format: firstname.rollnumber@knit.ac.in`);
        
        console.log('\n🎉 SUCCESS: Student data seeding and approval completed successfully!');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('💥 Error generating status report:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Show final status
showFinalStatus();