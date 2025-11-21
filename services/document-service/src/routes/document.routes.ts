import { Router } from "express";
import * as ctrl from "../controllers/document.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

// CRUD
router.post("/", ctrl.createDoc);
router.get("/", ctrl.listDocs);
router.get("/:id", ctrl.getDoc);
router.put("/:id", ctrl.updateDoc);
router.delete("/:id", ctrl.deleteDoc);

// Collaborators
router.post("/:id/collaborators", ctrl.addCollaborator);
router.delete("/:id/collaborators/:userId", ctrl.removeCollaborator);

// Sharing
router.post("/:id/share", ctrl.shareDoc);

export default router;
