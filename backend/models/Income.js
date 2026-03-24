const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Income title is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    source: {
      type: String,
      required: [true, "Income source is required"],
      trim: true,
      enum: [
        "Salary",
        "Freelancing",
        "Business",
        "Investments",
        "Gift",
        "Other",
      ],
    },

    date: {
      type: Date,
      default: Date.now,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

IncomeSchema.index({ date: 1 });

module.exports = mongoose.model("Income", IncomeSchema);