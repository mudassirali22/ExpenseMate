const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { importData, exportExpenses, exportIncome, exportAll, exportPDF, getTemplate } = require("../controllers/dataController");

router.post("/import", protect, importData);
router.get("/export/expenses", protect, exportExpenses);
router.get("/export/income", protect, exportIncome);
router.get("/export/all", protect, exportAll);
router.get("/export/pdf", protect, exportPDF);
router.get("/template/:type", protect, getTemplate);

module.exports = router;
