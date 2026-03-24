const Expense = require("../models/Expense");

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    
    // Validation
    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      user: req.user.id   // Login user ki ID)
    });
   
    res.status(201).json(expense);

  } catch (error) {
    console.log("Expenses Error :", error);
    
    res.status(500).json({
      message: "Error creating expense",
      error: error.message
    });

  }
};

// Get Expense  
exports.getExpenses = async (req, res) => {
  try {
    const { search, category, startDate, endDate } = req.query;
    
    // Build query object
    let query = { user: req.user.id };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    
    if (category && category !== "All") {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json(expenses);

  } catch (error) {
    console.log("Get Expenses error :", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update Expenses 
exports.updateExpenses = async (req, res) => {
    try {
        const { id } = req.params;
        const {title, amount, category, date } = req.body;

        const expense = await Expense.findOne({
            _id: id,
            user: req.user.id
        });
       
         if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }
     
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (date !== undefined && date !== "") expense.date = date;

    await expense.save();
    
    res.status(200).json(expense)
        
    } catch (error) {
    console.log("Update Expenses error :", error.message);
    res.status(500).json({ message: error.message });
    }
}

// Delete Expenses
exports.deleteExpense = async (req, res)=>{
    try {
        const {id} = req.params;
        
         const result = await Expense.deleteOne({
            _id: id,
            user: req.user.id
        });

         if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }
   
    res.status(200).json({
      message: "Expense deleted successfully"
    });
        
    } catch (error) {
    console.log("Delete Expenses error :", error.message);
    res.status(500).json({ message: error.message });
    }
}