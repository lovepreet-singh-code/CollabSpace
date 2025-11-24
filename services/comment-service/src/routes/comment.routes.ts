import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as CommentController from "../controllers/comment.controller";

const router = Router();

router.post("/", authenticate, CommentController.createThread);
router.post("/reply", authenticate, CommentController.addReply);
router.get("/:docId", authenticate, CommentController.getComments);
router.delete("/:id", authenticate, CommentController.deleteComment);
router.post("/:id/resolve", authenticate, CommentController.resolveThread);
router.post("/:id/unresolve", authenticate, CommentController.unresolveThread);

export default router;
