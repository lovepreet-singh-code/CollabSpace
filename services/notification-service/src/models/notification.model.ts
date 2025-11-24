import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId: string;
    type: "info" | "warning" | "action_required" | "comment" | "share" | "version";
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    isSent: boolean;
    sentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        type: {
            type: String,
            enum: ["info", "warning", "action_required", "comment", "share", "version"],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        data: { type: Schema.Types.Mixed },
        isRead: { type: Boolean, default: false, index: true },
        isSent: { type: Boolean, default: false },
        sentAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>("Notification", NotificationSchema);
