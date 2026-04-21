const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Budget = require("../models/Budget");
const mongoose = require("mongoose");
const { createNotification } = require("../utils/notificationHelper");

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, method, notes } = req.body;
    
    // Validation
    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      method: method || "Cash / Other",
      notes: notes || "",
      user: req.user.id
    });
   
    res.status(201).json(expense);

    // Budget Intelligence Check (Async)
    (async () => {
      try {
        const budget = await Budget.findOne({ user: req.user.id, category });
        if (budget && budget.limit > 0) {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0,0,0,0);

          const monthTotal = await Expense.aggregate([
            { $match: { 
              user: new mongoose.Types.ObjectId(req.user.id), 
              category,
              date: { $gte: startOfMonth }
            }},
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]);

          const totalSpent = monthTotal[0]?.total || 0;
          if (totalSpent >= budget.limit * 0.9) {
            await createNotification(req.user.id, {
              type: "SYSTEM",
              message: `Budget Alert: You have used ${((totalSpent / budget.limit) * 100).toFixed(0)}% of your ${category} budget!`,
              link: "/budgets",
              category: "budget"
            });
          }
        }
      } catch (err) {
        console.error("Budget alert check failed:", err.message);
      }
    })();

  } catch (error) {
    console.log("Expenses Error :", error);
    res.status(500).json({
      message: "Error creating expense",
      error: error.message
    });
  }
};

// Unified Transactions with Pagination & Filtering
exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    
    const { category, type, minAmount, maxAmount, startDate, endDate } = req.query;

    const pipeline = [
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $addFields: { type: "expense" } },
      {
        $unionWith: {
          coll: "incomes",
          pipeline: [
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            { $addFields: { type: "income", category: "$source" } }
          ]
        }
      }
    ];

    // Filtering
    const matchFilters = {};
    if (category) matchFilters.category = category;
    if (type) matchFilters.type = type;
    if (minAmount || maxAmount) {
      matchFilters.amount = {};
      if (minAmount) matchFilters.amount.$gte = Number(minAmount);
      if (maxAmount) matchFilters.amount.$lte = Number(maxAmount);
    }
    if (startDate || endDate) {
      matchFilters.date = {};
      if (startDate) matchFilters.date.$gte = new Date(startDate);
      if (endDate) matchFilters.date.$lte = new Date(endDate);
    }

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    // Sort, Pagination, and Count
    const countPipeline = [...pipeline, { $count: "total" }];
    const dataPipeline = [
      ...pipeline,
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const [countResult, transactions] = await Promise.all([
      Expense.aggregate(countPipeline),
      Expense.aggregate(dataPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    res.status(200).json({
      transactions,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    console.log("Unified Transactions Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get Expense (Original)
exports.getExpenses = async (req, res) => {
  try {
    const { search, category, startDate, endDate } = req.query;
    let query = { user: req.user.id };
    if (search) query.title = { $regex: search, $options: "i" };
    if (category && category !== "All") query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Expenses 
exports.updateExpenses = async (req, res) => {
    try {
        const { id } = req.params;
        const {title, amount, category, date, notes } = req.body;
        const expense = await Expense.findOne({ _id: id, user: req.user.id });
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        if (title !== undefined) expense.title = title;
        if (amount !== undefined) expense.amount = amount;
        if (category !== undefined) expense.category = category;
        if (date !== undefined && date !== "") expense.date = date;
        if (notes !== undefined) expense.notes = notes;
        await expense.save();
        res.status(200).json(expense)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete Expenses
exports.deleteExpense = async (req, res)=>{
    try {
        const {id} = req.params;
        const result = await Expense.deleteOne({ _id: id, user: req.user.id });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Expense not found" });
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}