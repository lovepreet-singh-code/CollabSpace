import { Request, Response, NextFunction } from "express";

// Mock auth middleware for testing/dev
// In production, this should validate the JWT with user-service or a shared secret
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId || req.headers["x-user-id"];

    // For now, we trust the query param or header for simplicity in this microservice demo
    // In a real app, we would parse the Bearer token.

    if (!userId) {
        // If we want to be strict:
        // return res.status(401).json({ message: "Unauthorized" });

        // For this demo, we'll allow it but set a default or null user
        // Or strictly require it if the route needs it.
    }

    // Attach to req
    (req as any).user = { id: userId };
    next();
};
