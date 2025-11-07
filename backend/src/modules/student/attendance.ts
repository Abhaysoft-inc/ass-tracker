import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

// Student: Get their own attendance summary
export async function getMyAttendance(req: Request, res: Response) {
    try {
        const studentId = req.user?.id;

        // Get student's batch
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                batch: true
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        // Get all attendance records for this student
        const attendanceRecords = await prisma.attendanceRecord.findMany({
            where: {
                studentId
            },
            include: {
                session: {
                    include: {
                        subject: true,
                        batch: {
                            select: {
                                BatchName: true,
                                course: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                markedAt: 'desc'
            }
        });

        // Calculate subject-wise attendance
        const subjectWise: any = {};
        attendanceRecords.forEach(record => {
            const subjectId = record.session.subjectId;
            const subjectName = record.session.subject.name;
            const subjectCode = record.session.subject.code;

            if (!subjectWise[subjectId]) {
                subjectWise[subjectId] = {
                    subjectId,
                    subjectName,
                    subjectCode,
                    totalClasses: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                    percentage: 0
                };
            }

            subjectWise[subjectId].totalClasses++;

            if (record.status === 'PRESENT') subjectWise[subjectId].present++;
            else if (record.status === 'ABSENT') subjectWise[subjectId].absent++;
            else if (record.status === 'LATE') subjectWise[subjectId].late++;
            else if (record.status === 'EXCUSED') subjectWise[subjectId].excused++;
        });

        // Calculate percentages
        Object.keys(subjectWise).forEach(subjectId => {
            const data = subjectWise[subjectId];
            if (data.totalClasses > 0) {
                data.percentage = ((data.present + data.late) / data.totalClasses * 100).toFixed(2);
            }
        });

        // Calculate overall attendance
        const totalClasses = attendanceRecords.length;
        const totalPresent = attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
        const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : '0.00';

        return res.status(200).json({
            success: true,
            data: {
                overall: {
                    totalClasses,
                    present: attendanceRecords.filter(r => r.status === 'PRESENT').length,
                    absent: attendanceRecords.filter(r => r.status === 'ABSENT').length,
                    late: attendanceRecords.filter(r => r.status === 'LATE').length,
                    excused: attendanceRecords.filter(r => r.status === 'EXCUSED').length,
                    percentage: overallPercentage
                },
                subjectWise: Object.values(subjectWise),
                recentRecords: attendanceRecords.slice(0, 20) // Last 20 records
            }
        });

    } catch (error) {
        console.error("Get student attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Student: Get attendance for a specific subject
export async function getSubjectAttendance(req: Request, res: Response) {
    try {
        const studentId = req.user?.id;
        const { subjectId } = req.params;

        const attendanceRecords = await prisma.attendanceRecord.findMany({
            where: {
                studentId,
                session: {
                    subjectId: parseInt(subjectId)
                }
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
                session: {
                    date: 'desc'
                }
            }
        });

        const totalClasses = attendanceRecords.length;
        const present = attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
        const percentage = totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(2) : '0.00';

        return res.status(200).json({
            success: true,
            data: {
                subject: attendanceRecords[0]?.session.subject || null,
                totalClasses,
                present,
                percentage,
                records: attendanceRecords
            }
        });

    } catch (error) {
        console.error("Get subject attendance error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
