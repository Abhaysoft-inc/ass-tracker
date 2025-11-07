import { Router, Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { viewAllStudents, viewStudent, viewStudentsByBatch, verifyStudent, addNewStudent } from "./manage-students";
import { createBatch, viewBatches } from "./manage-batches";
import { viewAllFaculty, viewFaculty, addNewFaculty, updateFaculty, deleteFaculty } from "./manage-faculty";
import { viewBatchAttendance, viewStudentAttendance, getAttendanceStats } from "./manage-attendance";
import { authenticateHOD } from "../../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// --------------   Students ----------------------

// View list of all students all branches, all batches

router.get("/students", authenticateHOD, async (req: Request, res: Response) => {
    await viewAllStudents(req, res);
});

// View a particular student

router.get("/students/:id", authenticateHOD, async (req: Request, res: Response) => {
    viewStudent(req, res);
});

// View students of particular batch

router.get("/:batch/students", authenticateHOD, async (req, res) => {
    viewStudentsByBatch(req, res);

});

// Add a student

router.post("/add-student", authenticateHOD, async (req, res) => {
    await addNewStudent(req, res);
});

// verify a student

router.patch('/students/:id/verify', authenticateHOD, async (req, res) => {
    await verifyStudent(req, res);
})



// ---------------- Faculty ----------------

// View all faculty
router.get("/faculty", authenticateHOD, async (req, res) => {
    await viewAllFaculty(req, res);
});

// View info of a faculty
router.get("/faculty/:id", authenticateHOD, async (req, res) => {
    await viewFaculty(req, res);
});

// Add a faculty
router.post("/faculty", authenticateHOD, async (req, res) => {
    await addNewFaculty(req, res);
});

// Update faculty
router.put("/faculty/:id", authenticateHOD, async (req, res) => {
    await updateFaculty(req, res);
});

// Delete faculty
router.delete("/faculty/:id", authenticateHOD, async (req, res) => {
    await deleteFaculty(req, res);
});




// ---------------- Subject ----------------

// View all subjects
router.get("/subjects", authenticateHOD, async (req, res) => {
    try {
        const { department, semester, search } = req.query;

        const filters: any = {};

        if (department) {
            filters.department = department;
        }

        if (semester) {
            filters.semester = parseInt(semester as string);
        }

        if (search) {
            filters.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { code: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const subjects = await prisma.subject.findMany({
            where: filters,
            include: {
                facultyBatchSubjects: {
                    where: { isActive: true },
                    include: {
                        faculty: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        batch: {
                            select: {
                                BatchId: true,
                                BatchName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        sessions: true
                    }
                }
            },
            orderBy: [
                { semester: 'asc' },
                { name: 'asc' }
            ]
        });

        // Format the response
        const formattedSubjects = subjects.map(subject => ({
            SubjectID: subject.id,
            SubjectName: subject.name,
            SubjectCode: subject.code,
            department: subject.department,
            semester: subject.semester,
            credits: subject.credits,
            totalSessions: subject._count.sessions,
            assignments: subject.facultyBatchSubjects
        }));

        res.json({ success: true, data: formattedSubjects });
    } catch (error: any) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// View info of a subject
router.get("/subject/:id", authenticateHOD, async (req, res) => {
    try {
        const { id } = req.params;

        const subject = await prisma.subject.findUnique({
            where: { id: parseInt(id) },
            include: {
                facultyBatchSubjects: {
                    where: { isActive: true },
                    include: {
                        faculty: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        batch: {
                            select: {
                                BatchId: true,
                                BatchName: true,
                                course: true
                            }
                        }
                    }
                },
                sessions: {
                    orderBy: { date: 'desc' },
                    take: 10,
                    include: {
                        faculty: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        batch: {
                            select: {
                                BatchId: true,
                                BatchName: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        sessions: true,
                        timetableSlots: true
                    }
                }
            }
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        res.json({ success: true, data: subject });
    } catch (error: any) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Add a subject
router.post("/subjects", authenticateHOD, async (req, res) => {
    try {
        const { name, code, department, semester, credits } = req.body;

        // Validate required fields
        if (!name || !code || !department || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Name, code, department, and semester are required'
            });
        }

        // Check if subject code already exists
        const existingSubject = await prisma.subject.findUnique({
            where: { code }
        });

        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists'
            });
        }

        const subject = await prisma.subject.create({
            data: {
                name,
                code,
                department,
                semester: parseInt(semester),
                credits: credits ? parseInt(credits) : 3
            }
        });

        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            data: subject
        });
    } catch (error: any) {
        console.error('Error creating subject:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a subject
router.put("/subject/:id", authenticateHOD, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, department, semester, credits } = req.body;

        const subject = await prisma.subject.findUnique({
            where: { id: parseInt(id) }
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        // If code is being updated, check for uniqueness
        if (code && code !== subject.code) {
            const existingSubject = await prisma.subject.findUnique({
                where: { code }
            });

            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject code already exists'
                });
            }
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (code) updateData.code = code;
        if (department) updateData.department = department;
        if (semester) updateData.semester = parseInt(semester);
        if (credits) updateData.credits = parseInt(credits);

        const updatedSubject = await prisma.subject.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Subject updated successfully',
            data: updatedSubject
        });
    } catch (error: any) {
        console.error('Error updating subject:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete a subject
router.delete("/subject/:id", authenticateHOD, async (req, res) => {
    try {
        const { id } = req.params;

        const subject = await prisma.subject.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        sessions: true,
                        timetableSlots: true,
                        facultyBatchSubjects: true
                    }
                }
            }
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }

        // Check if subject has dependencies
        if (subject._count.sessions > 0 || subject._count.timetableSlots > 0 || subject._count.facultyBatchSubjects > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete subject with existing sessions, timetable slots, or assignments'
            });
        }

        await prisma.subject.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// ---------------- Attendance ----------------

// Get attendance statistics for dashboard
router.get("/attendance/stats", authenticateHOD, async (req, res) => {
    await getAttendanceStats(req, res);
});

// View attendance by batch
router.get("/attendance/batch/:batchId", authenticateHOD, async (req, res) => {
    await viewBatchAttendance(req, res);
});

// View individual student attendance
router.get("/attendance/student/:studentId", authenticateHOD, async (req, res) => {
    await viewStudentAttendance(req, res);
});


// ---------------- Batches ----------------

router.get('/batches', authenticateHOD, async (req, res) => {
    // res.send("hiii")

    viewBatches(req, res)



});

// Public endpoint to fetch active batches (no auth required)
router.get('/public/batches', async (req, res) => {
    try {
        // reuse the same implementation
        viewBatches(req, res);
    } catch (error) {
        console.error('Public batches error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/create-batch', authenticateHOD, async (req, res) => {
    await createBatch(req, res)
})

// ---------------- Announcements ----------------

// Create a new announcement
router.post('/announcements', authenticateHOD, async (req, res) => {
    try {
        const { title, content, department, batchId } = req.body;
        const hodId = req.user?.id;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                department: department || null,
                batchId: batchId ? parseInt(batchId) : null,
                hodId
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
            }
        });

        res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            announcement
        });

    } catch (error) {
        console.error("Create announcement error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all announcements by HOD
router.get('/announcements', authenticateHOD, async (req, res) => {
    try {
        const hodId = req.user?.id;

        const announcements = await prisma.announcement.findMany({
            where: {
                hodId,
                isActive: true
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

        res.json({ announcements });

    } catch (error) {
        console.error("Get announcements error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update an announcement
router.put('/announcements/:id', authenticateHOD, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, department, batchId } = req.body;
        const hodId = req.user?.id;

        const announcement = await prisma.announcement.update({
            where: {
                id: parseInt(id),
                hodId // Ensure HOD can only update their own announcements
            },
            data: {
                title,
                content,
                department: department || null,
                batchId: batchId ? parseInt(batchId) : null
            }
        });

        res.json({
            success: true,
            message: "Announcement updated successfully",
            announcement
        });

    } catch (error) {
        console.error("Update announcement error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete (deactivate) an announcement
router.delete('/announcements/:id', authenticateHOD, async (req, res) => {
    try {
        const { id } = req.params;
        const hodId = req.user?.id;

        await prisma.announcement.update({
            where: {
                id: parseInt(id),
                hodId
            },
            data: {
                isActive: false
            }
        });

        res.json({
            success: true,
            message: "Announcement deleted successfully"
        });

    } catch (error) {
        console.error("Delete announcement error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ==================== TIMETABLE MANAGEMENT ====================

// Create a new timetable version
router.post('/timetable/version', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const { name, academicYear, semester, validFrom, validTo } = req.body;
        const hodId = req.user?.id;

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
                            {
                                OR: [
                                    { validTo: { gte: new Date(validFrom) } },
                                    { validTo: null }
                                ]
                            }
                        ]
                    },
                    validTo ? {
                        AND: [
                            { validFrom: { lte: new Date(validTo) } },
                            {
                                OR: [
                                    { validTo: { gte: new Date(validTo) } },
                                    { validTo: null }
                                ]
                            }
                        ]
                    } : {}
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
router.get('/timetable/versions', authenticateHOD, async (req: Request, res: Response) => {
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

// Get a specific timetable version
router.get('/timetable/version/:versionId', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const { versionId } = req.params;

        const version = await prisma.timetableVersion.findUnique({
            where: { id: parseInt(versionId) },
            include: {
                slots: {
                    include: {
                        subject: true,
                        batch: true,
                        faculty: { select: { id: true, name: true, email: true } }
                    },
                    orderBy: [
                        { dayOfWeek: 'asc' },
                        { startTime: 'asc' }
                    ]
                },
                _count: {
                    select: { slots: true }
                }
            }
        });

        if (!version) {
            return res.status(404).json({ success: false, message: 'Timetable version not found' });
        }

        res.json({ success: true, data: version });
    } catch (error: any) {
        console.error('Error fetching timetable version:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a timetable version
router.put('/timetable/version/:versionId', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const { versionId } = req.params;
        const { name, academicYear, semester, validFrom, validTo, isActive } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (academicYear) updateData.academicYear = academicYear;
        if (semester) updateData.semester = parseInt(semester);
        if (validFrom) updateData.validFrom = new Date(validFrom);
        if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedVersion = await prisma.timetableVersion.update({
            where: { id: parseInt(versionId) },
            data: updateData,
            include: {
                _count: {
                    select: { slots: true }
                }
            }
        });

        res.json({
            success: true,
            message: 'Timetable version updated successfully',
            data: updatedVersion
        });
    } catch (error: any) {
        console.error('Error updating timetable version:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Add slots to a timetable version
router.post('/timetable/version/:versionId/slots', authenticateHOD, async (req: Request, res: Response) => {
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

        // Validate all subjects, batches, and faculty exist
        const subjectIds = [...new Set(slots.map((s: any) => parseInt(s.subjectId)))];
        const batchIds = [...new Set(slots.map((s: any) => parseInt(s.batchId)))];
        const facultyIds = [...new Set(slots.map((s: any) => parseInt(s.facultyId)))];

        const [subjects, batches, faculty] = await Promise.all([
            prisma.subject.findMany({ where: { id: { in: subjectIds } } }),
            prisma.batches.findMany({ where: { BatchId: { in: batchIds } } }),
            prisma.user.findMany({ where: { id: { in: facultyIds }, type: 'FACULTY' } })
        ]);

        if (subjects.length !== subjectIds.length) {
            return res.status(400).json({ success: false, message: 'One or more subjects not found' });
        }
        if (batches.length !== batchIds.length) {
            return res.status(400).json({ success: false, message: 'One or more batches not found' });
        }
        if (faculty.length !== facultyIds.length) {
            return res.status(400).json({ success: false, message: 'One or more faculty not found' });
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

// Get all slots for a specific version
router.get('/timetable/version/:versionId/slots', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const { versionId } = req.params;
        const { batchId, dayOfWeek } = req.query;

        const filters: any = {
            timetableVersionId: parseInt(versionId),
            isActive: true
        };

        if (batchId) filters.batchId = parseInt(batchId as string);
        if (dayOfWeek) filters.dayOfWeek = parseInt(dayOfWeek as string);

        const slots = await prisma.timetableSlot.findMany({
            where: filters,
            include: {
                subject: true,
                batch: { select: { BatchId: true, BatchName: true } },
                faculty: { select: { id: true, name: true, email: true } }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        res.json({ success: true, data: slots });
    } catch (error: any) {
        console.error('Error fetching timetable slots:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update a timetable slot
router.put('/timetable/slot/:slotId', authenticateHOD, async (req: Request, res: Response) => {
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

// Delete a timetable slot (soft delete)
router.delete('/timetable/slot/:slotId', authenticateHOD, async (req: Request, res: Response) => {
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
router.get('/timetable/batch/:batchId', authenticateHOD, async (req: Request, res: Response) => {
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
                select: { currentSemester: true, BatchName: true }
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
                data: { version: null, slots: [] }
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
                faculty: { select: { id: true, name: true, email: true } },
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

// Get all batches for timetable assignment
router.get('/timetable/batches', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const batches = await prisma.batches.findMany({
            where: { isActive: true },
            select: {
                BatchId: true,
                BatchName: true,
                course: true,
                currentSemester: true
            },
            orderBy: { BatchName: 'asc' }
        });

        res.json({ success: true, data: batches });
    } catch (error: any) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all subjects for timetable assignment
router.get('/timetable/subjects', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const { semester, department } = req.query;

        const filters: any = {};
        if (semester) filters.semester = parseInt(semester as string);
        if (department) filters.department = department;

        const subjects = await prisma.subject.findMany({
            where: filters,
            select: {
                id: true,
                name: true,
                code: true,
                department: true,
                semester: true,
                credits: true
            },
            orderBy: [
                { semester: 'asc' },
                { name: 'asc' }
            ]
        });

        // Format response to match frontend expectations
        const formattedSubjects = subjects.map(subject => ({
            SubjectID: subject.id,
            SubjectName: subject.name,
            SubjectCode: subject.code,
            department: subject.department,
            semester: subject.semester,
            credits: subject.credits
        }));

        res.json({ success: true, data: formattedSubjects });
    } catch (error: any) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get all faculty for timetable assignment
router.get('/timetable/faculty', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const { department } = req.query;

        const filters: any = {
            type: 'FACULTY',
            isActive: true
        };

        const faculty = await prisma.user.findMany({
            where: filters,
            select: {
                id: true,
                name: true,
                email: true,
                faculty: {
                    select: {
                        department: true,
                        phone: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Filter by department if specified
        const filteredFaculty = department
            ? faculty.filter(f => f.faculty?.department === department)
            : faculty;

        res.json({ success: true, data: filteredFaculty });
    } catch (error: any) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Clone a timetable version (create a copy)
router.post('/timetable/version/:versionId/clone', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const { versionId } = req.params;
        const { name, academicYear, semester, validFrom, validTo } = req.body;
        const hodId = req.user?.id;

        if (!hodId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Get the original version with slots
        const originalVersion = await prisma.timetableVersion.findUnique({
            where: { id: parseInt(versionId) },
            include: {
                slots: true
            }
        });

        if (!originalVersion) {
            return res.status(404).json({ success: false, message: 'Original timetable version not found' });
        }

        // Create new version
        const newVersion = await prisma.timetableVersion.create({
            data: {
                name: name || `${originalVersion.name} (Copy)`,
                academicYear: academicYear || originalVersion.academicYear,
                semester: semester ? parseInt(semester) : originalVersion.semester,
                validFrom: validFrom ? new Date(validFrom) : new Date(),
                validTo: validTo ? new Date(validTo) : null,
                createdBy: hodId,
                isActive: false // Don't activate automatically
            }
        });

        // Clone all slots
        if (originalVersion.slots.length > 0) {
            await prisma.timetableSlot.createMany({
                data: originalVersion.slots.map(slot => ({
                    timetableVersionId: newVersion.id,
                    dayOfWeek: slot.dayOfWeek,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    subjectId: slot.subjectId,
                    batchId: slot.batchId,
                    facultyId: slot.facultyId,
                    roomNumber: slot.roomNumber,
                    sessionType: slot.sessionType,
                    isActive: slot.isActive
                }))
            });
        }

        const clonedVersion = await prisma.timetableVersion.findUnique({
            where: { id: newVersion.id },
            include: {
                _count: {
                    select: { slots: true }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Timetable version cloned successfully',
            data: clonedVersion
        });
    } catch (error: any) {
        console.error('Error cloning timetable version:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get timetable statistics
router.get('/timetable/stats', authenticateHOD, async (req: Request, res: Response) => {
    try {
        const [totalVersions, activeVersions, totalSlots, activeSlots] = await Promise.all([
            prisma.timetableVersion.count(),
            prisma.timetableVersion.count({ where: { isActive: true } }),
            prisma.timetableSlot.count(),
            prisma.timetableSlot.count({ where: { isActive: true } })
        ]);

        // Get slots per batch
        const slotsPerBatch = await prisma.timetableSlot.groupBy({
            by: ['batchId'],
            where: { isActive: true },
            _count: true
        });

        // Get slots per faculty
        const slotsPerFaculty = await prisma.timetableSlot.groupBy({
            by: ['facultyId'],
            where: { isActive: true },
            _count: true
        });

        res.json({
            success: true,
            data: {
                totalVersions,
                activeVersions,
                totalSlots,
                activeSlots,
                slotsPerBatch: slotsPerBatch.length,
                slotsPerFaculty: slotsPerFaculty.length
            }
        });
    } catch (error: any) {
        console.error('Error fetching timetable stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;