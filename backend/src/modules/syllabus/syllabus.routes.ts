import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";
import { authenticateStudent, authenticateFaculty, authenticateHOD } from "../../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// ================== HOD ROUTES ==================

// Create syllabus structure for a subject
router.post("/hod/subjects/:subjectId/syllabus", authenticateHOD, async (req, res) => {
    try {
        const hodId = req.user?.id;
        const subjectId = parseInt(req.params.subjectId);
        const { units } = req.body; // Array of units with topics

        if (!units || !Array.isArray(units) || units.length === 0) {
            return res.status(400).json({ success: false, message: "Units array is required" });
        }

        // Verify subject belongs to HOD's department
        const subject = await prisma.subject.findFirst({
            where: {
                id: subjectId,
                // Check if HOD has authority over this subject's department
            }
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        // Create units and topics in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const createdUnits = [];

            for (const unitData of units) {
                // Create unit
                const unit = await tx.syllabusUnit.create({
                    data: {
                        subjectId: subjectId,
                        unitNumber: unitData.unitNumber,
                        title: unitData.title,
                        description: unitData.description,
                        weightage: unitData.weightage || 0
                    }
                });

                // Create topics for this unit
                const topics = [];
                if (unitData.topics && Array.isArray(unitData.topics)) {
                    for (const topicData of unitData.topics) {
                        const topic = await tx.syllabusTopic.create({
                            data: {
                                unitId: unit.id,
                                topicNumber: topicData.topicNumber,
                                title: topicData.title,
                                description: topicData.description,
                                estimatedHours: topicData.estimatedHours || 1
                            }
                        });
                        topics.push(topic);
                    }
                }

                createdUnits.push({ ...unit, topics });
            }

            return createdUnits;
        });

        res.json({
            success: true,
            data: result,
            message: "Syllabus structure created successfully"
        });

    } catch (error) {
        console.error("Create syllabus error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get syllabus structure for a subject
router.get("/hod/subjects/:subjectId/syllabus", authenticateHOD, async (req, res) => {
    try {
        const subjectId = parseInt(req.params.subjectId);

        // Get syllabus structure
        const units = await prisma.syllabusUnit.findMany({
            where: { subjectId },
            include: {
                topics: {
                    orderBy: { topicNumber: 'asc' }
                }
            },
            orderBy: { unitNumber: 'asc' }
        });

        res.json({ success: true, data: { subjectId, units } });

    } catch (error) {
        console.error("Get syllabus structure error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get syllabus progress across all batches for HOD's department
router.get("/hod/syllabus-progress", authenticateHOD, async (req, res) => {
    try {
        const hodId = req.user?.id;
        const { subjectId, batchId } = req.query;

        // Get HOD details
        const hod = await prisma.hod.findUnique({
            where: { userId: hodId },
            select: { department: true }
        });

        if (!hod) {
            return res.status(404).json({ success: false, message: "HOD not found" });
        }

        // Build filters
        const filters: any = {
            subject: { department: hod.department }
        };

        if (subjectId) filters.subjectId = parseInt(subjectId as string);
        if (batchId) filters.batchId = parseInt(batchId as string);

        // Get progress data
        const progress = await prisma.syllabusProgress.findMany({
            where: filters,
            include: {
                faculty: { select: { id: true, name: true } },
                batch: { select: { BatchId: true, BatchName: true } },
                subject: { select: { id: true, name: true, code: true } },
                unit: { select: { id: true, title: true, unitNumber: true } }
            },
            orderBy: [
                { subject: { name: 'asc' } },
                { batch: { BatchName: 'asc' } },
                { unit: { unitNumber: 'asc' } }
            ]
        });

        res.json({ success: true, data: progress });

    } catch (error) {
        console.error("Get syllabus progress error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ================== FACULTY ROUTES ==================

// Get syllabus for subjects taught by faculty
router.get("/faculty/my-syllabus", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const { batchId, subjectId } = req.query;

        // Build filters for faculty's subjects
        const filters: any = {
            facultyId: facultyId,
            isActive: true
        };

        if (batchId) filters.batchId = parseInt(batchId as string);
        if (subjectId) filters.subjectId = parseInt(subjectId as string);

        // Get faculty's subject assignments
        const assignments = await prisma.facultyBatchSubject.findMany({
            where: filters,
            include: {
                subject: {
                    include: {
                        syllabusUnits: {
                            include: {
                                topics: {
                                    orderBy: { topicNumber: 'asc' }
                                }
                            },
                            orderBy: { unitNumber: 'asc' }
                        }
                    }
                },
                batch: {
                    select: { BatchId: true, BatchName: true, course: true }
                }
            }
        });

        res.json({ success: true, data: assignments });

    } catch (error) {
        console.error("Get faculty syllabus error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Update syllabus progress
router.put("/faculty/syllabus-progress", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const { batchId, subjectId, unitId, status, completionPercent, notes, topicProgress } = req.body;

        if (!batchId || !subjectId || !unitId) {
            return res.status(400).json({
                success: false,
                message: "batchId, subjectId, and unitId are required"
            });
        }

        // Verify faculty teaches this subject to this batch
        const assignment = await prisma.facultyBatchSubject.findFirst({
            where: {
                facultyId: facultyId,
                batchId: parseInt(batchId),
                subjectId: parseInt(subjectId),
                isActive: true
            }
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update progress for this subject/batch"
            });
        }

        // Update or create unit progress
        const unitProgress = await prisma.syllabusProgress.upsert({
            where: {
                facultyId_batchId_subjectId_unitId: {
                    facultyId: facultyId,
                    batchId: parseInt(batchId),
                    subjectId: parseInt(subjectId),
                    unitId: parseInt(unitId)
                }
            },
            update: {
                status: status || undefined,
                completionPercent: completionPercent !== undefined ? parseInt(completionPercent) : undefined,
                notes: notes,
                ...(status === 'IN_PROGRESS' && { startedAt: new Date() }),
                ...(status === 'COMPLETED' && { completedAt: new Date() })
            },
            create: {
                facultyId: facultyId,
                batchId: parseInt(batchId),
                subjectId: parseInt(subjectId),
                unitId: parseInt(unitId),
                status: status || 'NOT_STARTED',
                completionPercent: completionPercent ? parseInt(completionPercent) : 0,
                notes: notes,
                ...(status === 'IN_PROGRESS' && { startedAt: new Date() }),
                ...(status === 'COMPLETED' && { completedAt: new Date() })
            },
            include: {
                unit: { select: { title: true, unitNumber: true } }
            }
        });

        // Update topic progress if provided
        if (topicProgress && Array.isArray(topicProgress)) {
            for (const topicData of topicProgress) {
                if (topicData.topicId) {
                    await prisma.syllabusTopicProgress.upsert({
                        where: {
                            facultyId_batchId_topicId: {
                                facultyId: facultyId,
                                batchId: parseInt(batchId),
                                topicId: parseInt(topicData.topicId)
                            }
                        },
                        update: {
                            status: topicData.status || undefined,
                            taughtAt: topicData.taughtAt ? new Date(topicData.taughtAt) : undefined,
                            sessionId: topicData.sessionId || undefined,
                            notes: topicData.notes
                        },
                        create: {
                            facultyId: facultyId,
                            batchId: parseInt(batchId),
                            topicId: parseInt(topicData.topicId),
                            status: topicData.status || 'NOT_STARTED',
                            taughtAt: topicData.taughtAt ? new Date(topicData.taughtAt) : undefined,
                            sessionId: topicData.sessionId || undefined,
                            notes: topicData.notes
                        }
                    });
                }
            }
        }

        res.json({
            success: true,
            data: unitProgress,
            message: "Syllabus progress updated successfully"
        });

    } catch (error) {
        console.error("Update syllabus progress error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get detailed progress for a specific subject-batch combination
router.get("/faculty/syllabus-progress/:subjectId/:batchId", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const subjectId = parseInt(req.params.subjectId);
        const batchId = parseInt(req.params.batchId);

        // Verify authorization
        const assignment = await prisma.facultyBatchSubject.findFirst({
            where: {
                facultyId: facultyId,
                batchId: batchId,
                subjectId: subjectId,
                isActive: true
            }
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view progress for this subject/batch"
            });
        }

        // Get syllabus structure with progress
        const units = await prisma.syllabusUnit.findMany({
            where: { subjectId },
            include: {
                topics: {
                    include: {
                        progress: {
                            where: {
                                facultyId: facultyId,
                                batchId: batchId
                            }
                        }
                    },
                    orderBy: { topicNumber: 'asc' }
                },
                progress: {
                    where: {
                        facultyId: facultyId,
                        batchId: batchId
                    }
                }
            },
            orderBy: { unitNumber: 'asc' }
        });

        res.json({ success: true, data: { subjectId, batchId, units } });

    } catch (error) {
        console.error("Get detailed syllabus progress error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ================== STUDENT ROUTES ==================

// Get syllabus and progress for student's subjects
router.get("/student/my-syllabus", authenticateStudent, async (req, res) => {
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

        // Get subjects for student's semester and their syllabus
        const subjects = await prisma.subject.findMany({
            where: {
                department: student.batch.course,
                semester: student.batch.currentSemester
            },
            include: {
                syllabusUnits: {
                    include: {
                        topics: {
                            include: {
                                progress: {
                                    where: {
                                        batchId: student.batch.BatchId
                                    },
                                    include: {
                                        faculty: {
                                            select: { id: true, name: true }
                                        }
                                    }
                                }
                            },
                            orderBy: { topicNumber: 'asc' }
                        },
                        progress: {
                            where: {
                                batchId: student.batch.BatchId
                            },
                            include: {
                                faculty: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    },
                    orderBy: { unitNumber: 'asc' }
                },
                facultyBatchSubjects: {
                    where: {
                        batchId: student.batch.BatchId,
                        isActive: true
                    },
                    include: {
                        faculty: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Calculate overall progress for each subject
        const subjectsWithProgress = subjects.map(subject => {
            const totalUnits = subject.syllabusUnits.length;
            const completedUnits = subject.syllabusUnits.filter(unit =>
                unit.progress.some(p => p.status === 'COMPLETED')
            ).length;

            const overallProgress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

            return {
                ...subject,
                overallProgress,
                totalUnits,
                completedUnits
            };
        });

        res.json({
            success: true,
            data: {
                batch: student.batch,
                subjects: subjectsWithProgress
            }
        });

    } catch (error) {
        console.error("Get student syllabus error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get detailed syllabus for a specific subject
router.get("/student/syllabus/:subjectId", authenticateStudent, async (req, res) => {
    try {
        const studentId = req.user?.id;
        const subjectId = parseInt(req.params.subjectId);

        // Get student batch
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            select: { batchId: true }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Get subject with detailed syllabus and progress
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                syllabusUnits: {
                    include: {
                        topics: {
                            include: {
                                progress: {
                                    where: {
                                        batchId: student.batchId
                                    }
                                }
                            },
                            orderBy: { topicNumber: 'asc' }
                        },
                        progress: {
                            where: {
                                batchId: student.batchId
                            }
                        }
                    },
                    orderBy: { unitNumber: 'asc' }
                },
                facultyBatchSubjects: {
                    where: {
                        batchId: student.batchId,
                        isActive: true
                    },
                    include: {
                        faculty: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        res.json({ success: true, data: subject });

    } catch (error) {
        console.error("Get subject syllabus details error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;