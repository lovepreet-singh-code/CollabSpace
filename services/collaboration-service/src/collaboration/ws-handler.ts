import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import * as Y from "yjs";
import { loadState, saveState, applyStoredStateToYDoc } from "./persistence";
import { publish, subscribe } from "../infra/redis";
import { sendTopic } from "../infra/kafka";

// y-websocket utils does not have types, so we use require
const utils = require("y-websocket/bin/utils");
const setupWSConnection = utils.setupWSConnection;
const docs: Map<string, any> = utils.docs;

const SAVE_DEBOUNCE_MS = 2000;
const saveTimers = new Map<string, NodeJS.Timeout>();

// Redis handler
subscribe("collab-updates", (message: { docName: string; update: string }) => {
    const { docName, update } = message;
    const doc = docs.get(docName);
    if (doc) {
        const updateBuffer = Buffer.from(update, "base64");
        Y.applyUpdate(doc, new Uint8Array(updateBuffer), "redis"); // Origin 'redis' to avoid echo
    }
});

export const handleConnection = (ws: WebSocket, req: IncomingMessage) => {
    const docName = req.url?.slice(1).split("?")[0] || "default";

    setupWSConnection(ws, req, { docName, gc: true });

    const doc = docs.get(docName);
    if (!doc) return;

    // Initialize if not already done
    if (!(doc as any).__initialized) {
        (doc as any).__initialized = true;
        initializeDoc(docName, doc);
    }
};

const initializeDoc = async (docName: string, doc: Y.Doc) => {
    // Load initial state
    const state = await loadState(docName);
    if (state) {
        applyStoredStateToYDoc(doc, state);
    }

    // Handle updates
    doc.on("update", (update: Uint8Array, origin: any) => {
        if (origin === "redis") return;

        // Publish to Redis
        const updateBase64 = Buffer.from(update).toString("base64");
        publish("collab-updates", { docName, update: updateBase64 });

        // Debounce save to DB
        if (saveTimers.has(docName)) clearTimeout(saveTimers.get(docName)!);

        saveTimers.set(docName, setTimeout(async () => {
            const fullState = Y.encodeStateAsUpdate(doc);
            await saveState(docName, fullState);

            // Notify via Kafka
            await sendTopic("document.saved", { docName, timestamp: new Date() });
        }, SAVE_DEBOUNCE_MS));
    });
};
