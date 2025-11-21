import mongoose from "mongoose";
import config from "./config";
import app from "./app";

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB (document-service)");
    app.listen(config.port, () => {
      console.log(`Document service listening on port ${config.port}`);
    });
  } catch (err) {
    console.error("Failed to start document service", err);
    process.exit(1);
  }
}

start();
