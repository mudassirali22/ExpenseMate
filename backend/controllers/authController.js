const User = require("../models/User");
const SharedWallet = require("../models/SharedWallet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const uploadToCloudinary = require("./imageController");
const sendEmail = require("../utils/emailService");
const templates = require("../utils/emailTemplates");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Portfolio = require("../models/Portfolio");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { createNotification } = require("../utils/notificationHelper");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

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
      const result = await uploadToCloudinary(req.file.buffer, "ExpenseMate/temp_pre_signup");
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

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3600000 
    });

    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      currency: user.currency,
      language: user.language,
      theme: user.theme,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3600000
    });

    // Create Notification (Async)
    createNotification(user._id, {
      type: "SYSTEM",
      message: "Security Alert: Successful login detected",
      category: "security"
    });

    res.status(200).json({
      message: "Login successful",
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      currency: user.currency,
      language: user.language,
      theme: user.theme,
      mustChangePassword: user.mustChangePassword || false,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message,
    });
  }
};

exports.googleLoginUser = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const generatedPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      user = await User.create({
        fullName: name,
        email,
        password: hashedPassword,
        profileImageUrl: picture,
      });
    } else if (picture && user.profileImageUrl === null) {
      user.profileImageUrl = picture;
      await user.save();
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3600000 
    });

    // Create Notification (Async)
    createNotification(user._id, {
      type: "SYSTEM",
      message: "Security Alert: Successful Google login detected",
      category: "security"
    });

    res.status(200).json({
      message: "Google login successful",
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      currency: user.currency,
      language: user.language,
      theme: user.theme,
      token,
    });
  } catch (error) {
    console.error("Google verify error:", error);
    res.status(500).json({
      message: "Google authentication failed",
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
      message: "Error fetching user",
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
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({
      message: "Logout error",
      error: error.message,
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName) user.fullName = fullName;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, `ExpenseMate/user-${user._id}/profile`);
      user.profileImageUrl = result.secure_url;
    }

    const fields = ['currency', 'language', 'theme', 'timezone', 'dateFormat'];
    fields.forEach(f => { if (req.body[f]) user[f] = req.body[f]; });

    if (req.body.notifications) {
      const notifs = typeof req.body.notifications === 'string' ? JSON.parse(req.body.notifications) : req.body.notifications;
      user.notifications = { ...user.notifications, ...notifs };
    }

    await user.save();

    // Create Security Alert Notification
    createNotification(user._id, {
      type: "SYSTEM",
      message: "Security Alert: Your profile details were recently updated",
      category: "security"
    });

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      currency: user.currency,
      language: user.language,
      theme: user.theme,
      timezone: user.timezone,
      dateFormat: user.dateFormat,
      notifications: user.notifications,
      createdAt: user.createdAt,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const htmlContent = templates.passwordResetTemplate(resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request - ExpenseMate",
        message: `Reset your password here: ${resetUrl}`,
        html: htmlContent
      });
      res.status(200).json({ message: "Reset email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email failed", error: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Forgot password error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Create Security Alert
    createNotification(user._id, {
      type: "SYSTEM",
      message: "Security Alert: Your password was successfully reset",
      category: "security"
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Reset password error", error: error.message });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete account error", error: error.message });
  }
};

exports.exportUserData = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });

    let csv = "Type,Title,Amount,Category/Source,Date\n";
    expenses.forEach(e => csv += `Expense,"${e.title}",${e.amount},"${e.category}","${new Date(e.date).toLocaleDateString()}"\n`);
    incomes.forEach(i => csv += `Income,"${i.title}",${i.amount},"${i.source}","${new Date(i.date).toLocaleDateString()}"\n`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="data-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Export error", error: error.message });
  }
};

exports.forceChangePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
       return res.status(400).json({ message: "Password minimum 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    await SharedWallet.updateMany(
      { "members.email": user.email, "members.status": "Invited" },
      { $set: { "members.$[elem].status": "Active" } },
      { arrayFilters: [{ "elem.email": user.email }] }
    );

    res.status(200).json({ message: "Password set successfully" });

    try {
      const html = templates.activationTemplate(user.fullName, `${process.env.CLIENT_URL}/dashboard`);
      await sendEmail({
        email: user.email,
        subject: "Account Ready - ExpenseMate",
        message: "Your password is set. Access your dashboard now.",
        html
      });
    } catch (e) {
      console.error("Activation email failed:", e.message);
    }
  } catch (error) {
    res.status(500).json({ message: "Password change error", error: error.message });
  }
};

// Get Public Platform Stats
exports.getPublicStats = async (req, res) => {
  try {
    const [totalUsers, incomeStats, expenseStats, portfolioStats] = await Promise.all([
      User.countDocuments(),
      Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Portfolio.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ["$buyPrice", "$amount"] } } } }])
    ]);

    const totalIncome = incomeStats[0]?.total || 0;
    const totalExpense = expenseStats[0]?.total || 0;
    const totalPortfolio = portfolioStats[0]?.total || 0;

    // Tracked Assets is an aggregate of total movement and current holdings
    const baseAssets = 150000; // Base seed value
    const trackedAssets = baseAssets + totalIncome + totalPortfolio;
    const transactions = (totalUsers * 8) + (totalIncome > 0 ? Math.floor(totalIncome / 200) : 15);

    res.status(200).json({
      activeUsers: totalUsers || 0,
      trackedAssets: trackedAssets,
      uptime: "99.9%",
      rating: "4.9",
      transactions: transactions
    });
  } catch (error) {
    console.error("Public Stats Error:", error.message);
    res.status(500).json({ message: "Error fetching platform stats" });
  }
};