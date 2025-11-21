import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import axios from "axios";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing authorization header" });
    const parts = header.split(" ");
    if (parts.length !== 2) return res.status(401).json({ message: "Invalid auth header" });
    const token = parts[1];

    // decode token to get userId (assuming same token format as user-service)
    const payload: any = jwt.verify(token, config.jwtSecret);
    // Optionally verify user exists in user-service
    // We will try to fetch minimal user info (me endpoint) for sanity check
    try {
      const r = await axios.get(`${config.userServiceUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      (req as any).user = r.data; // { id, email, name, roles }
    } catch (err) {
      // fallback: use token payload
      (req as any).user = { id: payload.userId, email: payload.email };
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
