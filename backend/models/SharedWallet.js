const mongoose = require("mongoose");

const sharedExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paidByEmail: { type: String },
  date: { type: Date, default: Date.now },
  splitAmong: [{ type: String }], // emails
});

const sharedWalletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Wallet name is required"],
    },
    category: {
      type: String,
      default: "Other",
    },
    description: {
      type: String,
      default: "",
    },
    targetBudget: {
      type: Number,
      default: 0,
    },
    totalBalance: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
        },
        status: {
          type: String,
          enum: ["Pending", "Invited", "Active"],
          default: "Invited",
        },
      },
    ],
    expenses: [sharedExpenseSchema],
    requests: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        requestedByEmail: { type: String },
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["Pending", "Accepted", "Rejected"],
          default: "Pending",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedWallet", sharedWalletSchema);
