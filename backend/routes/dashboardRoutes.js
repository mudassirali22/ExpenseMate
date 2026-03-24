const express = require("express");
const router = express.Router();
const multer = require("multer");
const protect = require("../middleware/protect");
const { getDashboardStats, exportTransactions, importTransactions } = require("../controllers/dashboardController");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/stats", protect, getDashboardStats);
router.get("/export", protect, exportTransactions);
router.post("/import", protect, upload.single("file"), importTransactions);

module.exports = router;