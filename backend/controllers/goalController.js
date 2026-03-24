const Goal = require("../models/Goal");

// Create Goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline } = req.body;
    
    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const goal = await Goal.create({
      user: req.user.id,
      name,
      targetAmount,
      deadline,
    });
   
    res.status(201).json(goal);
  } catch (error) {
    console.log("Create Goal Error :", error.message);
    res.status(500).json({ message: "Error creating goal", error: error.message });
  }
};

// Get Goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });
    res.status(200).json(goals);
  } catch (error) {
    console.log("Get Goals Error :", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update Goal (e.g., adding to currentAmount)
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, deadline } = req.body;

    const goal = await Goal.findOne({ _id: id, user: req.user.id });
       
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
     
    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (deadline !== undefined) goal.deadline = deadline;

    await goal.save();
    
    res.status(200).json(goal);
  } catch (error) {
    console.log("Update Goal Error :", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Delete Goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Goal.deleteOne({ _id: id, user: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Goal not found" });
    }
   
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.log("Delete Goal Error :", error.message);
    res.status(500).json({ message: error.message });
  }
};
