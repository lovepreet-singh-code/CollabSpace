import mongoose, { Document, Schema } from "mongoose";

export type RoleType = "viewer" | "editor";

export interface ICollaborator {
  userId: string;
  role: RoleType;
  addedAt?: Date;
}

export interface IDocument extends Document {
  title: string;
  contentId?: string; // placeholder (actual content stored in collaboration-service or gridfs)
  description?: string;
  ownerId: string;
  collaborators: ICollaborator[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollaboratorSchema = new Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ["viewer", "editor"], required: true },
    addedAt: { type: Date, default: () => new Date() }
  },
  { _id: false }
);

const DocumentSchema = new Schema(
  {
    title: { type: String, required: true },
    contentId: { type: String },
    description: { type: String },
    ownerId: { type: String, required: true, index: true },
    collaborators: { type: [CollaboratorSchema], default: [] },
    isPublic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>("Document", DocumentSchema);
