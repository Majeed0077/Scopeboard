import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true, default: "default" },
    orgName: { type: String, default: "ScopeBoard" },
    timezone: { type: String, default: "UTC" },
    logoUrl: { type: String, default: "" },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false },
);

export const SettingsModel =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);






