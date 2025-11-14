import { Router } from "express";
import { PrismaClient } from "../../generated/prisma";
import { authenticateStudent, authenticateFaculty, authenticateHOD } from "../../middleware/auth";
import { createBulkNotifications } from "./notifications.service";

const router = Router();
const prisma = new PrismaClient();

// ================== COMMON ROUTES ==================

// Get notifications for authenticated user
router.get("/my-notifications", async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, status, type } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        // Build where clause
        const where: any = { userId };
        if (status) where.status = status;
        if (type) where.type = type;

        // Get notifications with pagination
        const [notifications, totalCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                include: {
                    sender: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit as string)
            }),
            prisma.notification.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    total: totalCount,
                    pages: Math.ceil(totalCount / parseInt(limit as string))
                }
            }
        });

    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Mark notification as read
router.put("/notifications/:notificationId/read", async (req, res) => {
    try {
        const userId = req.user?.id;
        const notificationId = parseInt(req.params.notificationId);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        // Verify notification belongs to user
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId: userId
            }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        // Mark as read
        const updatedNotification = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                status: 'READ',
                readAt: new Date()
            }
        });

        res.json({ success: true, data: updatedNotification, message: "Notification marked as read" });

    } catch (error) {
        console.error("Mark notification as read error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Mark all notifications as read
router.put("/notifications/mark-all-read", async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        // Mark all unread notifications as read
        const result = await prisma.notification.updateMany({
            where: {
                userId: userId,
                status: 'UNREAD'
            },
            data: {
                status: 'READ',
                readAt: new Date()
            }
        });

        res.json({
            success: true,
            message: `${result.count} notifications marked as read`
        });

    } catch (error) {
        console.error("Mark all notifications as read error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get notification counts by status
router.get("/notification-stats", async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        // Get counts for each status
        const [unreadCount, readCount, totalCount] = await Promise.all([
            prisma.notification.count({
                where: { userId, status: 'UNREAD' }
            }),
            prisma.notification.count({
                where: { userId, status: 'READ' }
            }),
            prisma.notification.count({
                where: { userId }
            })
        ]);

        res.json({
            success: true,
            data: {
                unread: unreadCount,
                read: readCount,
                total: totalCount
            }
        });

    } catch (error) {
        console.error("Get notification stats error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ================== HOD ROUTES ==================

// Send notification to specific users or groups
router.post("/hod/send-notification", authenticateHOD, async (req, res) => {
    try {
        const hodId = req.user?.id;
        const { title, message, type, recipients, batchIds, department } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }

        let targetUserIds: number[] = [];

        if (recipients && recipients.length > 0) {
            // Direct recipients
            targetUserIds = recipients;
        } else if (batchIds && batchIds.length > 0) {
            // Send to specific batches
            const students = await prisma.student.findMany({
                where: {
                    batchId: { in: batchIds }
                },
                select: { userId: true }
            });
            targetUserIds = students.map(s => s.userId);
        } else if (department) {
            // Send to all students in department
            const students = await prisma.student.findMany({
                where: {
                    course: department
                },
                select: { userId: true }
            });
            targetUserIds = students.map(s => s.userId);
        }

        if (targetUserIds.length === 0) {
            return res.status(400).json({ success: false, message: "No recipients specified" });
        }

        // Create notifications for all recipients
        const notifications = targetUserIds.map(userId => ({
            title,
            message,
            type: type || 'GENERAL',
            userId,
            senderId: hodId
        }));

        const result = await createBulkNotifications(notifications);

        res.json({
            success: true,
            message: `Notification sent to ${targetUserIds.length} recipients`,
            data: { count: result.count }
        });

    } catch (error) {
        console.error("Send notification error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get batches for HOD's department (for notification targeting)
router.get("/hod/batches", authenticateHOD, async (req, res) => {
    try {
        const userId = req.user?.id;

        // Get HOD details
        const hod = await prisma.hod.findUnique({
            where: { userId },
            select: { department: true }
        });

        if (!hod) {
            return res.status(404).json({ success: false, message: "HOD not found" });
        }

        // Get batches in HOD's department
        const batches = await prisma.batches.findMany({
            where: {
                course: hod.department,
                isActive: true
            },
            include: {
                _count: {
                    select: { students: true }
                }
            },
            orderBy: {
                BatchName: 'asc'
            }
        });

        res.json({ success: true, data: batches });

    } catch (error) {
        console.error("Get HOD batches error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;