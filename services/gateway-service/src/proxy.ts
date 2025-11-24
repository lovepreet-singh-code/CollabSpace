import { createProxyMiddleware } from "http-proxy-middleware";
import { Request, Response, NextFunction } from "express";

export const createProxy = (target: string) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        onError: (err, req, res) => {
            console.error("Proxy Error:", err);
            res.status(502).json({ message: "Service Unavailable" });
        },
    });
};
