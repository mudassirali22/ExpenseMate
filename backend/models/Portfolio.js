const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      required: [true, "Asset name is required"],
    },
    ticker: {
      type: String,
      default: "",
    },
    assetType: {
      type: String,
      enum: ["Stock", "Crypto", "Cash", "RealEstate", "ETFs", "Other"],
      default: "Other",
    },
    platform: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: [true, "Amount/Quantity is required"],
    },
    buyPrice: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
