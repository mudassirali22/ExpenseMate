const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Budget = require("../models/Budget");
const User = require("../models/User");
const mongoose = require("mongoose");
const sendEmail = require("../utils/emailService");
const { monthlySummaryTemplate } = require("../utils/emailTemplates");

/**
 * Generate and Send Monthly Financial Summary Email
 */
exports.sendMonthlySummary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate dates for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 1. Aggregate Total Income
    const incomeResult = await Income.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 2. Aggregate Total Expenses
    const expenseResult = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 3. Aggregate Top Categories
    const categoryResult = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } },
      { $limit: 3 }
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

    const data = {
      income: `${user.currency || 'PKR'} ${totalIncome.toLocaleString()}`,
      expenses: `${user.currency || 'PKR'} ${totalExpenses.toLocaleString()}`,
      savings: `${user.currency || 'PKR'} ${savings.toLocaleString()}`,
      savingsRate: `${savingsRate}%`,
      topCategories: categoryResult.map(c => ({
        name: c._id,
        amount: `${user.currency || 'PKR'} ${c.amount.toLocaleString()}`
      }))
    };

    // 4. Send Email
    const htmlContent = monthlySummaryTemplate(user.fullName, data);
    
    await sendEmail({
      email: user.email,
      subject: `Monthly Financial Intelligence - ${now.toLocaleString('default', { month: 'long' })} Summary`,
      message: "Here is your monthly financial summary.",
      html: htmlContent
    });

    res.status(200).json({ success: true, message: "Summary report sent to your email" });

  } catch (error) {
    console.error("Report Controller Error:", error.message);
    res.status(500).json({ success: false, message: "Error generating report", error: error.message });
  }
};
