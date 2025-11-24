import mongoose, { Schema, Document } from "mongoose";

export interface IVersion extends Document {
    docName: string;
    versionNumber: number;
    content: Buffer;
    createdAt: Date;
}

const VersionSchema = new Schema<IVersion>({
    docName: { type: String, required: true, index: true },
    versionNumber: { type: Number, required: true },
    content: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Compound index for efficient retrieval of versions for a document
VersionSchema.index({ docName: 1, versionNumber: -1 });

export const VersionModel = mongoose.model<IVersion>("Version", VersionSchema);
