import mongoose, { Schema } from "mongoose";

const InvoiceSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true, default: "default" },
    invoiceNo: { type: String, required: true },
    projectId: { type: String, required: true },
    contactId: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "unpaid"],
      default: "unpaid",
    },
    issueDate: { type: String },
    dueDate: { type: String },
    paidDate: { type: String },
    amount: { type: Number },
    currency: { type: String, default: "USD" },
    lineItems: {
      type: [
        {
          title: String,
          qty: Number,
          rate: Number,
        },
      ],
      default: [],
    },
    payments: {
      type: [
        {
          amount: Number,
          method: String,
          paidAt: String,
          note: String,
        },
      ],
      default: [],
    },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

InvoiceSchema.index({ workspaceId: 1, invoiceNo: 1 }, { unique: true });
InvoiceSchema.index({ workspaceId: 1, status: 1, archived: 1 });
InvoiceSchema.index({ workspaceId: 1, dueDate: 1 });
InvoiceSchema.index({ workspaceId: 1, projectId: 1 });

export const InvoiceModel =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
