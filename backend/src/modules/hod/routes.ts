import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";

const router = Router();
const prisma = new PrismaClient();

// --------------   Students ----------------------

// View list of all students all branches, all batches

router.get("/view-all-students", async (req, res) => {

});

// View a particular student

router.get("/student/:id", async (req, res) => {

});

// View students of particular batch

router.get("/:batch/:students", async (req, res) => {

});

// Add a student

router.post("/add-student", async (req, res) => {
    const {email, password, name, rollno, branch, batch} = req.body;

    try {
        
    } catch (error) {
        
    }




});



// ---------------- Faculty ----------------

// View all faculty

router.get("/view-all-faculty", async (req, res) => {

});

// View info of a faculty

router.get("/faculty/:id", async (req, res) => {

});

// Add a faculty

router.post("/add-faculty", async (req, res) => {

});




// ---------------- Subject ----------------

// View all subject 

router.get("/view-all-subject", async (req, res) => {

});

// View info of a subject

router.get("/subject/:id", async (req, res) => {

});

// Add a subject

router.post("/add-subject", async (req, res) => {

});






