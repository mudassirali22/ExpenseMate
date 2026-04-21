const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    color: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['Personal', 'Work', 'Finance', 'Ideas', 'Urgent', 'Important', 'Strategy', 'Travel', 'Other'],
      default: 'Personal',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", NoteSchema);
