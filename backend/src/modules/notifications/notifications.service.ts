import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

// Function to create system notifications (called by other modules)
export async function createNotification({
    title,
    message,
    type,
    userId,
    senderId,
    metadata
}: {
    title: string;
    message: string;
    type: string;
    userId: number;
    senderId?: number;
    metadata?: any;
}) {
    try {
        return await prisma.notification.create({
            data: {
                title,
                message,
                type: type as any,
                userId,
                senderId,
                metadata
            }
        });
    } catch (error) {
        console.error("Create notification error:", error);
        throw error;
    }
}

// Function to create notifications for multiple users
export async function createBulkNotifications(notifications: {
    title: string;
    message: string;
    type: string;
    userId: number;
    senderId?: number;
    metadata?: any;
}[]) {
    try {
        return await prisma.notification.createMany({
            data: notifications.map(notif => ({
                title: notif.title,
                message: notif.message,
                type: notif.type as any,
                userId: notif.userId,
                senderId: notif.senderId,
                metadata: notif.metadata
            }))
        });
    } catch (error) {
        console.error("Create bulk notifications error:", error);
        throw error;
    }
}

// Function to notify students about new assignments
export async function notifyStudentsAboutAssignment(assignmentId: number, batchId: number, facultyId: number) {
    try {
        // Get assignment details
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                subject: { select: { name: true } },
                faculty: { select: { name: true } }
            }
        });

        if (!assignment) return;

        // Get students in the batch
        const students = await prisma.student.findMany({
            where: { batchId },
            select: { userId: true }
        });

        // Create notifications
        const notifications = students.map(student => ({
            title: "New Assignment Posted",
            message: `${assignment.subject.name}: ${assignment.title} has been posted by ${assignment.faculty.name}. Due: ${assignment.dueDate.toDateString()}`,
            type: "ASSIGNMENT",
            userId: student.userId,
            senderId: facultyId,
            metadata: { assignmentId, type: 'new_assignment' }
        }));

        await createBulkNotifications(notifications);

    } catch (error) {
        console.error("Notify students about assignment error:", error);
    }
}

// Function to notify student about assignment grade
export async function notifyStudentAboutGrade(submissionId: number) {
    try {
        // Get submission details
        const submission = await prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
            include: {
                assignment: {
                    include: {
                        subject: { select: { name: true } },
                        faculty: { select: { name: true } }
                    }
                },
                student: { select: { name: true } }
            }
        });

        if (!submission || !submission.marks) return;

        await createNotification({
            title: "Assignment Graded",
            message: `Your assignment "${submission.assignment.title}" in ${submission.assignment.subject.name} has been graded. Score: ${submission.marks}/${submission.assignment.totalMarks}`,
            type: "ASSIGNMENT",
            userId: submission.studentId,
            senderId: submission.gradedBy || undefined,
            metadata: { submissionId, assignmentId: submission.assignmentId, type: 'grade_released' }
        });

    } catch (error) {
        console.error("Notify student about grade error:", error);
    }
}