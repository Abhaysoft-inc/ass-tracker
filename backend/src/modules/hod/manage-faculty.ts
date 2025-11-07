import { Request, Response } from "express";
import { PrismaClient, UserType } from "../../generated/prisma";
import hashPassword from "../../utils/hashPassword";

const prisma = new PrismaClient();

// View all faculty
export async function viewAllFaculty(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const department = req.query.department as string;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            type: UserType.FACULTY,
            isActive: true
        };

        if (department && department !== 'all') {
            where.faculty = {
                department: department
            };
        }

        const faculty = await prisma.user.findMany({
            where,
            skip,
            take: limit,
            include: {
                faculty: {
                    select: {
                        phone: true,
                        department: true,
                        isHOD: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const totalCount = await prisma.user.count({ where });

        return res.status(200).json({
            success: true,
            data: faculty,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error("Error fetching faculty:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching faculty"
        });
    }
}

// View a single faculty member
export async function viewFaculty(req: Request, res: Response) {
    const facultyId = parseInt(req.params.id);

    if (isNaN(facultyId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Faculty ID"
        });
    }

    try {
        const faculty = await prisma.user.findUnique({
            where: {
                id: facultyId,
                type: UserType.FACULTY
            },
            select: {
                id: true,
                name: true,
                email: true,
                type: true,
                isActive: true,
                createdAt: true,
                faculty: {
                    select: {
                        phone: true,
                        department: true,
                        isHOD: true
                    }
                }
            }
        });

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: faculty
        });

    } catch (error) {
        console.error("Error fetching faculty:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Add new faculty
export async function addNewFaculty(req: Request, res: Response) {
    try {
        const { name, email, password, phone, department } = req.body;

        // Validation
        if (!name || !email || !password || !phone || !department) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already in use"
            });
        }

        const hashedPassword = await hashPassword(password);

        // Create user and faculty in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    type: UserType.FACULTY
                }
            });

            const faculty = await tx.faculty.create({
                data: {
                    userId: user.id,
                    phone: phone.trim(),
                    department: department.trim(),
                    isHOD: false
                }
            });

            return { user, faculty };
        });

        return res.status(201).json({
            success: true,
            message: "Faculty created successfully",
            data: {
                userId: result.user.id,
                name: result.user.name,
                email: result.user.email,
                department: result.faculty.department
            }
        });

    } catch (error) {
        console.error("Add faculty error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Update faculty
export async function updateFaculty(req: Request, res: Response) {
    const facultyId = parseInt(req.params.id);

    if (isNaN(facultyId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Faculty ID"
        });
    }

    try {
        const { name, phone, department } = req.body;

        // Check if faculty exists
        const existingFaculty = await prisma.user.findUnique({
            where: {
                id: facultyId,
                type: UserType.FACULTY
            },
            include: {
                faculty: true
            }
        });

        if (!existingFaculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found"
            });
        }

        // Update user and faculty in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: facultyId },
                data: {
                    ...(name && { name: name.trim() })
                }
            });

            const faculty = await tx.faculty.update({
                where: { userId: facultyId },
                data: {
                    ...(phone && { phone: phone.trim() }),
                    ...(department && { department: department.trim() })
                }
            });

            return { user, faculty };
        });

        return res.status(200).json({
            success: true,
            message: "Faculty updated successfully",
            data: {
                id: result.user.id,
                name: result.user.name,
                phone: result.faculty.phone,
                department: result.faculty.department
            }
        });

    } catch (error) {
        console.error("Update faculty error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Delete (deactivate) faculty
export async function deleteFaculty(req: Request, res: Response) {
    const facultyId = parseInt(req.params.id);

    if (isNaN(facultyId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Faculty ID"
        });
    }

    try {
        const existingFaculty = await prisma.user.findUnique({
            where: {
                id: facultyId,
                type: UserType.FACULTY
            }
        });

        if (!existingFaculty) {
            return res.status(404).json({
                success: false,
                message: "Faculty not found"
            });
        }

        await prisma.user.update({
            where: { id: facultyId },
            data: {
                isActive: false
            }
        });

        return res.status(200).json({
            success: true,
            message: "Faculty deleted successfully"
        });

    } catch (error) {
        console.error("Delete faculty error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
