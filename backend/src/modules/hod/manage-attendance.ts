import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

// HOD: View attendance by batch
export async function viewBatchAttendance(req: Request, res: Response) {
    try {
        const { batchId } = req.params;
        const { subjectId, startDate, endDate } = req.query;

        const where: any = {
            batchId: parseInt(batchId)
        };

        if (subjectId) where.subjectId = parseInt(subjectId as string);
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }

        const sessions = await prisma.attendanceSession.findMany({
            where,
            include: {
                subject: true,
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        email: true
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

        // Get batch info
        const batch = await prisma.batches.findUnique({
            where: { BatchId: parseInt(batchId) },
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
        });

        return res.status(200).json({
            success: true,
            data: {
                batch,
                sessions,
                totalSessions: sessions.length
            }
        });

    } catch (error) {
        console.error("View batch attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// HOD: View individual student attendance
export async function viewStudentAttendance(req: Request, res: Response) {
    try {
        const { studentId } = req.params;

        const student = await prisma.user.findUnique({
            where: { id: parseInt(studentId) },
            include: {
                student: {
                    include: {
                        batch: true
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const attendanceRecords = await prisma.attendanceRecord.findMany({
            where: {
                studentId: parseInt(studentId)
            },
            include: {
                session: {
                    include: {
                        subject: true,
                        faculty: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                markedAt: 'desc'
            }
        });

        // Calculate subject-wise stats
        const subjectWise: any = {};
        attendanceRecords.forEach((record: any) => {
            const subjectId = record.session.subjectId;
            const subjectName = record.session.subject.name;

            if (!subjectWise[subjectId]) {
                subjectWise[subjectId] = {
                    subjectId,
                    subjectName,
                    totalClasses: 0,
                    present: 0,
                    absent: 0,
                    percentage: 0
                };
            }

            subjectWise[subjectId].totalClasses++;
            if (record.status === 'PRESENT' || record.status === 'LATE') {
                subjectWise[subjectId].present++;
            } else if (record.status === 'ABSENT') {
                subjectWise[subjectId].absent++;
            }
        });

        Object.keys(subjectWise).forEach(subjectId => {
            const data = subjectWise[subjectId];
            data.percentage = data.totalClasses > 0
                ? ((data.present / data.totalClasses) * 100).toFixed(2)
                : '0.00';
        });

        const totalClasses = attendanceRecords.length;
        const totalPresent = attendanceRecords.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
        const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : '0.00';

        return res.status(200).json({
            success: true,
            data: {
                student,
                overall: {
                    totalClasses,
                    present: totalPresent,
                    percentage: overallPercentage
                },
                subjectWise: Object.values(subjectWise),
                records: attendanceRecords
            }
        });

    } catch (error) {
        console.error("View student attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// HOD: Get attendance statistics for dashboard
export async function getAttendanceStats(req: Request, res: Response) {
    try {
        // Get total sessions conducted
        const totalSessions = await prisma.attendanceSession.count();

        // Get today's sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySessions = await prisma.attendanceSession.count({
            where: {
                date: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        // Get overall attendance percentage
        const totalRecords = await prisma.attendanceRecord.count();
        const presentRecords = await prisma.attendanceRecord.count({
            where: {
                OR: [
                    { status: 'PRESENT' },
                    { status: 'LATE' }
                ]
            }
        });

        const overallPercentage = totalRecords > 0
            ? ((presentRecords / totalRecords) * 100).toFixed(2)
            : '0.00';

        // Get low attendance students (< 75%)
        const students = await prisma.student.findMany({
            where: {
                isVerified: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        attendanceRecords: true
                    }
                }
            }
        });

        const lowAttendanceStudents = students.filter(student => {
            const records = student.user.attendanceRecords;
            if (records.length === 0) return false;

            const present = records.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
            const percentage = (present / records.length) * 100;

            return percentage < 75;
        }).map(student => ({
            id: student.user.id,
            name: student.user.name,
            rollNumber: student.rollNumber,
            totalClasses: student.user.attendanceRecords.length,
            present: student.user.attendanceRecords.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length,
            percentage: student.user.attendanceRecords.length > 0
                ? ((student.user.attendanceRecords.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length / student.user.attendanceRecords.length) * 100).toFixed(2)
                : '0.00'
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalSessions,
                todaySessions,
                overallPercentage,
                totalRecords,
                presentRecords,
                lowAttendanceCount: lowAttendanceStudents.length,
                lowAttendanceStudents: lowAttendanceStudents.slice(0, 10) // Top 10
            }
        });

    } catch (error) {
        console.error("Get attendance stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
