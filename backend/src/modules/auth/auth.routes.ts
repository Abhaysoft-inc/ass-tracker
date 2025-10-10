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



router.post('/student/signup', async (req, res) => {
    const { email, password, name, batch, course, rollNumber } = req.body;

    // check if user is already registered

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: email },
                { student: { rollNumber: rollNumber } }
            ]
        },
        include: {
            student: true
        }
    })

    if (user) {

        return res.status(400).json({
            error: "Email or Roll number already registered"
        });
    }

    // if(user) throw Error("Email or Roll Number is already registered!");

    const hashedPassword = await hashPassword(password);
    try {
        const newStudent = await prisma.user.create({
            data: {
                name: name,
                password: hashedPassword,
                email: email,
                type: "STUDENT",
                student: {
                    create: {
                        batch: batch,
                        course: course,
                        rollNumber: rollNumber,
                        isVerified: false,

                    }
                }
            }
        });

        if (!newStudent) throw new Error("Student Registration Failed");

        console.log("user successfully registered: ", newStudent);
        const jwt_token = await jwt.sign({
            newStudent
        }, JWT_SECRET);

        //  console.log(jwt_token);


        return res.status(200).json({
            msg: "Student registration successfull",
            student: newStudent,
            token: jwt_token
        });
    }

    catch (error) {
        console.log(error);
        res.status(500).json({
            error: `Student Registration Failed: ${error}`
        })

    }
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

        const jwt_token = await jwt.sign({ student }, JWT_SECRET);

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

    try {

        const faculty = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });

        if (!faculty) return res.status(500).json({ error: "Email or password is incorrect" });

        const isPasswordCorrect = await bcrypt.compare(password, faculty.password);
        if (!isPasswordCorrect) return res.send(500).json({ error: "email or password is incorrect" });

        const jwt_token = jwt.sign({ faculty }, JWT_SECRET);

        return res.status(200).json({
            msg: "faculty login success",
            jwt_token,
            faculty
        })
    } catch (error) {

        console.log(error);
        return res.status(401).json({
            error: `something went wrong : ${error}`,
        })

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

        return res.status(200).json({
            msg: "login successfull",
            hod: hod
        });

    } catch (error) {
        console.log("HOD login error:", error);
        return res.status(500).json({
            error: `Something went wrong: ${error}`
        });
    }
});

export default router;