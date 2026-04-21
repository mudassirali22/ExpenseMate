const Notification = require("../models/Notification");

// Create a notification (called from frontend for due reminders etc.)
exports.createNotification = async (req, res) => {
  try {
    const { message, type, link } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const notification = await Notification.create({
      recipient: req.user.id,
      type: type || "ALERT",
      message,
      link: link || null,
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "fullName profileImageUrl");

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === "all") {
      await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.status(200).json({ success: true, message: "Notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing notifications", error: error.message });
  }
};
