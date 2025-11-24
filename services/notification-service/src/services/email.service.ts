import nodemailer from "nodemailer";
import config from "../config";
import { logger } from "../utils/logger";
import { withRetry } from "../utils/retry";

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for other ports
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    if (!to) {
        logger.warn("Skipping email: No recipient provided");
        return false;
    }

    try {
        await withRetry(async () => {
            await transporter.sendMail({
                from: config.smtp.from,
                to,
                subject,
                html,
            });
        }, 3, 1000);
        logger.info(`Email sent to ${to}`);
        return true;
    } catch (err) {
        logger.error(`Failed to send email to ${to}`, err);
        return false;
    }
}
