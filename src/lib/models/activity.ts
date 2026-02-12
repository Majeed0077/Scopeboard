import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true, default: "default" },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    message: { type: String },
    userRole: { type: String },
  },
  { timestamps: true },
);

ActivitySchema.index({ workspaceId: 1, entityType: 1, entityId: 1, createdAt: -1 });

export const ActivityModel =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
