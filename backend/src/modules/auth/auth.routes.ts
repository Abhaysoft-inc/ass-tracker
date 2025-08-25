import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

const router = Router();

// student auth

// Student login user

router.post('/student/login', async (req, res) => {
    const { email, password } = req.body;

    // find if user exists 

    try {

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
        const hod = await prisma.hod.findUnique({
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
