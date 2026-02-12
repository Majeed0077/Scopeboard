import mongoose, { Schema } from "mongoose";

const AttachmentSchema = new Schema(
  {
    id: String,
    name: String,
    url: String,
    type: String,
    size: Number,
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true, default: "default" },
    contactId: { type: String, required: false, default: undefined },
    clientName: { type: String },
    title: { type: String, required: true },
    name: { type: String },
    status: { type: String, default: "planning" },
    pipelineStage: { type: String },
    notes: { type: String },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    startDate: { type: String },
    dueDate: { type: String },
    budgetAmount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    links: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ProjectSchema.index({ workspaceId: 1, status: 1, archived: 1 });
ProjectSchema.index({ workspaceId: 1, contactId: 1 });
ProjectSchema.index({ workspaceId: 1, dueDate: 1 });
ProjectSchema.index({ workspaceId: 1, updatedAt: -1 });

if (mongoose.models.Project) {
  mongoose.deleteModel("Project");
}

export const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
