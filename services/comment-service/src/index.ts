import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { connectKafka } from "./kafka";
import { logger } from "./utils/logger";

const startServer = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        logger.info("Connected to MongoDB");

        await connectKafka();

        app.listen(config.port, () => {
            logger.info(`Comment Service running on port ${config.port}`);
        });
    } catch (err) {
        logger.error("Failed to start server", err);
        process.exit(1);
    }
};

startServer();
