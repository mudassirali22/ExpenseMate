const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { getMonthlyTrend, getCategoryDistribution, getIncomeVsExpense } = require("../controllers/analyticsController");

router.get("/monthly-trend", protect, getMonthlyTrend);
router.get("/category-distribution", protect, getCategoryDistribution);
router.get("/income-vs-expense", protect, getIncomeVsExpense);

module.exports = router;
