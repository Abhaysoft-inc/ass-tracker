import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";
import { authenticateStudent, authenticateFaculty, authenticateHOD } from "../../middleware/auth";
import { notifyStudentsAboutAssignment, notifyStudentAboutGrade } from "../notifications/notifications.service";

const router = Router();
const prisma = new PrismaClient();

// ================== HOD ROUTES ==================

// Get all assignments for HOD's department
router.get("/hod/assignments", authenticateHOD, async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log('HOD assignments request - userId:', userId, 'user:', req.user);

        // Get HOD details
        const hod = await prisma.hod.findUnique({
            where: { userId },
            select: { department: true }
        });

        console.log('HOD found:', hod);

        if (!hod) {
            return res.status(404).json({ success: false, message: "HOD not found" });
        }

        // Get assignments for HOD's department
        const assignments = await prisma.assignment.findMany({
            where: {
                subject: {
                    department: hod.department
                }
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                batch: {
                    select: { BatchId: true, BatchName: true, course: true }
                },
                faculty: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ success: true, data: assignments });

    } catch (error) {
        console.error("Get HOD assignments error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ================== FACULTY ROUTES ==================

// Get assignments created by faculty
router.get("/faculty/my-assignments", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;

        const assignments = await prisma.assignment.findMany({
            where: {
                facultyId: facultyId
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                batch: {
                    select: { BatchId: true, BatchName: true, course: true }
                },
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ success: true, data: assignments });

    } catch (error) {
        console.error("Get faculty assignments error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Create new assignment
router.post("/faculty/assignments", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const { title, description, subjectId, batchId, totalMarks, dueDate, instructions, attachmentUrl } = req.body;

        // Validate required fields
        if (!title || !description || !subjectId || !batchId || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title, description, subjectId, batchId, dueDate"
            });
        }

        // Verify faculty teaches this subject to this batch
        const facultyBatchSubject = await prisma.facultyBatchSubject.findFirst({
            where: {
                facultyId: facultyId,
                batchId: parseInt(batchId),
                subjectId: parseInt(subjectId),
                isActive: true
            }
        });

        if (!facultyBatchSubject) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to create assignments for this subject/batch combination"
            });
        }

        // Create assignment
        const assignment = await prisma.assignment.create({
            data: {
                title,
                description,
                subjectId: parseInt(subjectId),
                batchId: parseInt(batchId),
                facultyId: facultyId,
                totalMarks: totalMarks ? parseInt(totalMarks) : 100,
                dueDate: new Date(dueDate),
                instructions,
                attachmentUrl,
                status: 'PUBLISHED' // Default to published
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                batch: {
                    select: { BatchId: true, BatchName: true, course: true }
                }
            }
        });

        // Send notifications to students
        await notifyStudentsAboutAssignment(assignment.id, assignment.batchId, facultyId);

        res.json({ success: true, data: assignment, message: "Assignment created successfully" });

    } catch (error) {
        console.error("Create assignment error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Update assignment
router.put("/faculty/assignments/:assignmentId", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const assignmentId = parseInt(req.params.assignmentId);
        const { title, description, totalMarks, dueDate, instructions, attachmentUrl, status } = req.body;

        // Check if assignment belongs to this faculty
        const existingAssignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                facultyId: facultyId
            }
        });

        if (!existingAssignment) {
            return res.status(404).json({ success: false, message: "Assignment not found or not authorized" });
        }

        // Update assignment
        const assignment = await prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(totalMarks && { totalMarks: parseInt(totalMarks) }),
                ...(dueDate && { dueDate: new Date(dueDate) }),
                ...(instructions !== undefined && { instructions }),
                ...(attachmentUrl !== undefined && { attachmentUrl }),
                ...(status && { status })
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                batch: {
                    select: { BatchId: true, BatchName: true, course: true }
                }
            }
        });

        res.json({ success: true, data: assignment, message: "Assignment updated successfully" });

    } catch (error) {
        console.error("Update assignment error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get assignment submissions for grading
router.get("/faculty/assignments/:assignmentId/submissions", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const assignmentId = parseInt(req.params.assignmentId);

        // Verify assignment belongs to this faculty
        const assignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                facultyId: facultyId
            }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found or not authorized" });
        }

        // Get all students in the batch and their submissions
        const batchStudents = await prisma.student.findMany({
            where: {
                batchId: assignment.batchId
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Get submissions for this assignment
        const submissions = await prisma.assignmentSubmission.findMany({
            where: {
                assignmentId: assignmentId
            },
            include: {
                student: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Create submission map for easy lookup
        const submissionMap = new Map(submissions.map(sub => [sub.studentId, sub]));

        // Combine student list with their submissions
        const studentSubmissions = batchStudents.map(student => ({
            student: student.user,
            submission: submissionMap.get(student.user.id) || {
                status: 'NOT_SUBMITTED',
                submittedAt: null,
                marks: null,
                feedback: null
            }
        }));

        res.json({ success: true, data: { assignment, submissions: studentSubmissions } });

    } catch (error) {
        console.error("Get assignment submissions error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Grade assignment submission
router.put("/faculty/submissions/:submissionId/grade", authenticateFaculty, async (req, res) => {
    try {
        const facultyId = req.user?.id;
        const submissionId = parseInt(req.params.submissionId);
        const { marks, feedback } = req.body;

        if (marks === undefined) {
            return res.status(400).json({ success: false, message: "Marks are required" });
        }

        // Verify submission belongs to faculty's assignment
        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                id: submissionId,
                assignment: {
                    facultyId: facultyId
                }
            }
        });

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found or not authorized" });
        }

        // Update submission with grade
        const updatedSubmission = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                marks: parseInt(marks),
                feedback,
                status: 'GRADED',
                gradedBy: facultyId,
                gradedAt: new Date()
            },
            include: {
                student: {
                    select: { id: true, name: true, email: true }
                },
                assignment: {
                    select: { id: true, title: true, totalMarks: true }
                }
            }
        });

        // Send notification to student about grade
        await notifyStudentAboutGrade(updatedSubmission.id);

        res.json({ success: true, data: updatedSubmission, message: "Submission graded successfully" });

    } catch (error) {
        console.error("Grade submission error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ================== STUDENT ROUTES ==================

// Get assignments for student's batch
router.get("/student/assignments", authenticateStudent, async (req, res) => {
    try {
        const studentId = req.user?.id;

        // Get student details
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                batch: {
                    select: {
                        BatchId: true,
                        BatchName: true,
                        course: true,
                        currentSemester: true
                    }
                }
            }
        });

        if (!student || !student.batch) {
            return res.status(404).json({ success: false, message: "Student batch not found" });
        }

        // Get assignments for student's batch
        const assignments = await prisma.assignment.findMany({
            where: {
                batchId: student.batch.BatchId,
                status: 'PUBLISHED'
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                faculty: {
                    select: { id: true, name: true }
                },
                submissions: {
                    where: {
                        studentId: studentId
                    },
                    select: {
                        id: true,
                        status: true,
                        submittedAt: true,
                        marks: true,
                        feedback: true
                    }
                }
            },
            orderBy: {
                dueDate: 'asc'
            }
        });

        // Transform to include submission status
        const assignmentsWithStatus = assignments.map(assignment => ({
            ...assignment,
            submission: assignment.submissions[0] || null,
            submissions: undefined // Remove the submissions array
        }));

        res.json({ success: true, data: assignmentsWithStatus });

    } catch (error) {
        console.error("Get student assignments error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Submit assignment
router.post("/student/assignments/:assignmentId/submit", authenticateStudent, async (req, res) => {
    try {
        const studentId = req.user?.id;
        const assignmentId = parseInt(req.params.assignmentId);
        const { content, attachmentUrl } = req.body;

        // Verify assignment exists and is published
        const assignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                status: 'PUBLISHED'
            }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found or not available for submission" });
        }

        // Check if student belongs to the assignment's batch
        const student = await prisma.student.findFirst({
            where: {
                userId: studentId,
                batchId: assignment.batchId
            }
        });

        if (!student) {
            return res.status(403).json({ success: false, message: "You are not authorized to submit this assignment" });
        }

        // Check if already submitted
        const existingSubmission = await prisma.assignmentSubmission.findFirst({
            where: {
                assignmentId: assignmentId,
                studentId: studentId
            }
        });

        const now = new Date();
        const isLate = now > assignment.dueDate;
        const submissionStatus = isLate ? 'LATE_SUBMISSION' : 'SUBMITTED';

        if (existingSubmission) {
            // Update existing submission
            const updatedSubmission = await prisma.assignmentSubmission.update({
                where: { id: existingSubmission.id },
                data: {
                    content,
                    attachmentUrl,
                    submittedAt: now,
                    status: submissionStatus
                },
                include: {
                    assignment: {
                        select: { id: true, title: true, dueDate: true }
                    }
                }
            });

            res.json({ success: true, data: updatedSubmission, message: "Assignment resubmitted successfully" });
        } else {
            // Create new submission
            const submission = await prisma.assignmentSubmission.create({
                data: {
                    assignmentId: assignmentId,
                    studentId: studentId,
                    content,
                    attachmentUrl,
                    submittedAt: now,
                    status: submissionStatus
                },
                include: {
                    assignment: {
                        select: { id: true, title: true, dueDate: true }
                    }
                }
            });

            res.json({ success: true, data: submission, message: "Assignment submitted successfully" });
        }

    } catch (error) {
        console.error("Submit assignment error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get specific assignment details for student
router.get("/student/assignments/:assignmentId", authenticateStudent, async (req, res) => {
    try {
        const studentId = req.user?.id;
        const assignmentId = parseInt(req.params.assignmentId);

        // Get assignment with submission status
        const assignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                status: 'PUBLISHED'
            },
            include: {
                subject: {
                    select: { id: true, name: true, code: true }
                },
                faculty: {
                    select: { id: true, name: true, email: true }
                },
                batch: {
                    select: { BatchId: true, BatchName: true }
                },
                submissions: {
                    where: {
                        studentId: studentId
                    }
                }
            }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Verify student belongs to this batch
        const student = await prisma.student.findFirst({
            where: {
                userId: studentId,
                batchId: assignment.batchId
            }
        });

        if (!student) {
            return res.status(403).json({ success: false, message: "You are not authorized to view this assignment" });
        }

        const response = {
            ...assignment,
            submission: assignment.submissions[0] || null,
            submissions: undefined // Remove the submissions array
        };

        res.json({ success: true, data: response });

    } catch (error) {
        console.error("Get assignment details error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;