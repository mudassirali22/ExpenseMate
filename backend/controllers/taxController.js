const TaxPayment = require("../models/TaxPayment");

// Add Tax Payment
exports.addTaxPayment = async (req, res) => {
  try {
    const { amount, date, description } = req.body;
    if (!amount) return res.status(400).json({ message: "Amount is required" });

    const payment = await TaxPayment.create({
      amount,
      date: date || Date.now(),
      description: description || "Manual Tax Payment",
      user: req.user.id
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error adding tax payment", error: error.message });
  }
};

// Get Tax Payments
exports.getTaxPayments = async (req, res) => {
  try {
    const payments = await TaxPayment.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tax payments", error: error.message });
  }
};

// Delete Tax Payment
exports.deleteTaxPayment = async (req, res) => {
  try {
    const payment = await TaxPayment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tax payment", error: error.message });
  }
};
