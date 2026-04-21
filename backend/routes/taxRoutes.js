const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const { 
  addTaxPayment, 
  getTaxPayments, 
  deleteTaxPayment 
} = require("../controllers/taxController");

router.post("/add", protect, addTaxPayment);
router.get("/get", protect, getTaxPayments);
router.delete("/delete/:id", protect, deleteTaxPayment);

module.exports = router;
