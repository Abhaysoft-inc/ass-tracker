import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()

const router = Router();

// student auth

// Student registration portal



router.post('/student/signup', async(req, res)=>{
    const {email, password, name, batch, course, rollNumber }  = req.body;

    // check if user is already registered

    const user = await prisma.user.findFirst({
        where:{
            OR:[
                {email:email},
                {student:{rollNumber:rollNumber}}
            ]
        },
        include:{
            student:true
        }
    })

    if(user){

        return res.status(400).json({
            error:"Email or Roll number already registered"
        });
    }

    // if(user) throw Error("Email or Roll Number is already registered!");

    const hashedPassword = await bcrypt.hash(password, 5);
    try {
        const newStudent = await prisma.user.create({
            data:{
                name:name,
                password: hashedPassword,
                email:email,
                type:"STUDENT",
                student:{
                    create:{
                        batch:batch,
                        course:course,
                        rollNumber:rollNumber,
                        isVerified:false,

                    }
                }
            }
        });

        if(!newStudent) throw new Error("Student Registration Failed");

         console.log("user successfully registered: ", newStudent);
            
            return res.status(200).json({
                msg:"Student registration successfull",
                student:newStudent
            });
    }

    catch(error){
        console.log(error);
        res.status(500).json({
            error:`Student Registration Failed: ${error}`
        })

    }
});

// Student login user

router.post('/student/login', async (req, res) => {
    const { email, password } = req.body;

    // find if user exists 

    try {

        const student = await prisma.user.findUnique({
            where:{
                email:email
            }
        });

        if(!student) return res.status(400).json({
            error:"Email or Password is incorrect"
        }) ;

        const isPasswordCorrect = await bcrypt.compare(password, student.password);

        if(!isPasswordCorrect) return res.status(401).json({
            error:"email or password is incorrectt"
        });

        res.status(200).json({
            msg:"User Login Success",
            student:student
        })

    } catch (error) {

    }


});

router.post('/faculty/login', async (req, res) => {
    const { email, password } = req.body;

    try {

    } catch (error) {

    }



});

router.post('/hod/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hod = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!hod) throw Error("Email or Password is Incorrect");

        const hashedPassword = hod.password;

        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordCorrect) throw Error("Email or Password is incorrect");

        return res.status(200).json({
            msg: "login successfull",
            hod: hod
        });


    } catch (error) {
        throw Error(`Something went wrong: ${error}`);
    }


})

export default router;