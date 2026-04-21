const Expense = require("../models/Expense");
const Income = require("../models/Income");

// Monthly trend data
exports.getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ user: userId }).sort({ date: 1 });
    const incomes = await Income.find({ user: userId }).sort({ date: 1 });

    const monthMap = {};

    expenses.forEach((exp) => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { month: key, expenses: 0, incomes: 0 };
      monthMap[key].expenses += exp.amount;
    });

    incomes.forEach((inc) => {
      const d = new Date(inc.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { month: key, expenses: 0, incomes: 0 };
      monthMap[key].incomes += inc.amount;
    });

    const data = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Category distribution
exports.getCategoryDistribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ user: userId });

    const categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const data = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Income vs Expense comparison
exports.getIncomeVsExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ user: userId });
    const incomes = await Income.find({ user: userId });

    const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);
    const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    res.status(200).json({
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate: Number(savingsRate),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
