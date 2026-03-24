const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const {addIncome , getIncome, updateIncome, deleteIncome}  = require("../controllers/incomeController");

router.post("/addIncome", protect, addIncome);
router.get("/getIncome", protect, getIncome);
router.put("/update/:id", protect, updateIncome);
router.delete("/delete/:id", protect, deleteIncome);

module.exports = router