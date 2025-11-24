import { Request, Response } from "express";
import Notification from "../models/notification.model";

export async function listNotifications(req: Request, res: Response) {
    const userId = req.query.userId as string || (req as any).user?.id;
    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    const limit = Number(req.query.limit) || 20;
    const skip = Number(req.query.skip) || 0;
    const unreadOnly = req.query.unreadOnly === "true";

    const query: any = { userId };
    if (unreadOnly) {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Notification.countDocuments(query);

    res.json({
        data: notifications,
        meta: {
            total,
            limit,
            skip,
            unreadOnly,
        },
    });
}

export async function markRead(req: Request, res: Response) {
    const userId = req.body.userId || (req as any).user?.id;
    const { ids } = req.body;

    if (!userId || !Array.isArray(ids)) {
        return res.status(400).json({ message: "userId and ids array required" });
    }

    await Notification.updateMany(
        { _id: { $in: ids }, userId },
        { $set: { isRead: true } }
    );

    res.json({ message: "Notifications marked as read" });
}

export async function markAllRead(req: Request, res: Response) {
    const userId = req.body.userId || (req as any).user?.id;

    if (!userId) {
        return res.status(400).json({ message: "userId required" });
    }

    await Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
}

export async function deleteNotification(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.query.userId as string || (req as any).user?.id; // Ideally from auth token

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await Notification.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Notification not found or access denied" });
    }

    res.json({ message: "Notification deleted" });
}
