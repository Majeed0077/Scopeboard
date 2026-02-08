import mongoose, { Schema } from "mongoose";

const MilestoneSchema = new Schema(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, default: "pending" },
    dueDate: { type: String },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const MilestoneModel =
  mongoose.models.Milestone || mongoose.model("Milestone", MilestoneSchema);
