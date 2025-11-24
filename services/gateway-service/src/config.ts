import dotenv from "dotenv";

dotenv.config();

export default {
    port: process.env.PORT || 8000,
    services: {
        user: process.env.USER_SERVICE_URL || "http://localhost:4001",
        document: process.env.DOC_SERVICE_URL || "http://localhost:4002",
        collaboration: process.env.COLLAB_SERVICE_URL || "http://localhost:4003",
        version: process.env.VERSION_SERVICE_URL || "http://localhost:4004",
        notification: process.env.NOTIF_SERVICE_URL || "http://localhost:4005",
    },
};
