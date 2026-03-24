const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const uploadToCloudinary = require("./imageController");
const sendEmail = require("../utils/emailService");
const Expense = require("../models/Expense");
const Income = require("../models/Income");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};


// REGISTER USER
exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  // Validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    let imageUrl = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "expansemate/temp_pre_signup");
      imageUrl = result.secure_url;
    }

    // PASSWORD HASH
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profileImageUrl: imageUrl,
    });

    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({
      message: "Error Registration User",
      error: error.message,
    });
  }
};


// LOGIN USER
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
      const token = generateToken(user._id);

    res.cookie("token", token , {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });

     
    res.status(200).json({
       message: "Login successful",
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({
      message: "Login Error",
      error: error.message,
    });
  }
};

// GET USER 
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: "Error Fetching User",
      error: error.message,
    });
  }
};


// Logout User 
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
    });

    res.status(200).json({
      message: "Logout Successfully",
    });

  } catch (error) {
    console.log("User Logout Error :", error.message);

    res.status(500).json({
      message: "User Logout Error",
      error: error.message,
    });
  }
}

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) user.fullName = fullName;
    
    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, `expansemate/user-${user._id}/profile`);
      user.profileImageUrl = result.secure_url;
    }

    await user.save();

    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      message: "Profile updated successfully",
    });
    
  } catch (error) {
    console.log("Update Profile Error:", error.message);
    res.status(500).json({
      message: "Error Updating Profile",
      error: error.message,
    });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set reset token and expiry on user
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });

      res.status(200).json({ message: "Email sent" });
    } catch (error) {
      console.error("Email sending failed:", error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ 
        message: "Email could not be sent. Please ensure your EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS are correctly set in the .env file.",
        error: error.message 
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error in Forgot Password",
      error: error.message,
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  // Hash token from URL
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resetting password",
      error: error.message,
    });
  }
};

// Send OTP for Password Change
exports.sendPasswordChangeOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Your OTP for Password Change - ExpanseMate",
      message: `Your OTP for changing your password is: ${otp}. This OTP is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// Verify OTP and Update Password
exports.verifyOTPAndUpdatePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
};

// Delete User Account
exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting account",
      error: error.message,
    });
  }
};

// Export User Data
exports.exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all expenses and incomes
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });

    // Create CSV content
    let csvContent = "Type,Title,Amount,Category/Source,Date\n";

    // Add expenses
    expenses.forEach(expense => {
      csvContent += `Expense,"${expense.title}",${expense.amount},"${expense.category}","${new Date(expense.date).toLocaleDateString()}"\n`;
    });

    // Add incomes
    incomes.forEach(income => {
      csvContent += `Income,"${income.title}",${income.amount},"${income.source}","${new Date(income.date).toLocaleDateString()}"\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expanse-tracker-data-${new Date().toISOString().split('T')[0]}.csv"`);

    res.send(csvContent);
  } catch (error) {
    res.status(500).json({
      message: "Error exporting data",
      error: error.message,
    });
  }
};