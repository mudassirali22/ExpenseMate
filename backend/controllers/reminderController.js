const Reminder = require("../models/Reminder");

// Add Reminder
exports.addReminder = async (req, res) => {
  try {
    const { text, priority, category } = req.body;
    
    // Validation
    if (!text ) {
      return res.status(400).json({
        message: "Text is required"
      });
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      text,
      priority,
      category
    });
    res.status(201).json(reminder);
  } catch (error) {
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

// Toggle Completion
exports.toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user.id });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    reminder.isCompleted = !reminder.isCompleted;
    await reminder.save();
    res.status(200).json(reminder);
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
