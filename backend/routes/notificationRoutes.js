const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, clearAll, createNotification } = require("../controllers/notificationController");
const protect = require("../middleware/protect");

router.get("/", protect, getNotifications);
router.post("/create", protect, createNotification);
router.put("/read/:id", protect, markAsRead);
router.delete("/clear", protect, clearAll);

module.exports = router;
