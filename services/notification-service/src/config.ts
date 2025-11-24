import dotenv from "dotenv";

dotenv.config();

export default {
    port: process.env.PORT || 4005,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/collabspace_notifications",
    kafka: {
        brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
        clientId: process.env.KAFKA_CLIENT_ID || "notification-service",
        groupId: process.env.KAFKA_GROUP_ID || "notification-consumer",
    },
    smtp: {
        host: process.env.SMTP_HOST || "smtp.example.com",
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "pass",
        from: process.env.FROM_EMAIL || "no-reply@collabspace.local",
    },
    userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:4001",
    logLevel: process.env.LOG_LEVEL || "info",
};
