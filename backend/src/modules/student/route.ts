import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";
import { authenticateStudent } from "../../middleware/auth";
import { getMyAttendance, getSubjectAttendance } from "./attendance";

const router = Router();
const prisma = new PrismaClient();

// Todo: Get userId of logged in user from the request or from the session storage

// View own attendance - overall and subject-wise
router.get("/attendance", authenticateStudent, async (req, res) => {
    await getMyAttendance(req, res);
});

// View attendance for specific subject
router.get("/attendance/subject/:subjectId", authenticateStudent, async (req, res) => {
    await getSubjectAttendance(req, res);
});

// Todo: fetch the informations like the current class and the batch so that user can get the schedules as per their semester

router.get("/view-syllabus", async (req, res) => {
    // Todo: implement function to retreive the attendance of current user
});

router.get("/view-assignments", async (req, res) => {
    // Todo: implement function to retreive the attendance of current user
});

router.get("/view-notifications", async (req, res) => {
    // Todo: implement function to retreive the attendance of current user
});

router.get("/view-circulars", async (req, res) => {
    // Todo: implement function to retreive the attendance of current user
});
router.get("/view-events", async (req, res) => {
    // Todo: implement function to retreive the attendance of current user
});

// Todo: fetch schedules using the current class and batch

router.get("/view-schedule", async (req, res) => {

});

// Get announcements for student
router.get("/announcements", authenticateStudent, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get student details to filter announcements
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true
                    }
                },
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Get announcements that are either:
        // 1. General (no department and no batch specified)
        // 2. For the student's department
        // 3. For the student's specific batch
        const announcements = await prisma.announcement.findMany({
            where: {
                isActive: true,
                OR: [
                    // General announcements (no specific department or batch)
                    {
                        AND: [
                            { department: null },
                            { batchId: null }
                        ]
                    },
                    // Department-specific announcements
                    {
                        AND: [
                            { department: student.course },
                            { batchId: null }
                        ]
                    },
                    // Batch-specific announcements
                    {
                        batchId: student.batch?.BatchId
                    }
                ]
            },
            include: {
                hod: {
                    select: {
                        name: true,
                        hod: {
                            select: {
                                department: true
                            }
                        }
                    }
                },
                batch: {
                    select: {
                        BatchName: true,
                        course: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform announcements for frontend consumption
        const transformedAnnouncements = announcements.map(announcement => ({
            id: announcement.id,
            type: 'announcement',
            title: announcement.title,
            description: announcement.content,
            time: getTimeAgo(announcement.createdAt),
            isNew: isNewAnnouncement(announcement.createdAt),
            icon: 'announcement',
            author: announcement.hod.name,
            department: announcement.hod.hod?.department,
            batch: announcement.batch?.BatchName,
            createdAt: announcement.createdAt
        }));

        res.json({ announcements: transformedAnnouncements });

    } catch (error) {
        console.error("Get student announcements error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
}

// Helper function to check if announcement is new (within last 24 hours)
function isNewAnnouncement(date: Date): boolean {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
}

// ---------------- Timetable ----------------

router.get("/timetable/my-schedule", authenticateStudent, async (req, res) => {
    try {
        const studentId = req.user?.id;
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: { batch: true }
        });
        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: 'Student batch not found' });
        }
        const version = await prisma.timetableVersion.findFirst({
            where: {
                semester: student.batch.currentSemester,
                isActive: true,
                validFrom: { lte: new Date() },
                OR: [{ validTo: null }, { validTo: { gte: new Date() } }]
            },
            orderBy: { validFrom: 'desc' }
        });
        if (!version) {
            return res.json({ success: true, data: { version: null, slots: [] } });
        }
        const slots = await prisma.timetableSlot.findMany({
            where: {
                timetableVersionId: version.id,
                batchId: student.batch.BatchId,
                isActive: true
            },
            include: { subject: true, faculty: { select: { id: true, name: true } } },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
        res.json({ success: true, data: { version, batch: student.batch, slots } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get("/timetable/today", authenticateStudent, async (req, res) => {
    try {
        const studentId = req.user?.id;
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: { batch: true }
        });
        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: 'Student batch not found' });
        }
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
        const version = await prisma.timetableVersion.findFirst({
            where: {
                semester: student.batch.currentSemester,
                isActive: true,
                validFrom: { lte: today },
                OR: [{ validTo: null }, { validTo: { gte: today } }]
            },
            orderBy: { validFrom: 'desc' }
        });
        if (!version) {
            return res.json({ success: true, data: [] });
        }
        const slots = await prisma.timetableSlot.findMany({
            where: {
                timetableVersionId: version.id,
                batchId: student.batch.BatchId,
                dayOfWeek,
                isActive: true
            },
            include: { subject: true, faculty: { select: { id: true, name: true } } },
            orderBy: { startTime: 'asc' }
        });
        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
