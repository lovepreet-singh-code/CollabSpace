import Redis from "ioredis";
import { config } from "../config";

let pub: Redis | null = null;
let sub: Redis | null = null;

export const initRedis = () => {
    pub = new Redis(config.redisUrl);
    sub = new Redis(config.redisUrl);

    pub.on("error", (err) => console.error("Redis Pub Error:", err));
    sub.on("error", (err) => console.error("Redis Sub Error:", err));

    console.log("Connected to Redis");
};

export const getPub = () => pub;
export const getSub = () => sub;

export const publish = async (channel: string, message: any) => {
    if (!pub) return;
    await pub.publish(channel, JSON.stringify(message));
};

export const subscribe = (channel: string, callback: (message: any) => void) => {
    if (!sub) return;
    sub.subscribe(channel);
    sub.on("message", (ch, msg) => {
        if (ch === channel) {
            callback(JSON.parse(msg));
        }
    });
};
