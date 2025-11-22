import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 4003,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/collabspace_collab",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    kafkaBrokers: (process.env.KAFKA_BROKERS || "").split(",").filter(Boolean),
    kafkaClientId: process.env.KAFKA_CLIENT_ID || "collab-service",
};
