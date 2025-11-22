import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
    _id: string; // Use string ID to match docName
    data: Buffer; // Yjs binary update
}

const DocumentSchema = new Schema<IDocument>({
    _id: { type: String, required: true },
    data: { type: Buffer, required: true },
}, { _id: false, timestamps: true });

export const DocumentModel = mongoose.model<IDocument>("Document", DocumentSchema);
