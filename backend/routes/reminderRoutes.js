const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { addReminder, getReminders, toggleReminder, deleteReminder, updateReminder, getDueReminders, markNotified } = require("../controllers/reminderController");

router.post("/add", protect, addReminder);
router.get("/get", protect, getReminders);
router.get("/due", protect, getDueReminders);
router.put("/toggle/:id", protect, toggleReminder);
router.put("/update/:id", protect, updateReminder);
router.put("/notified/:id", protect, markNotified);
router.delete("/delete/:id", protect, deleteReminder);

module.exports = router;
