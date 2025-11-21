import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  roles: { docId: string; role: "viewer" | "editor" }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String },
    roles: [
      {
        docId: { type: String },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" }
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IUser>("User", UserSchema);
