import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", requireAuth, controller.me);

// role management (protected)
router.post("/role/grant", requireAuth, controller.grant);
router.post("/role/revoke", requireAuth, controller.revoke);

export default router;
