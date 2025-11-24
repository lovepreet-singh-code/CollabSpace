import mongoose, { Schema, Document } from "mongoose";

export interface ICommentThread extends Document {
    docId: string;
    status: "open" | "resolved";
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentThreadSchema: Schema = new Schema(
    {
        docId: { type: String, required: true, index: true },
        status: { type: String, enum: ["open", "resolved"], default: "open" },
        createdBy: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICommentThread>("CommentThread", CommentThreadSchema);
