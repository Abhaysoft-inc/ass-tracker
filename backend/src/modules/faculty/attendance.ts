import { Request, Response } from "express";
import { PrismaClient, AttendanceStatus } from "../../generated/prisma";

const prisma = new PrismaClient();

// Faculty: Create attendance session and mark attendance
export async function createAttendanceSession(req: Request, res: Response) {
    try {
        const { subjectId, batchId, date, startTime, endTime, topic, sessionType, attendance } = req.body;
        const facultyId = req.user?.id;

        if (!subjectId || !batchId || !date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Verify faculty teaches this subject to this batch
        const assignment = await prisma.facultyBatchSubject.findFirst({
            where: {
                facultyId,
                batchId: parseInt(batchId),
                subjectId: parseInt(subjectId),
                isActive: true
            }
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to teach this subject to this batch"
            });
        }

        // Create session with attendance records in transaction
        const session = await prisma.$transaction(async (tx) => {
            const newSession = await tx.attendanceSession.create({
                data: {
                    subjectId: parseInt(subjectId),
                    batchId: parseInt(batchId),
                    facultyId,
                    date: new Date(date),
                    startTime,
                    endTime,
                    topic: topic || null,
                    sessionType: sessionType || "LECTURE"
                }
            });

            // Mark attendance for each student
            if (attendance && Array.isArray(attendance)) {
                const attendanceRecords = attendance.map((record: any) => ({
                    sessionId: newSession.id,
                    studentId: record.studentId,
                    status: record.status || AttendanceStatus.ABSENT,
                    markedBy: facultyId,
                    remarks: record.remarks || null
                }));

                await tx.attendanceRecord.createMany({
                    data: attendanceRecords
                });
            }

            return newSession;
        });

        return res.status(201).json({
            success: true,
            message: "Attendance session created successfully",
            data: session
        });

    } catch (error) {
        console.error("Create attendance session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Faculty: Get their teaching assignments
export async function getMyTeachingAssignments(req: Request, res: Response) {
    try {
        const facultyId = req.user?.id;

        const assignments = await prisma.facultyBatchSubject.findMany({
            where: {
                facultyId,
                isActive: true
            },
            include: {
                subject: true,
                batch: {
                    include: {
                        students: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: assignments
        });

    } catch (error) {
        console.error("Get teaching assignments error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Faculty: Get students in a batch for attendance marking
export async function getStudentsForAttendance(req: Request, res: Response) {
    try {
        const { batchId, subjectId } = req.params;
        const facultyId = req.user?.id;

        // Verify faculty teaches this subject to this batch
        const assignment = await prisma.facultyBatchSubject.findFirst({
            where: {
                facultyId,
                batchId: parseInt(batchId),
                subjectId: parseInt(subjectId),
                isActive: true
            }
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to teach this subject to this batch"
            });
        }

        const students = await prisma.student.findMany({
            where: {
                batchId: parseInt(batchId),
                isVerified: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                rollNumber: 'asc'
            }
        });

        return res.status(200).json({
            success: true,
            data: students
        });

    } catch (error) {
        console.error("Get students for attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Faculty: Get attendance sessions they conducted
export async function getMyAttendanceSessions(req: Request, res: Response) {
    try {
        const facultyId = req.user?.id;
        const { subjectId, batchId, startDate, endDate } = req.query;

        const where: any = {
            facultyId
        };

        if (subjectId) where.subjectId = parseInt(subjectId as string);
        if (batchId) where.batchId = parseInt(batchId as string);
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }

        const sessions = await prisma.attendanceSession.findMany({
            where,
            include: {
                subject: true,
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true
                    }
                },
                records: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                student: {
                                    select: {
                                        rollNumber: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            data: sessions
        });

    } catch (error) {
        console.error("Get attendance sessions error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Update attendance record
export async function updateAttendanceRecord(req: Request, res: Response) {
    try {
        const { recordId } = req.params;
        const { status, remarks } = req.body;
        const facultyId = req.user?.id;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        // Verify the faculty owns this session
        const record = await prisma.attendanceRecord.findUnique({
            where: { id: parseInt(recordId) },
            include: {
                session: true
            }
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        if (record.session.facultyId !== facultyId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own attendance records"
            });
        }

        const updated = await prisma.attendanceRecord.update({
            where: { id: parseInt(recordId) },
            data: {
                status: status as AttendanceStatus,
                remarks: remarks || null,
                markedAt: new Date()
            }
        });

        return res.status(200).json({
            success: true,
            message: "Attendance record updated successfully",
            data: updated
        });

    } catch (error) {
        console.error("Update attendance record error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
