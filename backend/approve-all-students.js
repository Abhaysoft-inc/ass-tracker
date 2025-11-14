const { PrismaClient } = require('./src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function approveAllStudents() {
    try {
        console.log('✅ Approving all students (setting isVerified to true)...\n');

        // Get the 2022 batch students
        const batch2022 = await prisma.batches.findFirst({
            where: {
                BatchName: "2022",
                course: "B.Tech"
            }
        });

        if (!batch2022) {
            console.log('❌ 2022 Batch not found!');
            return;
        }

        // Update all students in 2022 batch to be verified
        const result = await prisma.student.updateMany({
            where: {
                batchId: batch2022.BatchId,
                isVerified: false // Only update those not already verified
            },
            data: {
                isVerified: true
            }
        });

        console.log(`✅ Approved (verified) ${result.count} students in batch ${batch2022.BatchName}`);

        // Also activate all corresponding users
        const users = await prisma.student.findMany({
            where: { batchId: batch2022.BatchId },
            select: { userId: true }
        });

        const userIds = users.map(student => student.userId);

        const userResult = await prisma.user.updateMany({
            where: {
                id: { in: userIds },
                isActive: false // Only update inactive users
            },
            data: {
                isActive: true
            }
        });

        console.log(`✅ Activated ${userResult.count} user accounts`);

        // Show final summary
        console.log('\n📊 Final Summary:');
        const verifiedStudents = await prisma.student.count({
            where: {
                batchId: batch2022.BatchId,
                isVerified: true
            }
        });

        const activeUsers = await prisma.user.count({
            where: {
                id: { in: userIds },
                isActive: true
            }
        });

        console.log(`✅ Total verified students in 2022 batch: ${verifiedStudents}`);
        console.log(`✅ Total active user accounts: ${activeUsers}`);
        console.log(`🎓 All students are now approved and ready to use the system!`);

    } catch (error) {
        console.error('💥 Error approving students:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the approval
approveAllStudents();