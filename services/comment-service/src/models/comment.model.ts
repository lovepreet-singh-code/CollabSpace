import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    threadId: mongoose.Types.ObjectId;
    content: string;
    authorId: string;
    position?: any; // Store Yjs relative position or JSON offset
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
    {
        threadId: { type: Schema.Types.ObjectId, ref: "CommentThread", required: true, index: true },
        content: { type: String, required: true },
        authorId: { type: String, required: true },
        position: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export default mongoose.model<IComment>("Comment", CommentSchema);
