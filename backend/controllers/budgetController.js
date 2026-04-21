const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// Get all budgets for user (with auto-calculated spent from expenses)
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ user: userId }).sort({ createdAt: -1 });

    // Calculate spent amounts from actual expenses
    const expenses = await Expense.find({ user: userId });
    const categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const enrichedBudgets = budgets.map((budget) => ({
      ...budget.toObject(),
      spent: categoryTotals[budget.category] || 0,
    }));

    res.status(200).json(enrichedBudgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add budget
exports.addBudget = async (req, res) => {
  try {
    const { name, category, limit, period, icon, color } = req.body;

    if (!name || !category || !limit) {
      return res.status(400).json({ message: "Name, category, and limit are required" });
    }

    const budget = await Budget.create({
      user: req.user.id,
      name,
      category,
      limit: Number(limit),
      period: period || "monthly",
      icon,
      color,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update budget
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    const { name, category, limit, period, icon, color } = req.body;
    if (name) budget.name = name;
    if (category) budget.category = category;
    if (limit) budget.limit = Number(limit);
    if (period) budget.period = period;
    if (icon !== undefined) budget.icon = icon;
    if (color !== undefined) budget.color = color;

    await budget.save();
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.status(200).json({ message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
