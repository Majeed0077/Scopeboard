import mongoose, { Schema } from "mongoose";

const ContactSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true, default: "default" },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    company: { type: String, default: "" },
    source: { type: String, default: "other" },
    sourceLabel: { type: String },
    stage: { type: String, default: "new" },
    nextFollowUpAt: { type: String },
    followUpCadence: { type: String, default: "none" },
    followUpIntervalDays: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    notes: {
      type: [
        {
          id: String,
          body: String,
          createdAt: String,
        },
      ],
      default: [],
    },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ContactSchema.index({ workspaceId: 1, stage: 1, archived: 1 });
ContactSchema.index({ workspaceId: 1, nextFollowUpAt: 1 });
ContactSchema.index({ workspaceId: 1, updatedAt: -1 });

export const ContactModel =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
