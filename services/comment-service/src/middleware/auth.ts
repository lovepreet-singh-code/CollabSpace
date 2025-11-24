import { Request, Response, NextFunction } from "express";
import axios from "axios";
import config from "../config";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        // Validate token with user-service
        const response = await axios.get(`${config.userServiceUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        (req as AuthRequest).user = response.data;
        next();
    } catch (error) {
        logger.error("Token validation failed", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
