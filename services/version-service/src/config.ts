import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 4004,
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/collabspace_versions",
    kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    kafkaClientId: "version-service",
    collaborationServiceUrl: process.env.COLLABORATION_SERVICE_URL || "http://localhost:4003",
};
