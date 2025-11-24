import { Router } from "express";
import * as controller from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.mock";

const router = Router();

// Apply mock auth middleware to all routes
router.use(requireAuth);

router.get("/", controller.listNotifications);
router.post("/mark-read", controller.markRead);
router.post("/mark-all-read", controller.markAllRead);
router.delete("/:id", controller.deleteNotification);

export default router;
