import dotenv from "dotenv";

dotenv.config();

export default {
    port: process.env.PORT || 4006,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/collabspace_comments",
    kafka: {
        brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
        clientId: "comment-service",
    },
    userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:4001",
};
