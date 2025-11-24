import express from "express";
import cors from "cors";
import "express-async-errors";
import { config } from "./config";
import { connectMongo } from "./infra/database";
import { initKafkaConsumer } from "./infra/kafka";
import versionRoutes from "./routes/version.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/versions", versionRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "version-service" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal server error" });
});

const start = async () => {
    await connectMongo();
    await initKafkaConsumer();

    app.listen(config.port, () => {
        console.log(`Version service listening on port ${config.port}`);
    });
};

start().catch((err) => {
    console.error("Failed to start service:", err);
    process.exit(1);
});
