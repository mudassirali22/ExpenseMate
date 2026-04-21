const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { chat } = require("../controllers/aiAdvisorController");

router.post("/chat", protect, chat);

module.exports = router;
