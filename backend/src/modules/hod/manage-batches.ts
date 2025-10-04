import { Response, Request } from "express";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

export async function viewBatches(req: Request, res: Response) {

    try {
        const batch = await prisma.batches.findMany({

        })
        res.send(batch);

        if (!batch) return res.send("hopoo")



    } catch (error) {

    }

}

export async function createBatch(req: Request, res: Response) {



    try {
        // Extract data from request body
        const { BatchName, course } = req.body;

        // Validation
        if (!BatchName || !course) {
            return res.status(400).json({
                success: false,
                message: "BatchName and course are required fields"
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