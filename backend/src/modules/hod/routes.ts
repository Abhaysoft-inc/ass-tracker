import { Router, Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { viewAllStudents, viewStudent, viewStudentsByBatch, verifyStudent } from "./manage-students";
import { createBatch, viewBatches } from "./manage-batches";

const router = Router();
const prisma = new PrismaClient();

// --------------   Students ----------------------

// View list of all students all branches, all batches

router.get("/students", async (req: Request, res: Response) => {
    await viewAllStudents(req, res);
});

// View a particular student

router.get("/students/:id", async (req: Request, res: Response) => {
    viewStudent(req, res);
});

// View students of particular batch

router.get("/:batch/students", async (req, res) => {
    viewStudentsByBatch(req, res);

});

// Add a student

router.post("/add-student", async (req, res) => {
    const { email, password, name, rollno, branch, batch } = req.body;

    try {

    } catch (error) {

    }

});

// verify a student

router.patch('/students/:id/verify', async (req, res) => {
    await verifyStudent(req, res);
})



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


// ---------------- Batches ----------------

router.get('/batches', async (req, res) => {
    // res.send("hiii")

    viewBatches(req, res)



});

router.post('/create-batch', async (req, res) => {
    await createBatch(req, res)
})





export default router;