import mongoose, { Schema } from "mongoose";

const WorkspaceSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    ownerUserId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const WorkspaceModel =
  mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);
