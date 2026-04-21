const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { getBudgets, addBudget, updateBudget, deleteBudget } = require("../controllers/budgetController");

router.get("/get", protect, getBudgets);
router.post("/add", protect, addBudget);
router.put("/update/:id", protect, updateBudget);
router.delete("/delete/:id", protect, deleteBudget);

module.exports = router;
