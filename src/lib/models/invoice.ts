import mongoose, { Schema } from "mongoose";

const InvoiceSchema = new Schema(
  {
    _id: { type: String, required: true },
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

export const InvoiceModel =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
