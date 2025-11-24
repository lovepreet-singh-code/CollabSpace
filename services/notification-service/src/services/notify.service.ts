import Notification from "../models/notification.model";
import { sendEmail } from "./email.service";
import { logger } from "../utils/logger";

interface EventPayload {
    docName?: string;
    userId?: string; // Recipient or Actor depending on context
    actionBy?: string; // The user who performed the action
    message?: string;
    meta?: any;
    collaborators?: string[]; // List of userIds to notify
}

export async function handleEvent(topic: string, payload: EventPayload) {
    try {
        const recipients = determineRecipients(topic, payload);
        if (recipients.length === 0) {
            logger.info(`No recipients for event ${topic}`);
            return;
        }

        for (const userId of recipients) {
            // Don't notify the user who performed the action
            if (userId === payload.actionBy) continue;

            const notificationData = createNotificationData(topic, payload, userId);

            // Dedup check (optional, based on eventId if present in meta)
            if (payload.meta?.eventId) {
                const exists = await Notification.findOne({ "data.eventId": payload.meta.eventId, userId });
                if (exists) {
                    logger.info(`Duplicate event ${payload.meta.eventId} for user ${userId}, skipping.`);
                    continue;
                }
            }

            const notification = await Notification.create(notificationData);
            logger.info(`Notification created for user ${userId}`);

            // Send Email (async, don't block)
            // In a real app, we'd fetch user email from user-service here.
            // For now, we assume we might have it or skip if not available.
            // We'll just log that we would send an email, or try if we had an email address.
            // Since we don't have the user's email in the payload usually, we'd need to fetch it.
            // For this implementation, I'll assume we skip actual email sending unless email is in payload
            // or we just log the intent.

            // TODO: Fetch user email from user-service
            // const user = await fetchUser(userId);
            // if (user.email) await sendEmail(user.email, notification.title, notification.message);

            // Mocking email send for demonstration if email is provided in meta
            if (payload.meta?.email) {
                const sent = await sendEmail(payload.meta.email, notification.title, notification.message);
                if (sent) {
                    notification.isSent = true;
                    notification.sentAt = new Date();
                    await notification.save();
                }
            }
        }
    } catch (err) {
        logger.error("Error handling event", err);
    }
}

function determineRecipients(topic: string, payload: EventPayload): string[] {
    // Logic to extract recipients.
    // In a real system, we might query document-service to get collaborators for a doc.
    // Here we rely on payload.collaborators or payload.userId

    const recipients: string[] = [];

    if (payload.collaborators && Array.isArray(payload.collaborators)) {
        recipients.push(...payload.collaborators);
    } else if (payload.userId) {
        // If it's a direct message or specific target
        recipients.push(payload.userId);
    }

    return [...new Set(recipients)]; // Unique
}

function createNotificationData(topic: string, payload: EventPayload, userId: string) {
    let type: any = "info";
    let title = "New Notification";
    let message = payload.message || "You have a new notification";

    switch (topic) {
        case "document.saved":
            type = "info";
            title = "Document Saved";
            message = `Document ${payload.docName} was saved by ${payload.actionBy}`;
            break;
        case "document.restored":
            type = "version";
            title = "Document Restored";
            message = `Document ${payload.docName} was restored to a previous version by ${payload.actionBy}`;
            break;
        case "document.shared":
            type = "share";
            title = "Document Shared";
            message = `${payload.actionBy} shared document ${payload.docName} with you`;
            break;
        case "comment.added":
            type = "comment";
            title = "New Comment";
            message = `${payload.actionBy} commented on ${payload.docName}`;
            break;
        case "collaborator.added":
            type = "info";
            title = "Collaborator Added";
            message = `${payload.actionBy} added a collaborator to ${payload.docName}`;
            break;
    }

    return {
        userId,
        type,
        title,
        message,
        data: { ...payload.meta, docName: payload.docName, actionBy: payload.actionBy },
        isRead: false,
        isSent: false,
    };
}
