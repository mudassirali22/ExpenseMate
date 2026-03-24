const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { createGoal, getGoals, updateGoal, deleteGoal } = require("../controllers/goalController");

router.post("/add", protect, createGoal);
router.get("/get", protect, getGoals);
router.put("/:id", protect, updateGoal);
router.delete("/:id", protect, deleteGoal);

module.exports = router;
