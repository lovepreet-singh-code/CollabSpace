import CommentThread, { ICommentThread } from "../models/commentThread.model";
import Comment, { IComment } from "../models/comment.model";
import { publishEvent } from "../kafka";

export class CommentService {
    async createThread(docId: string, content: string, userId: string, position?: any) {
        const thread = await CommentThread.create({ docId, createdBy: userId, status: "open" });
        const comment = await Comment.create({
            threadId: thread._id,
            content,
            authorId: userId,
            position,
        });

        await publishEvent("comment.added", {
            docId,
            threadId: thread._id,
            commentId: comment._id,
            content,
            authorId: userId,
        });

        return { thread, comment };
    }

    async addReply(threadId: string, content: string, userId: string) {
        const thread = await CommentThread.findById(threadId);
        if (!thread) throw new Error("Thread not found");

        const comment = await Comment.create({
            threadId,
            content,
            authorId: userId,
        });

        await publishEvent("comment.replied", {
            docId: thread.docId,
            threadId,
            commentId: comment._id,
            content,
            authorId: userId,
        });

        return comment;
    }

    async getCommentsByDoc(docId: string, page: number = 1, limit: number = 20) {
        const threads = await CommentThread.find({ docId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const threadIds = threads.map((t) => t._id);
        const comments = await Comment.find({ threadId: { $in: threadIds } }).sort({ createdAt: 1 });

        // Group comments by thread
        const result = threads.map((thread) => ({
            ...thread.toObject(),
            comments: comments.filter((c) => c.threadId.toString() === thread._id.toString()),
        }));

        return result;
    }

    async resolveThread(threadId: string, userId: string) {
        const thread = await CommentThread.findByIdAndUpdate(
            threadId,
            { status: "resolved" },
            { new: true }
        );
        if (!thread) throw new Error("Thread not found");

        await publishEvent("comment.resolved", {
            docId: thread.docId,
            threadId,
            resolvedBy: userId,
        });

        return thread;
    }

    async unresolveThread(threadId: string, userId: string) {
        const thread = await CommentThread.findByIdAndUpdate(
            threadId,
            { status: "open" },
            { new: true }
        );
        if (!thread) throw new Error("Thread not found");

        return thread;
    }

    async deleteComment(commentId: string, userId: string) {
        const comment = await Comment.findById(commentId);
        if (!comment) throw new Error("Comment not found");

        if (comment.authorId !== userId) {
            throw new Error("Unauthorized to delete this comment");
        }

        await Comment.deleteOne({ _id: commentId });
        return { message: "Comment deleted" };
    }
}
