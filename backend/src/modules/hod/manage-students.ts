import { Router, Request, Response } from "express";
import { PrismaClient, UserType } from "../../generated/prisma";

const prisma = new PrismaClient();


export async function viewAllStudents(req: Request, res: Response) {

    // I have 10000 students right, if I fetch all the student everytime this this is a very big issue,
    // how can i solve this
    // Solution: Introducing paginations

    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        // calculate and skip

        const skip = (page - 1) * limit;
        const students = await prisma.user.findMany({
            where: {
                type: UserType.STUDENT,

            },
            skip,
            take: limit,
            include: {
                student: {
                    include: {
                        batch: true // Include batch information with current semester
                    }
                }
            }
        });

        const totalCount = await prisma.user.count();

        if (!students) throw Error("No Students found!");

        return res.status(200).json({
            success: true,
            data: students,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });




    } catch (error) {

        res.status(500).json({
            error
        })

    }

}

// view a single student data


export async function viewStudent(req: Request, res: Response) {
    const studentId = parseInt(req.params.id);

    // validating student id

    if (isNaN(studentId)) return res.status(400).json({ error: "Invalid Student ID" });

    try {
        const student = await prisma.user.findUnique({
            where: {
                id: studentId,
                type: UserType.STUDENT
            },
            select: {
                id: true,
                name: true,
                email: true,
                type: true,
                createdAt: true,
                student: {
                    select: {
                        rollNumber: true,
                        course: true,
                        phone: true,
                        isVerified: true,
                        batch: {
                            select: {
                                BatchId: true,
                                BatchName: true,
                                course: true,
                                currentSemester: true
                            }
                        }
                    }
                }
            }
        });

        if (!student) return res.status(404).json({
            success: false,
            message: "Student not found"
        })

        return res.status(200).json({
            success: true,
            data: student
        })
    } catch (error) {

        res.status(500).json({
            error
        })

    }

}

// View students by batch

export async function viewStudentsByBatch(req: Request, res: Response) {
    const batchId = parseInt(req.params.batch);

    try {

        const students = await prisma.user.findMany({
            where: {
                type: UserType.STUDENT,
                student: {
                    batchId: batchId
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                type: true,
                student: {
                    select: {
                        rollNumber: true,
                        course: true,
                        phone: true,
                        isVerified: true,
                        batch: {
                            select: {
                                BatchId: true,
                                BatchName: true,
                                course: true,
                                currentSemester: true
                            }
                        }
                    }
                }
            }
        });

        if (!students || students.length === 0) return res.status(404).json({
            success: false,
            message: "No students found in this batch"
        });

        return res.status(200).json({
            success: true,
            data: students
        })

    } catch (error) {

    }


}

// add new student

export async function addNewStudent(req: Request, res: Response) {


}

// verify a student

export async function verifyStudent(req: Request, res: Response) {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) return res.status(400).json({
        success: false,
        message: "Invalid Student ID"
    });

    try {
        const student = await prisma.user.findUnique({
            where: {
                id: studentId,
                type: UserType.STUDENT
            },
            include: {
                student: true
            }
        });

        if (!student) return res.status(404).json({
            success: false,
            message: "Student not found"
        });

        if (student.student?.isVerified) return res.status(400).json({
            success: false,
            message: "Student is already verified"
        });

        await prisma.student.update({
            where: {
                userId: studentId
            },
            data: {
                isVerified: true
            }
        });

        return res.status(200).json({
            success: true,
            message: "Student verified successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

