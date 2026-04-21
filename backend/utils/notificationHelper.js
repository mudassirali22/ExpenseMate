const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * Intelligent Notification Helper
 * @param {String} userId - Recipient ID
 * @param {Object} options - Notification options { type, message, link, senderId, category }
 */
const createNotification = async (userId, { type, message, link = "", senderId = null, category = 'system' }) => {
  try {
    // Fetch user to check preferences
    const user = await User.findById(userId);
    if (!user) return null;

    //Check if user enabled this category of notification
    if (category && user.notifications && typeof user.notifications[category] !== 'undefined') {
      if (!user.notifications[category]) {
        return null; // User opted out
      }
    }

    // Robust Deduplication and Throttling
    const existingUnread = await Notification.findOne({
      recipient: userId,
      message,
      isRead: false
    });

    if (existingUnread) {
      return existingUnread; 
    }

    //Time-based Throttling for Insight/Automated categories
    const throttledCategories = ['marketing', 'budget', 'monthly', 'system', 'security', 'goal', 'wallet'];
    if (throttledCategories.includes(category)) {
      const cooldownPeriod = 12 * 60 * 60 * 1000;
      const recentNotification = await Notification.findOne({
        recipient: userId,
        message,
        createdAt: { $gte: new Date(Date.now() - cooldownPeriod) }
      });

      if (recentNotification) {
        return recentNotification;
      }
    }

    //Create Notification
    const notification = await Notification.create({
      recipient: userId,
      sender: senderId,
      type: type || "SYSTEM",
      message,
      link,
      category
    });

    return notification;
  } catch (error) {
    console.error("Notification Helper Error:", error.message);
    return null;
  }
};

module.exports = { createNotification };
