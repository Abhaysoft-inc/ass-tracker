import { Router } from "express";
import {
    createAttendanceSession,
    getMyTeachingAssignments,
    getStudentsForAttendance,
    getMyAttendanceSessions,
    updateAttendanceRecord
} from "./attendance";
import { authenticateFaculty } from "../../middleware/auth";
import { PrismaClient } from "../../generated/prisma";

const router = Router();
const prisma = new PrismaClient();

// ---------------- Attendance ----------------

// Create attendance session and mark attendance
router.post("/attendance/session", authenticateFaculty, async (req, res) => {
    await createAttendanceSession(req, res);
});

// Get my teaching assignments
router.get("/attendance/assignments", authenticateFaculty, async (req, res) => {
    await getMyTeachingAssignments(req, res);
});

// Get students for a specific batch and subject
router.get("/attendance/students", authenticateFaculty, async (req, res) => {
    await getStudentsForAttendance(req, res);
});

// Get my attendance sessions (history)
router.get("/attendance/sessions", authenticateFaculty, async (req, res) => {
    await getMyAttendanceSessions(req, res);
});

// Update a specific attendance record
router.put("/attendance/record/:recordId", authenticateFaculty, async (req, res) => {
    await updateAttendanceRecord(req, res);
});

// ---------------- Timetable ----------------

router.get("/timetable/my-schedule", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const activeVersions = await prisma.timetableVersion.findMany({
            where: {
                isActive: true,
                validFrom: { lte: new Date() },
                OR: [{ validTo: null }, { validTo: { gte: new Date() } }]
            }
        });
        const slots = await prisma.timetableSlot.findMany({
            where: {
                facultyId,
                timetableVersionId: { in: activeVersions.map(v => v.id) },
                isActive: true
            },
            include: {
                subject: true,
                batch: true,
                timetableVersion: true
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get("/timetable/today", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
        const activeVersions = await prisma.timetableVersion.findMany({
            where: {
                isActive: true,
                validFrom: { lte: today },
                OR: [{ validTo: null }, { validTo: { gte: today } }]
            }
        });
        const slots = await prisma.timetableSlot.findMany({
            where: {
                facultyId,
                dayOfWeek,
                timetableVersionId: { in: activeVersions.map(v => v.id) },
                isActive: true
            },
            include: { subject: true, batch: true },
            orderBy: { startTime: 'asc' }
        });
        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
