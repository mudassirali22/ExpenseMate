const express = require("express");
const router = express.Router();
const { createWallet, getWallets, addMember, removeMember, addExpense, getStatements, deleteWallet, updateWallet, handleExtraRequest } = require("../controllers/sharedWalletController");
const protect = require("../middleware/protect");

router.post("/add", protect, createWallet);
router.get("/get", protect, getWallets);
router.post("/add-member", protect, addMember);
router.post("/remove-member", protect, removeMember);
router.post("/add-expense", protect, addExpense);
router.post("/handle-request", protect, handleExtraRequest);
router.get("/statements/:walletId", protect, getStatements);
router.put("/update/:id", protect, updateWallet);
router.delete("/delete/:id", protect, deleteWallet);

module.exports = router;
