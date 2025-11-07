import { Router, Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

// ==================== HOD ROUTES ====================

// Create a new timetable version
router.post('/hod/version', async (req: Request, res: Response) => {
    try {
        const { name, academicYear, semester, validFrom, validTo } = req.body;
        const hodId = (req as any).user?.id;

        if (!hodId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Validate required fields
        if (!name || !academicYear || !semester || !validFrom) {
            return res.status(400).json({
                success: false,
                message: 'Name, academicYear, semester, and validFrom are required'
            });
        }

        // Deactivate any overlapping active timetables for the same semester
        await prisma.timetableVersion.updateMany({
            where: {
                semester: parseInt(semester),
                isActive: true,
                OR: [
                    {
                        AND: [
                            { validFrom: { lte: new Date(validFrom) } },
                            { validTo: { gte: new Date(validFrom) } }
                        ]
                    },
                    {
                        AND: [
                            { validFrom: { lte: validTo ? new Date(validTo) : new Date('2099-12-31') } },
                            { validTo: { gte: validTo ? new Date(validTo) : new Date('2099-12-31') } }
                        ]
                    }
                ]
            },
            data: { isActive: false }
        });

        const timetableVersion = await prisma.timetableVersion.create({
            data: {
                name,
                academicYear,
                semester: parseInt(semester),
                validFrom: new Date(validFrom),
                validTo: validTo ? new Date(validTo) : null,
                createdBy: hodId,
                isActive: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Timetable version created successfully',
            data: timetableVersion
        });
    } catch (error: any) {
        console.error('Error creating timetable version:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all timetable versions
router.get('/hod/versions', async (req: Request, res: Response) => {
    try {
        const { academicYear, semester, isActive } = req.query;

        const filters: any = {};
        if (academicYear) filters.academicYear = academicYear;
        if (semester) filters.semester = parseInt(semester as string);
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const versions = await prisma.timetableVersion.findMany({
            where: filters,
            include: {
                _count: {
                    select: { slots: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: versions });
    } catch (error: any) {
        console.error('Error fetching timetable versions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Add slots to a timetable version
router.post('/hod/version/:versionId/slots', async (req: Request, res: Response) => {
    try {
        const { versionId } = req.params;
        const { slots } = req.body; // Array of slot objects

        if (!Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Slots array is required and must not be empty'
            });
        }

        // Validate timetable version exists
        const version = await prisma.timetableVersion.findUnique({
            where: { id: parseInt(versionId) }
        });

        if (!version) {
            return res.status(404).json({ success: false, message: 'Timetable version not found' });
        }

        // Create all slots
        const createdSlots = await prisma.timetableSlot.createMany({
            data: slots.map((slot: any) => ({
                timetableVersionId: parseInt(versionId),
                dayOfWeek: parseInt(slot.dayOfWeek),
                startTime: slot.startTime,
                endTime: slot.endTime,
                subjectId: parseInt(slot.subjectId),
                batchId: parseInt(slot.batchId),
                facultyId: parseInt(slot.facultyId),
                roomNumber: slot.roomNumber || null,
                sessionType: slot.sessionType || 'LECTURE'
            }))
        });

        res.status(201).json({
            success: true,
            message: `${createdSlots.count} slots added successfully`,
            data: createdSlots
        });
    } catch (error: any) {
        console.error('Error adding timetable slots:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a timetable slot
router.put('/hod/slot/:slotId', async (req: Request, res: Response) => {
    try {
        const { slotId } = req.params;
        const { dayOfWeek, startTime, endTime, subjectId, batchId, facultyId, roomNumber, sessionType, isActive } = req.body;

        const updateData: any = {};
        if (dayOfWeek !== undefined) updateData.dayOfWeek = parseInt(dayOfWeek);
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (subjectId) updateData.subjectId = parseInt(subjectId);
        if (batchId) updateData.batchId = parseInt(batchId);
        if (facultyId) updateData.facultyId = parseInt(facultyId);
        if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
        if (sessionType) updateData.sessionType = sessionType;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedSlot = await prisma.timetableSlot.update({
            where: { id: parseInt(slotId) },
            data: updateData,
            include: {
                subject: true,
                batch: true,
                faculty: { select: { id: true, name: true } }
            }
        });

        res.json({
            success: true,
            message: 'Timetable slot updated successfully',
            data: updatedSlot
        });
    } catch (error: any) {
        console.error('Error updating timetable slot:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete a timetable slot (soft delete by setting isActive to false)
router.delete('/hod/slot/:slotId', async (req: Request, res: Response) => {
    try {
        const { slotId } = req.params;

        const updatedSlot = await prisma.timetableSlot.update({
            where: { id: parseInt(slotId) },
            data: { isActive: false }
        });

        res.json({
            success: true,
            message: 'Timetable slot deleted successfully',
            data: updatedSlot
        });
    } catch (error: any) {
        console.error('Error deleting timetable slot:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get timetable for a specific batch
router.get('/hod/batch/:batchId/timetable', async (req: Request, res: Response) => {
    try {
        const { batchId } = req.params;
        const { versionId } = req.query;

        // Get active version if not specified
        let version;
        if (versionId) {
            version = await prisma.timetableVersion.findUnique({
                where: { id: parseInt(versionId as string) }
            });
        } else {
            // Get batch's current semester
            const batch = await prisma.batches.findUnique({
                where: { BatchId: parseInt(batchId) },
                select: { currentSemester: true }
            });

            if (!batch) {
                return res.status(404).json({ success: false, message: 'Batch not found' });
            }

            version = await prisma.timetableVersion.findFirst({
                where: {
                    semester: batch.currentSemester,
                    isActive: true,
                    validFrom: { lte: new Date() },
                    OR: [
                        { validTo: null },
                        { validTo: { gte: new Date() } }
                    ]
                },
                orderBy: { validFrom: 'desc' }
            });
        }

        if (!version) {
            return res.json({
                success: true,
                message: 'No active timetable found for this batch',
                data: { slots: [] }
            });
        }

        const slots = await prisma.timetableSlot.findMany({
            where: {
                timetableVersionId: version.id,
                batchId: parseInt(batchId),
                isActive: true
            },
            include: {
                subject: true,
                faculty: { select: { id: true, name: true } },
                batch: { select: { BatchId: true, BatchName: true } }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.json({
            success: true,
            data: {
                version,
                slots
            }
        });
    } catch (error: any) {
        console.error('Error fetching batch timetable:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ==================== FACULTY ROUTES ====================

// Get faculty's timetable
router.get('/faculty/my-timetable', async (req: Request, res: Response) => {
    try {
        const facultyId = (req as any).user?.id;

        if (!facultyId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get all active timetable versions
        const activeVersions = await prisma.timetableVersion.findMany({
            where: {
                isActive: true,
                validFrom: { lte: new Date() },
                OR: [
                    { validTo: null },
                    { validTo: { gte: new Date() } }
                ]
            }
        });

        const versionIds = activeVersions.map(v => v.id);

        const slots = await prisma.timetableSlot.findMany({
            where: {
                facultyId,
                timetableVersionId: { in: versionIds },
                isActive: true
            },
            include: {
                subject: true,
                batch: { select: { BatchId: true, BatchName: true, currentSemester: true } },
                timetableVersion: { select: { id: true, name: true, academicYear: true } }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.json({ success: true, data: slots });
    } catch (error: any) {
        console.error('Error fetching faculty timetable:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get faculty's timetable for a specific day
router.get('/faculty/today', async (req: Request, res: Response) => {
    try {
        const facultyId = (req as any).user?.id;

        if (!facultyId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1=Monday, 7=Sunday

        // Get active timetable versions
        const activeVersions = await prisma.timetableVersion.findMany({
            where: {
                isActive: true,
                validFrom: { lte: today },
                OR: [
                    { validTo: null },
                    { validTo: { gte: today } }
                ]
            }
        });

        const versionIds = activeVersions.map(v => v.id);

        const todaySlots = await prisma.timetableSlot.findMany({
            where: {
                facultyId,
                dayOfWeek: adjustedDay,
                timetableVersionId: { in: versionIds },
                isActive: true
            },
            include: {
                subject: true,
                batch: { select: { BatchId: true, BatchName: true } }
            },
            orderBy: { startTime: 'asc' }
        });

        res.json({ success: true, data: todaySlots });
    } catch (error: any) {
        console.error('Error fetching today\'s timetable:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ==================== STUDENT ROUTES ====================

// Get student's timetable
router.get('/student/my-timetable', async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user?.id;

        if (!studentId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get student's batch
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                batch: { select: { BatchId: true, BatchName: true, currentSemester: true } }
            }
        });

        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: 'Student batch not found' });
        }

        // Get active timetable version for student's semester
        const version = await prisma.timetableVersion.findFirst({
            where: {
                semester: student.batch.currentSemester,
                isActive: true,
                validFrom: { lte: new Date() },
                OR: [
                    { validTo: null },
                    { validTo: { gte: new Date() } }
                ]
            },
            orderBy: { validFrom: 'desc' }
        });

        if (!version) {
            return res.json({
                success: true,
                message: 'No active timetable found',
                data: { slots: [] }
            });
        }

        const slots = await prisma.timetableSlot.findMany({
            where: {
                timetableVersionId: version.id,
                batchId: student.batch.BatchId,
                isActive: true
            },
            include: {
                subject: true,
                faculty: { select: { id: true, name: true } }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.json({
            success: true,
            data: {
                version,
                batch: student.batch,
                slots
            }
        });
    } catch (error: any) {
        console.error('Error fetching student timetable:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get student's timetable for today
router.get('/student/today', async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user?.id;

        if (!studentId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get student's batch
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                batch: { select: { BatchId: true, currentSemester: true } }
            }
        });

        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: 'Student batch not found' });
        }

        const today = new Date();
        const dayOfWeek = today.getDay();
        const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;

        // Get active timetable version
        const version = await prisma.timetableVersion.findFirst({
            where: {
                semester: student.batch.currentSemester,
                isActive: true,
                validFrom: { lte: today },
                OR: [
                    { validTo: null },
                    { validTo: { gte: today } }
                ]
            },
            orderBy: { validFrom: 'desc' }
        });

        if (!version) {
            return res.json({ success: true, data: [] });
        }

        const todaySlots = await prisma.timetableSlot.findMany({
            where: {
                timetableVersionId: version.id,
                batchId: student.batch.BatchId,
                dayOfWeek: adjustedDay,
                isActive: true
            },
            include: {
                subject: true,
                faculty: { select: { id: true, name: true } }
            },
            orderBy: { startTime: 'asc' }
        });

        res.json({ success: true, data: todaySlots });
    } catch (error: any) {
        console.error('Error fetching today\'s timetable:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
