const Subscription = require("../models/Subscription");
const { createNotification } = require("../utils/notificationHelper");

// @desc    Add new subscription
// @route   POST /api/v1/subscription/add
// @access  Private
exports.addSubscription = async (req, res) => {
  try {
    const { name, amount, category, billingCycle, nextBillingDate } = req.body;

    if (!name || !amount || !category || !nextBillingDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const subscription = await Subscription.create({
      name,
      amount,
      category,
      billingCycle,
      nextBillingDate,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });

    // Create Notification
    createNotification(req.user.id, {
      type: "SYSTEM",
      message: `New subscription added: "${name}"`,
      link: "/subscriptions",
      category: "marketing"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get all user subscriptions
// @route   GET /api/v1/subscription/get
// @access  Private
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).sort({ nextBillingDate: 1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/v1/subscription/delete/:id
// @access  Private
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check ownership
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this subscription",
      });
    }

    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subscription removed",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update subscription
// @route   PUT /api/v1/subscription/update/:id
// @access  Private
exports.updateSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check ownership
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this subscription",
      });
    }

    subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: subscription,
    });

    // Create Notification
    createNotification(req.user.id, {
      type: "SYSTEM",
      message: `Subscription updated: "${subscription.name}"`,
      link: "/subscriptions",
      category: "marketing"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
