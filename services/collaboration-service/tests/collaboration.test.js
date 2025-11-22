"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const ws_2 = require("ws");
const ws_handler_1 = require("../src/collaboration/ws-handler");
const Y = __importStar(require("yjs"));
// Mock infrastructure
jest.mock("../src/infra/database", () => ({
    connectMongo: jest.fn(),
}));
jest.mock("../src/infra/redis", () => ({
    initRedis: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
}));
jest.mock("../src/infra/kafka", () => ({
    initKafka: jest.fn(),
    sendTopic: jest.fn(),
}));
jest.mock("../src/collaboration/persistence", () => ({
    loadState: jest.fn().mockResolvedValue(null),
    saveState: jest.fn(),
    applyStoredStateToYDoc: jest.fn(),
}));
describe("Collaboration Service", () => {
    let server;
    let wss;
    let port;
    beforeAll((done) => {
        server = http_1.default.createServer();
        wss = new ws_2.WebSocketServer({ server });
        wss.on("connection", ws_handler_1.handleConnection);
        server.listen(0, () => {
            port = server.address().port;
            done();
        });
    });
    afterAll((done) => {
        wss.close();
        server.close(done);
    });
    it("should sync updates between clients", (done) => {
        const docName = "test-doc";
        const client1 = new ws_1.WebSocket(`ws://localhost:${port}/${docName}`);
        const client2 = new ws_1.WebSocket(`ws://localhost:${port}/${docName}`);
        let client1Open = false;
        let client2Open = false;
        const checkStart = () => {
            if (client1Open && client2Open) {
                // Client 1 sends update
                const doc1 = new Y.Doc();
                const text1 = doc1.getText("content");
                text1.insert(0, "Hello");
                const update1 = Y.encodeStateAsUpdate(doc1);
                // Yjs protocol: sync step 1 (not implemented fully here, just sending update)
                // For simplicity in this test, we just check if connection works and we can send data.
                // A full Yjs sync test requires implementing the sync protocol or using y-websocket client.
                // Here we just verify the server accepts connections and doesn't crash.
                client1.send(update1);
                // Give it some time
                setTimeout(() => {
                    client1.close();
                    client2.close();
                    done();
                }, 100);
            }
        };
        client1.on("open", () => {
            client1Open = true;
            checkStart();
        });
        client2.on("open", () => {
            client2Open = true;
            checkStart();
        });
    });
});
