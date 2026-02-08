import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema(
  {
    _id: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    message: { type: String },
    userRole: { type: String },
  },
  { timestamps: true },
);

export const ActivityModel =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
