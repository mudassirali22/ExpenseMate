const Income = require("../models/Income");

// Add Income 
const addIncome = async (req, res) => {
  try {
    const {title, amount, source, date, method, notes} = req.body;

    if (!title || !amount || !source) {
        return res.status(400).json({
        message: "All fields are required"
      });
    }

        const income = await Income.create({
          title,
          amount,
          source,
          date: date || Date.now(),
          method: method || "Cash / Other",
          notes: notes || "",
          user: req.user.id,
        });
    
    res.status(201).json(income);

  } catch (error) {
    console.log("Add Income Error :", error.message);
    res.status(500).send({
        message: "Add Income Error",
        error: error.message 
    });
  }
}

// Get Income 
const getIncome = async (req, res) => {
  try {
    const { search, source, startDate, endDate } = req.query;
    
    // Build query object
    let query = { user: req.user.id };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    
    if (source && source !== "All") {
      query.source = source;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const income = await Income.find(query).sort({ date: -1 });

    res.status(200).json(income);

  } catch (error) {
    console.log("Get Income Error :", error.message);
    res.status(500).send({
      message: "Get Income Error",
      error: error.message 
    });
  }
}

// Update Income
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, source, date, notes } = req.body;

    const income = await Income.findOne({
      _id: id,
      user: req.user.id
    });
   
    if (!income) {
      return res.status(404).json({
        message: "Income not found"
      });
    }
 
    if (title !== undefined) income.title = title;
    if (amount !== undefined) income.amount = amount;
    if (source !== undefined) income.source = source;
    if (date !== undefined && date !== "") income.date = date;
    if (notes !== undefined) income.notes = notes;

    await income.save();
    
    res.status(200).json(income)
        
  } catch (error) {
    console.log("Update Income error :", error.message);
    res.status(500).json({ message: error.message });
  }
}

// Delete Income
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await Income.findOne({
      _id: id,
      user: req.user.id
    });

    if (!income) {
      return res.status(404).json({
        message: "Income not found"
      });
    }

    await Income.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Income deleted successfully" });
        
  } catch (error) {
    console.log("Delete Income error :", error.message);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
    addIncome,
    getIncome,
    updateIncome,
    deleteIncome
}