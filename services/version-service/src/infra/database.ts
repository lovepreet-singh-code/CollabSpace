import mongoose from "mongoose";
import { config } from "../config";

export const connectMongo = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            await mongoose.connect(config.mongoUri);
            console.log("Connected to MongoDB (version-service)");
            return;
        } catch (error) {
            console.error(`Error connecting to MongoDB, retries left: ${retries}`, error);
            retries -= 1;
            if (retries === 0) {
                console.error("Failed to connect to MongoDB after multiple attempts");
                process.exit(1);
            }
            await new Promise((res) => setTimeout(res, delay));
        }
    }
};
