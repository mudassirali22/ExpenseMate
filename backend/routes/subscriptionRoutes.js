const express = require("express");
const router = express.Router();
const { addSubscription, getSubscriptions, deleteSubscription, updateSubscription } = require("../controllers/subscriptionController");
const protect = require("../middleware/protect");


router.post("/add", protect, addSubscription);
router.get("/get", protect, getSubscriptions);
router.put("/update/:id", protect, updateSubscription);
router.delete("/delete/:id", protect, deleteSubscription);

module.exports = router;
