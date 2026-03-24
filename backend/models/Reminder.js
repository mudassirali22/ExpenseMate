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
    enum: ["Personal", "Work", "Urgent", "Other"],
    default: "Personal"
  }
}, { timestamps: true });

module.exports = mongoose.model("Reminder", ReminderSchema);
