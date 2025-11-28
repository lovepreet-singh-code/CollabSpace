import { Router } from "express";
import { createProxy } from "./proxy";
import config from "./config";
import { authenticate } from "./auth";

const router = Router();

const authProxy = createProxy(config.services.user);
const userProxy = createProxy(config.services.user);
const docProxy = createProxy(config.services.document);
const collabProxy = createProxy(config.services.collaboration);
const versionProxy = createProxy(config.services.version);
const notifProxy = createProxy(config.services.notification);
const commentProxy = createProxy(config.services.comment);

// Public Routes
router.use("/api/auth", authProxy);

// Protected Routes
router.use("/api/users", authenticate, userProxy);
router.use("/api/documents", authenticate, docProxy);
router.use("/api/collab", authenticate, collabProxy);
router.use("/api/versions", authenticate, versionProxy);
router.use("/api/notifications", authenticate, notifProxy);
router.use("/api/comments", authenticate, commentProxy);

export default router;
