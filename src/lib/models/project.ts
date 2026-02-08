import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema(
  {
    _id: { type: String, required: true },
    contactId: { type: String },
    clientName: { type: String },
    title: { type: String, required: true },
    name: { type: String },
    status: { type: String, default: "planning" },
    pipelineStage: { type: String },
    notes: { type: String },
    attachments: {
      type: [
        {
          id: String,
          name: String,
          url: String,
          type: String,
          size: Number,
        },
      ],
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

export const ProjectModel =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
