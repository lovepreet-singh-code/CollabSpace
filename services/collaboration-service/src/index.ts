import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { config } from "./config";
import { connectMongo } from "./infra/database";
import { initRedis } from "./infra/redis";
import { initKafka } from "./infra/kafka";
import { handleConnection } from "./collaboration/ws-handler";

const app = express();

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "collaboration-service" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
    handleConnection(ws, req);
});

const start = async () => {
    await connectMongo();
    initRedis();
    await initKafka();

    server.listen(config.port, () => {
        console.log(`Collaboration service listening on port ${config.port}`);
    });
};

start().catch((err) => {
    console.error("Failed to start service:", err);
    process.exit(1);
});
