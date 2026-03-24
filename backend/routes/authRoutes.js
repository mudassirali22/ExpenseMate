const express = require("express");
const router =express.Router();
const protect = require("../middleware/protect");
const { 
  registerUser, 
  loginUser, 
  getUserInfo, 
  logoutUser, 
  updateProfile, 
  forgotPassword, 
  resetPassword,
  sendPasswordChangeOTP,
  verifyOTPAndUpdatePassword,
  deleteUserAccount,
  exportUserData
} = require("../controllers/authController");
const upload = require("../middleware/multer");

// router.post("/signup", registerUser);
// Signup With Image 
router.post("/register", upload.single("image"), registerUser);

router.post("/login", loginUser);

router.get("/me", protect, getUserInfo);

router.post("/logout", logoutUser);

router.put("/profile", protect, upload.single("image"), updateProfile);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);

// OTP Routes for Password Change
router.post("/send-otp", protect, sendPasswordChangeOTP);
router.post("/verify-otp-password", protect, verifyOTPAndUpdatePassword);

router.delete("/delete-account", protect, deleteUserAccount);
router.get("/export-data", protect, exportUserData);

module.exports = router;