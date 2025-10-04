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
                student: true // joins student table
            }
        });

        const totalCount = await prisma.user.count();

        if (!students) throw Error("No Students found!");

        return res.status(200).json({
            students,
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
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
                student: {
                    select: {
                        rollNumber: true,
                        course: true,
                        batch: true,
                        isVerified: true
                    }
                }
            }
        });

        if (!student) return res.status(404).json({
            error: "Student not found"
        })

        return res.status(200).json({
            student
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
                    batch: batchId
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                type: true,
                student: {
                    select: {
                        batch: true,
                        rollNumber: true,
                        course: true,
                        isVerified: true
                    }
                }
            }
        });

        if (!students) return res.status(400).json({
            error: "no students found in this batch",
        });

        return res.status(200).json({
            students
        })

    } catch (error) {

    }


}

// add new student

export async function addNewStudent(req: Request, res: Response) {


}

// verify a student

export async function verifyStudent(req: Request, res: Response) {
    const userId = req.query.id;


    try {

    } catch (error) {

    }
}

