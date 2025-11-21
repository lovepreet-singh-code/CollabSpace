import mongoose from "mongoose";
import config from "./config";
import app from "./app";

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");
    app.listen(config.port, () => {
      console.log(`User service listening on port ${config.port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
