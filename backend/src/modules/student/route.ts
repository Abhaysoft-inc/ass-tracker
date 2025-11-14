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

router.get("/view-syllabus", authenticateStudent, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get student details with batch information
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true,
                        currentSemester: true
                    }
                }
            }
        });

        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: "Student batch not found" });
        }

        // Get subjects for the student's current semester and department
        const subjects = await prisma.subject.findMany({
            where: {
                department: student.batch.course,
                semester: student.batch.currentSemester
            },
            include: {
                facultyBatchSubjects: {
                    where: {
                        batchId: student.batch.BatchId,
                        isActive: true
                    },
                    include: {
                        faculty: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Transform the data for frontend consumption
        const syllabusData = subjects.map(subject => ({
            id: subject.id,
            name: subject.name,
            code: subject.code,
            credits: subject.credits,
            department: subject.department,
            semester: subject.semester,
            faculty: subject.facultyBatchSubjects.map(fbs => ({
                id: fbs.faculty.id,
                name: fbs.faculty.name,
                email: fbs.faculty.email
            }))
        }));

        res.json({
            success: true,
            data: {
                batch: student.batch,
                subjects: syllabusData
            }
        });

    } catch (error) {
        console.error("Get syllabus error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/view-assignments", authenticateStudent, async (req, res) => {
    try {
        const studentId = req.user?.id;

        // Get student details
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true,
                        currentSemester: true
                    }
                }
            }
        });

        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: "Student batch not found" });
        }

        // Get assignments for student's batch
        const assignments = await prisma.assignment.findMany({
            where: {
                batchId: student.batch.BatchId,
                status: 'PUBLISHED'
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                faculty: {
                    select: { id: true, name: true }
                },
                submissions: {
                    where: {
                        studentId: studentId
                    },
                    select: {
                        id: true,
                        status: true,
                        submittedAt: true,
                        marks: true,
                        feedback: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        // Transform to include submission status
        const assignmentsWithStatus = assignments.map(assignment => ({
            ...assignment,
            submission: assignment.submissions[0] || null,
            isOverdue: new Date() > assignment.dueDate,
            daysUntilDue: Math.ceil((assignment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }));

        res.json({
            success: true,
            data: {
                batch: student.batch,
                assignments: assignmentsWithStatus
            }
        });

    } catch (error) {
        console.error("Get assignments error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/view-notifications", authenticateStudent, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get student details to filter notifications
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Get notifications (announcements) for this student
        const notifications = await prisma.announcement.findMany({
            where: {
                isActive: true,
                OR: [
                    // General announcements
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
                        name: true
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
            },
            take: 50 // Limit to recent 50 notifications
        });

        // Transform for notifications format
        const transformedNotifications = notifications.map(notification => ({
            id: notification.id,
            title: notification.title,
            content: notification.content,
            author: notification.hod.name,
            department: notification.department,
            batch: notification.batch?.BatchName,
            createdAt: notification.createdAt,
            isNew: isNewAnnouncement(notification.createdAt)
        }));

        res.json({
            success: true,
            data: {
                notifications: transformedNotifications,
                batch: student.batch
            }
        });

    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/view-circulars", authenticateStudent, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get student details
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Get circulars (official announcements) - filter for more formal announcements
        const circulars = await prisma.announcement.findMany({
            where: {
                isActive: true,
                // Focus on official department and institutional circulars
                OR: [
                    // General institutional circulars
                    {
                        AND: [
                            { department: null },
                            { batchId: null }
                        ]
                    },
                    // Department-wide circulars
                    {
                        AND: [
                            { department: student.course },
                            { batchId: null }
                        ]
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 30 // Limit to recent 30 circulars
        });

        // Transform for circulars format
        const transformedCirculars = circulars.map(circular => ({
            id: circular.id,
            title: circular.title,
            content: circular.content,
            issuer: circular.hod.name,
            department: circular.hod.hod?.department || 'Administration',
            issueDate: circular.createdAt,
            isRecent: isNewAnnouncement(circular.createdAt)
        }));

        res.json({
            success: true,
            data: {
                circulars: transformedCirculars,
                studentInfo: {
                    batch: student.batch,
                    course: student.course
                }
            }
        });

    } catch (error) {
        console.error("Get circulars error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
router.get("/view-events", authenticateStudent, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get student details
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // TODO: Once events table is created, fetch real events
        // For now, return empty array with proper structure
        const events = [];

        res.json({
            success: true,
            data: {
                events: events,
                batch: student.batch,
                message: "Events module will be implemented soon"
            }
        });

    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Todo: fetch schedules using the current class and batch

router.get("/view-schedule", authenticateStudent, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get student details
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true,
                        currentSemester: true
                    }
                }
            }
        });

        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: "Student batch not found" });
        }

        // Get active timetable version for student's semester
        const timetableVersion = await prisma.timetableVersion.findFirst({
            where: {
                semester: student.batch.currentSemester,
                isActive: true,
                validFrom: { lte: new Date() },
                OR: [
                    { validTo: null },
                    { validTo: { gte: new Date() } }
                ]
            },
            orderBy: {
                validFrom: 'desc'
            }
        });

        if (!timetableVersion) {
            return res.json({
                success: true,
                data: {
                    schedule: [],
                    batch: student.batch,
                    message: "No active timetable found for your semester"
                }
            });
        }

        // Get timetable slots for the student's batch
        const scheduleSlots = await prisma.timetableSlot.findMany({
            where: {
                timetableVersionId: timetableVersion.id,
                batchId: student.batch.BatchId,
                isActive: true
            },
            include: {
                subject: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        credits: true
                    }
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        // Transform schedule data
        const schedule = scheduleSlots.map(slot => ({
            id: slot.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subject: slot.subject,
            faculty: slot.faculty,
            roomNumber: slot.roomNumber,
            sessionType: slot.sessionType
        }));

        res.json({
            success: true,
            data: {
                schedule: schedule,
                timetableVersion: {
                    id: timetableVersion.id,
                    name: timetableVersion.name,
                    academicYear: timetableVersion.academicYear,
                    semester: timetableVersion.semester
                },
                batch: student.batch
            }
        });

    } catch (error) {
        console.error("Get schedule error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
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
