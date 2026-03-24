const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { addReminder, getReminders, toggleReminder, deleteReminder } = require("../controllers/reminderController");

router.post("/add", protect, addReminder);
router.get("/get", protect, getReminders);
router.put("/toggle/:id", protect, toggleReminder);
router.delete("/delete/:id", protect, deleteReminder);

module.exports = router;
