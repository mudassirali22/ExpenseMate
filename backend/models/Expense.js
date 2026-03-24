const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Shopping",
        "Transport",
        "Food",
        "Salary",
        "Bills",
        "Entertainment",
        "Utilities",
        "Health",
        "Education",
        "Other",
        "Others"
      ]
    },
    date: {
      type: Date,
      default: Date.now  
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

ExpenseSchema.index({ date: 1 });

module.exports = mongoose.model("Expense", ExpenseSchema);