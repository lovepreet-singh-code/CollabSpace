import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { startKafkaConsumer, shutdownKafka } from "./kafka";
import { logger } from "./utils/logger";

async function start() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongoUri);
        logger.info("Connected to MongoDB");

        // Start Kafka Consumer
        await startKafkaConsumer();

        // Start Express Server
        const server = app.listen(config.port, () => {
            logger.info(`Notification service listening on port ${config.port}`);
        });

        // Graceful Shutdown
        const shutdown = async () => {
            logger.info("Shutting down...");
            await shutdownKafka();
            await mongoose.disconnect();
            server.close(() => {
                logger.info("Server closed");
                process.exit(0);
            });
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

    } catch (err) {
        logger.error("Failed to start service", err);
        process.exit(1);
    }
}

start();
