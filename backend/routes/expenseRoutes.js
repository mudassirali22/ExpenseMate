const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { createExpense, getExpenses, updateExpenses, deleteExpense } = require("../controllers/expenseController");


// Create Expense (Protected)
router.post("/add", protect , createExpense);

// Get Expenses 
router.get("/get", protect, getExpenses)

// Update Expenses 
router.put("/update/:id", protect, updateExpenses)

// Delete Expense 
router.delete("/delete/:id", protect, deleteExpense)

module.exports = router;