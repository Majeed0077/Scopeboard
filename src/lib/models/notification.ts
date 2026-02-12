import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true, default: "default" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    createdAt: { type: String, required: true },
    readBy: { type: [String], default: [] },
  },
  { timestamps: false },
);

NotificationSchema.index({ workspaceId: 1, createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
