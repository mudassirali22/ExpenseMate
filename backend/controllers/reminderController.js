const Reminder = require("../models/Reminder");
const { createNotification } = require("../utils/notificationHelper");

// Add Reminder
exports.addReminder = async (req, res) => {
  try {
    const { text, priority, category, dueDate, dueTime, amount } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      text,
      description: req.body.description || "",
      priority: priority || "Medium",
      category: category || "Personal",
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      amount: amount || null,
    });
    res.status(201).json(reminder);

    // Create Notification
    createNotification(req.user.id, {
      type: "SYSTEM",
      message: `New reminder set: "${text}"`,
      link: "/dashboard",
      category: "marketing"
    });
  } catch (error) {
    console.error("Add Reminder Error:", error);
    res.status(500).json({ message: "Error adding reminder", error: error.message });
  }
};

// Get All Reminders
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders", error: error.message });
  }
};

// Get Due Reminders (for notification polling)
exports.getDueReminders = async (req, res) => {
  try {
    const now = new Date();
    const reminders = await Reminder.find({
      user: req.user.id,
      isCompleted: false,
      notified: false,
      dueDate: { $lte: now }
    });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching due reminders", error: error.message });
  }
};

// Mark as notified
exports.markNotified = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { notified: true },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: "Error updating reminder", error: error.message });
  }
};

// Update Reminder
exports.updateReminder = async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ['text', 'description', 'priority', 'category', 'dueDate', 'dueTime', 'amount', 'isCompleted'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: "Error updating reminder", error: error.message });
  }
};

// Toggle Completion
exports.toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user.id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    reminder.isCompleted = !reminder.isCompleted;
    await reminder.save();
    res.status(200).json(reminder);

    // Create Notification if completed
    if (reminder.isCompleted) {
      createNotification(req.user.id, {
        type: "ACTION",
        message: `Task completed: "${reminder.text}"`,
        link: "/dashboard",
        category: "marketing"
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error toggling reminder", error: error.message });
  }
};

// Delete Reminder
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.status(200).json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reminder", error: error.message });
  }
};
