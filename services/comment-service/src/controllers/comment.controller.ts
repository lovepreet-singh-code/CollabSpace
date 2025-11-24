import { Request, Response } from "express";
import { CommentService } from "../services/comment.service";
import { AuthRequest } from "../middleware/auth";

const commentService = new CommentService();

export const createThread = async (req: Request, res: Response) => {
    try {
        const { docId, content, position } = req.body;
        const userId = (req as AuthRequest).user.id;
        const result = await commentService.createThread(docId, content, userId, position);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addReply = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const { threadId } = req.params; // Expecting /api/comments/reply with threadId in body or params? Adjusting to match REST best practices or user request.
        // User request said POST /api/comments/reply. Usually this needs threadId in body.
        // Let's assume body: { threadId, content }
        const { threadId: bodyThreadId } = req.body;
        const userId = (req as AuthRequest).user.id;
        const result = await commentService.addReply(bodyThreadId, content, userId);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getComments = async (req: Request, res: Response) => {
    try {
        const { docId } = req.params;
        const { page, limit } = req.query;
        const result = await commentService.getCommentsByDoc(docId, Number(page) || 1, Number(limit) || 20);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const resolveThread = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).user.id;
        const result = await commentService.resolveThread(id, userId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const unresolveThread = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).user.id;
        const result = await commentService.unresolveThread(id, userId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as AuthRequest).user.id;
        const result = await commentService.deleteComment(id, userId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
