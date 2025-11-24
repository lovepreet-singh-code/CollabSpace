import { Request, Response, NextFunction } from "express";
import axios from "axios";
import config from "./config";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const response = await axios.get(`${config.services.user}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        (req as AuthRequest).user = response.data;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
