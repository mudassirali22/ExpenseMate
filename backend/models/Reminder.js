const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: ""
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  priority: {
     type: String,
     enum: ["Low", "Medium", "High"],
     default: "Medium"
  },
  category: {
    type: String,
    enum: ["Personal", "Work", "Finance", "Ideas", "Urgent", "Important", "Strategy", "Travel", "Other"],
    default: "Personal"
  },
  dueDate: {
    type: Date,
    default: null
  },
  dueTime: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: null
  },
  notified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Reminder", ReminderSchema);
