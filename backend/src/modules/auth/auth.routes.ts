import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import hashPassword from "../../utils/hashPassword";

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'thisissecret';

const router = Router();

// student auth

//  Student registration portal



router.post('/student/register', async (req, res) => {
    const { email, password, name, rollNumber, course, phone, batchId } = req.body;

    // Validation
    if (!email || !password || !name || !rollNumber || !course) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields: name, email, password, rollNumber, course"
        });
    }

    // Check if user is already registered
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.toLowerCase().trim() },
                    { student: { rollNumber: rollNumber.trim() } }
                ]
            },
            include: {
                student: true
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email or Roll number already registered"
            });
        }

        // Validate batch if provided
        if (batchId) {
            const batch = await prisma.batches.findUnique({
                where: { BatchId: parseInt(batchId) }
            });

            if (!batch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid batch selected"
                });
            }
        }

        const hashedPassword = await hashPassword(password);

        const newStudent = await prisma.user.create({
            data: {
                name: name.trim(),
                password: hashedPassword,
                email: email.toLowerCase().trim(),
                type: "STUDENT",
                student: {
                    create: {
                        rollNumber: rollNumber.trim(),
                        course: course.trim(),
                        phone: phone?.trim() || null,
                        batchId: batchId ? parseInt(batchId) : null,
                        isVerified: false
                    }
                }
            },
            include: {
                student: {
                    include: {
                        batch: true
                    }
                }
            }
        });

        console.log("Student successfully registered: ", newStudent.name);

        return res.status(201).json({
            success: true,
            message: "Registration successful! Your account is pending HOD verification.",
            data: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                rollNumber: newStudent.student?.rollNumber,
                course: newStudent.student?.course,
                isVerified: newStudent.student?.isVerified
            }
        });

    } catch (error) {
        console.error("Student Registration Error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});

// Alias for backward compatibility
router.post('/student/signup', async (req, res) => {
    // Use the same logic as register endpoint
    req.url = '/student/register';
    return;
});

// Student login user

router.post('/student/login', async (req, res) => {
    const { email, password } = req.body;

    // find if user exists 

    try {

        const student = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!student) return res.status(400).json({
            error: "Email or Password is incorrect"
        });

        const isPasswordCorrect = await bcrypt.compare(password, student.password);

        if (!isPasswordCorrect) return res.status(401).json({
            error: "email or password is incorrectt"
        });

        // Generate JWT token for Student (same format as HOD)
        const jwt_token = jwt.sign(
            {
                id: student.id,
                email: student.email,
                type: student.type
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            msg: "User Login Success",
            student: student,
            token: jwt_token
        })

    } catch (error) {

        console.log(error);
        return res.status(401).json({
            error: `Something went wrong: ${error}`
        })

    }


});


// Faculty Registration

router.post('/faculty/signup', async (req, res) => {

});


// Faculty login
router.post('/faculty/login', async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide email and password"
        });
    }

    try {
        const faculty = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase().trim(),
            },
            include: {
                faculty: true
            }
        });

        if (!faculty || faculty.type !== 'FACULTY') {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, faculty.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT token with faculty info
        const token = jwt.sign(
            {
                id: faculty.id,
                email: faculty.email,
                type: faculty.type,
                name: faculty.name
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log("Faculty login successful:", faculty.email);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: faculty.id,
                name: faculty.name,
                email: faculty.email,
                type: faculty.type,
                department: faculty.faculty?.department || null
            }
        });

    } catch (error) {
        console.error("Faculty login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// HOD Login
router.post('/hod/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hod = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!hod) {
            return res.status(400).json({
                error: "Email or Password is Incorrect"
            });
        }

        const hashedPassword = hod.password;

        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: "Email or Password is incorrect"
            });
        }

        // Generate JWT token for HOD
        const token = jwt.sign(
            {
                id: hod.id,
                email: hod.email,
                type: hod.type
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            msg: "login successfull",
            hod: hod,
            token: token
        });

    } catch (error) {
        console.log("HOD login error:", error);
        return res.status(500).json({
            error: `Something went wrong: ${error}`
        });
    }
});

export default router;