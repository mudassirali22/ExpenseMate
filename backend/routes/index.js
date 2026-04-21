const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const expenseRoutes = require("./expenseRoutes");
const incomeRoutes = require("./incomeRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const goalRoutes = require("./goalRoutes");
const reminderRoutes = require("./reminderRoutes");
const budgetRoutes = require("./budgetRoutes");
const noteRoutes = require("./noteRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const aiRoutes = require("./aiRoutes");
const taxRoutes = require("./taxRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const portfolioRoutes = require("./portfolioRoutes");
const sharedWalletRoutes = require("./sharedWalletRoutes");
const dataRoutes = require("./dataRoutes");
const notificationRoutes = require("./notificationRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/income", incomeRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/goals", goalRoutes);
router.use("/reminders", reminderRoutes);
router.use("/budgets", budgetRoutes);
router.use("/notes", noteRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/ai", aiRoutes);
router.use("/tax", taxRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/shared-wallet", sharedWalletRoutes);
router.use("/data", dataRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
