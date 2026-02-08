import mongoose, { Schema } from "mongoose";

const ContactSchema = new Schema(
  {
    _id: { type: String, required: true },
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

export const ContactModel =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
