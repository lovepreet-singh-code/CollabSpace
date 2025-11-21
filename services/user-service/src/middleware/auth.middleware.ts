import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import User from "../models/user.model";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing authorization" });
    const parts = header.split(" ");
    if (parts.length !== 2) return res.status(401).json({ message: "Invalid auth header" });
    const token = parts[1];
    const payload: any = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "Invalid token user" });
    (req as any).user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
