import { Response, Request } from "express";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

export async function viewBatches(req: Request, res: Response) {
    try {
        const batches = await prisma.batches.findMany({
            where: {
                isActive: true
            },
            include: {
                students: {
                    select: {
                        userId: true,
                        rollNumber: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            data: batches
        });

    } catch (error) {
        console.error("Error fetching batches:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching batches"
        });
    }
}

export async function createBatch(req: Request, res: Response) {



    try {
        // Extract data from request body
        const { BatchName, course, currentSemester } = req.body;

        // Validation
        if (!BatchName || !course) {
            return res.status(400).json({
                success: false,
                message: "BatchName and course are required fields"
            });
        }

        // Validate currentSemester if provided
        const semester = currentSemester ? parseInt(currentSemester) : 1;
        if (semester < 1 || semester > 8) {
            return res.status(400).json({
                success: false,
                message: "Current semester must be between 1 and 8"
            });
        }

        // Check if batch with same name and course already exists
        const existingBatch = await prisma.batches.findFirst({
            where: {
                BatchName: BatchName.trim(),
                course: course.trim(),
                isActive: true
            }
        });

        if (existingBatch) {
            return res.status(409).json({
                success: false,
                message: "A batch with this name and course already exists"
            });
        }

        // Create the new batch
        const newBatch = await prisma.batches.create({
            data: {
                BatchName: BatchName.trim(),
                course: course.trim(),
                currentSemester: semester,
                isActive: true
            },
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

        res.status(201).json({
            success: true,
            message: "Batch created successfully",
            data: newBatch
        });

    } catch (error) {
        console.error("Error creating batch:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while creating batch",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }




}