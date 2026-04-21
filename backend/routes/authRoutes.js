const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const {
  registerUser,
  loginUser,
  getUserInfo,
  logoutUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  deleteUserAccount,
  exportUserData,
  forceChangePassword,
  googleLoginUser,
  getPublicStats
} = require("../controllers/authController");
const { sendMonthlySummary } = require("../controllers/reportController");
const upload = require("../middleware/multer");

// Signup With Image 
router.post("/register", upload.single("image"), registerUser);

router.post("/login", loginUser);
router.post("/google", googleLoginUser);
router.get("/public-stats", getPublicStats);

router.get("/me", protect, getUserInfo);

router.post("/logout", logoutUser);

router.put("/profile", protect, upload.single("image"), updateProfile);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:token", resetPassword);


// Force change password (shared wallet invited users)
router.post("/force-change-password", protect, forceChangePassword);

router.delete("/delete-account", protect, deleteUserAccount);
router.get("/export-data", protect, exportUserData);

// Reports
router.get("/report/monthly", protect, sendMonthlySummary);

module.exports = router;