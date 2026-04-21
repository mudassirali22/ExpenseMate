const express = require("express");
const router = express.Router();
const { addAsset, getAssets, deleteAsset, updateAsset } = require("../controllers/portfolioController");
const protect = require("../middleware/protect");


router.post("/add", protect, addAsset);
router.get("/get", protect, getAssets);
router.put("/update/:id", protect, updateAsset);
router.delete("/delete/:id", protect, deleteAsset);

module.exports = router;
