import mongoose, { Schema } from "mongoose";

const AuditSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true, default: "default" },
    actorId: { type: String },
    actorRole: { type: String },
    actorEmail: { type: String },
    action: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    meta: { type: String },
    createdAt: { type: String, required: true },
  },
  { timestamps: false },
);

export const AuditModel = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);






