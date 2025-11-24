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

// Internal APIs for Version Service
app.get("/internal/documents/:docName/state", async (req, res) => {
    const { docName } = req.params;
    try {
        const { getDocumentState } = require("./collaboration/ws-handler");
        const state = await getDocumentState(docName);
        if (!state) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.setHeader("Content-Type", "application/octet-stream");
        res.send(state);
    } catch (err) {
        console.error("Error getting document state:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/internal/documents/:docName/restore", express.raw({ type: "application/octet-stream", limit: "50mb" }), async (req, res) => {
    const { docName } = req.params;
    try {
        const { restoreDocumentState } = require("./collaboration/ws-handler");
        const state = req.body;
        if (!Buffer.isBuffer(state)) {
            return res.status(400).json({ message: "Invalid body, expected binary" });
        }
        await restoreDocumentState(docName, state);
        res.json({ message: "Document restored successfully" });
    } catch (err) {
        console.error("Error restoring document:", err);
        res.status(500).json({ message: "Internal server error" });
    }
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
