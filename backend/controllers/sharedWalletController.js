const SharedWallet = require("../models/SharedWallet");
const User = require("../models/User");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/emailService");
const templates = require("../utils/emailTemplates");

// Generate random 8-char password
const generateRandomPassword = () => {
  return crypto.randomBytes(4).toString("hex") + "A1!";
};

// Create Wallet
exports.createWallet = async (req, res) => {
  try {
    const { name, totalBalance, category, description } = req.body;
    if (!name) return res.status(400).json({ message: "Wallet name is required" });

    const wallet = await SharedWallet.create({
      name,
      category: category || "Other",
      description: description || "",
      targetBudget: Number(totalBalance) || 0,
      totalBalance: 0, // initially 0 collected
      createdBy: req.user.id,
      members: [{ user: req.user.id, email: req.user.email || "", status: "Active" }],
    });

    await wallet.populate("members.user", "fullName email profileImageUrl");
    res.status(201).json({ success: true, wallet });
  } catch (error) {
    console.error("Create Wallet Error:", error);
    res.status(500).json({ message: "Error creating wallet", error: error.message });
  }
};

// Get Wallets
exports.getWallets = async (req, res) => {
  try {
    const wallets = await SharedWallet.find({
      $or: [
        { createdBy: req.user.id },
        { "members.user": req.user.id },
      ],
    }).populate("members.user", "fullName email profileImageUrl")
      .populate("createdBy", "fullName email")
      .populate("expenses.paidBy", "fullName email")
      .sort({ createdAt: -1 });

    // Calculate contributions on the fly
    const enrichedWallets = wallets.map(wallet => {
      const walletObj = wallet.toObject();
      const memberContributions = {};

      // Initialize contributions
      walletObj.members.forEach(m => {
        memberContributions[m.user?._id?.toString() || m.user?.toString()] = 0;
      });

      // Sum expenses
      wallet.expenses.forEach(exp => {
        const payerId = exp.paidBy?._id?.toString() || exp.paidBy?.toString();
        if (memberContributions[payerId] !== undefined) {
          memberContributions[payerId] += exp.amount;
        }
      });

      // Attach to members
      walletObj.members = walletObj.members.map(m => ({
        ...m,
        totalPaid: memberContributions[m.user?._id?.toString() || m.user?.toString()] || 0
      }));

      return walletObj;
    });

    res.status(200).json({ success: true, data: enrichedWallets });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wallets", error: error.message });
  }
};

// Add Member — auto-create account if doesn't exist, send random password via email
exports.addMember = async (req, res) => {
  try {
    const { walletId, email } = req.body;
    if (!walletId || !email) return res.status(400).json({ message: "Wallet ID and email are required" });

    const wallet = await SharedWallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Check if already a member
    const existing = wallet.members.find((m) => m.email === email);
    if (existing) return res.status(400).json({ message: "User is already a member" });

    // Find or create user
    let user = await User.findOne({ email });
    let randomPassword = null;

    if (!user) {
      // Auto-create account with random password
      randomPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        fullName: email.split("@")[0],
        email,
        password: hashedPassword,
        mustChangePassword: true,
        invitedBy: req.user.id,
      });
    }

    // Add to wallet
    wallet.members.push({ user: user._id, email, status: randomPassword ? "Invited" : "Active" });
    await wallet.save();

    // Send email with password (if new user) or invitation
    try {
      const inviterName = (await User.findById(req.user.id))?.fullName || "A Colleague";
      const loginUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/login`;

      const htmlContent = templates.invitationTemplate(wallet.name, inviterName, loginUrl, randomPassword);

      await sendEmail({
        email,
        subject: `🤝 Collaboration Invite: ${wallet.name}`,
        message: `You've been invited to ${wallet.name} on ExpenseMate. Login: ${loginUrl}`,
        html: htmlContent
      });
    } catch (emailError) {
      console.error("Email send error (non-blocking):", emailError.message);
      // Double ensure visibility in dev mode
      if (randomPassword) {
        console.log("------------------ [INVITATION ALERT] ------------------");
        console.log(`User: ${email}`);
        console.log(`Temporary Password: ${randomPassword}`);
        console.log("---------------------------------------------------------");
      }
    }

    // Create In-App Notification
    try {
      await Notification.create({
        recipient: user._id,
        sender: req.user.id,
        type: "INVITE",
        message: `You've been invited to joint wallet "${wallet.name}"`,
        link: "/shared-wallets",
        walletId: wallet._id
      });
    } catch (notiError) {
      console.error("Invite notification failed:", notiError.message);
    }

    await wallet.populate("members.user", "fullName email profileImageUrl");
    res.status(200).json({
      success: true,
      message: randomPassword ? "Member added & invite emailed" : "Member added",
      wallet,
      generatedPassword: randomPassword // For UI debugging/confirmation if needed
    });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ message: "Error adding member", error: error.message });
  }
};

// Remove Member
exports.removeMember = async (req, res) => {
  try {
    const { walletId, memberId } = req.body;
    const wallet = await SharedWallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.members = wallet.members.filter((m) => m.user?.toString() !== memberId && m._id?.toString() !== memberId);
    await wallet.save();
    await wallet.populate("members.user", "fullName email profileImageUrl");
    res.status(200).json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ message: "Error removing member", error: error.message });
  }
};

// Add Shared Expense (or Request Extra if it exceeds fair share)
exports.addExpense = async (req, res) => {
  try {
    const { walletId, description, amount, date, splitAmong } = req.body;
    if (!walletId || !description || !amount) {
      return res.status(400).json({ message: "Wallet ID, description, and amount are required" });
    }

    const wallet = await SharedWallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Verify user is a member
    const isMember = wallet.members.some(m => m.user?.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: "You are not a member of this wallet" });

    const numMembers = wallet.members.length || 1;
    const fairShare = wallet.targetBudget / numMembers;

    // Calculate current contribution
    const userPaid = wallet.expenses
      .filter(exp => exp.paidBy && exp.paidBy.toString() === req.user.id)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const isOwner = wallet.createdBy.toString() === req.user.id;
    const amountNum = Number(amount);
    const payingExtra = !isOwner && (userPaid + amountNum) > fairShare;

    const paidByUser = await User.findById(req.user.id);
    const allMemberEmails = wallet.members.map(m => m.email).filter(Boolean);

    if (payingExtra) {
      // Create a request instead of an expense
      wallet.requests.push({
        description,
        amount: amountNum,
        requestedBy: req.user.id,
        requestedByEmail: paidByUser?.email || "",
        date: date ? new Date(date) : new Date(),
        status: "Pending"
      });
      await wallet.save();

      // Create Request Notification for Owner
      try {
        await Notification.create({
          recipient: wallet.createdBy,
          sender: req.user.id,
          type: "REQUEST",
          message: `${paidByUser?.fullName || 'A member'} requested to pay extra for "${wallet.name}"`,
          link: "/shared-wallets",
          walletId: wallet._id
        });
      } catch (notiError) {
        console.error("Request notification failed:", notiError.message);
      }

      await wallet.populate("members.user", "fullName email profileImageUrl");
      return res.status(200).json({ 
        success: true, 
        message: "Extra payment request sent to the wallet owner for approval.",
        isRequest: true,
        wallet 
      });
    }

    // Normal expense (or Owner extra contributing)
    if (isOwner && (userPaid + amountNum) > fairShare) {
      // If owner pays extra, automatically increase the goal (target budget)
      const newlyExtra = Math.max(0, (userPaid + amountNum) - Math.max(userPaid, fairShare));
      wallet.targetBudget += newlyExtra;
    }
    wallet.expenses.push({
      description,
      amount: amountNum,
      paidBy: req.user.id,
      paidByEmail: paidByUser?.email || "",
      date: date ? new Date(date) : new Date(),
      splitAmong: splitAmong || allMemberEmails,
    });

    wallet.totalBalance = wallet.expenses.reduce((sum, e) => sum + e.amount, 0);
    await wallet.save();

    await wallet.populate("members.user", "fullName email profileImageUrl");
    await wallet.populate("expenses.paidBy", "fullName email");

    res.status(201).json({ success: true, wallet });
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ message: "Error adding expense", error: error.message });
  }
};

// Handle Extra Request (Accept/Reject)
exports.handleExtraRequest = async (req, res) => {
  try {
    const { walletId, requestId, action } = req.body; // action: 'Accepted' or 'Rejected'
    if (!walletId || !requestId || !action) {
      return res.status(400).json({ message: "Wallet ID, Request ID, and Action are required" });
    }

    const wallet = await SharedWallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Verify user is the owner
    if (wallet.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can manage requests" });
    }

    const request = wallet.requests.id(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request has already been processed" });
    }

    if (action === "Accepted") {
      // 1. Add as an actual expense
      wallet.expenses.push({
        description: request.description,
        amount: request.amount,
        paidBy: request.requestedBy,
        paidByEmail: request.requestedByEmail,
        date: new Date(),
        splitAmong: wallet.members.map(m => m.email).filter(Boolean),
      });

      // 2. Increase the target budget (Goal)
      wallet.targetBudget += request.amount;
      
      // 3. Update total balance
      wallet.totalBalance = wallet.expenses.reduce((sum, e) => sum + e.amount, 0);
      
      request.status = "Accepted";
    } else {
      request.status = "Rejected";
    }

    await wallet.save();

    // Create Action Notification for Requester
    try {
      await Notification.create({
        recipient: request.requestedBy,
        sender: req.user.id,
        type: "ACTION",
        message: `Your extra payment request for "${wallet.name}" was ${action.toLowerCase()}`,
        link: "/shared-wallets",
        walletId: wallet._id
      });
    } catch (notiError) {
      console.error("Action notification failed:", notiError.message);
    }

    await wallet.populate("members.user", "fullName email profileImageUrl");
    await wallet.populate("expenses.paidBy", "fullName email");

    res.status(200).json({ 
      success: true, 
      message: `Request ${action.toLowerCase()} successfully`,
      wallet 
    });
  } catch (error) {
    console.error("Handle Request Error:", error);
    res.status(500).json({ message: "Error processing request", error: error.message });
  }
};

// Get Statements — calculate who owes what
exports.getStatements = async (req, res) => {
  try {
    const wallet = await SharedWallet.findById(req.params.walletId)
      .populate("members.user", "fullName email")
      .populate("expenses.paidBy", "fullName email");

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Calculate settlements
    const memberEmails = wallet.members.map(m => m.email).filter(Boolean);
    const balances = {};
    memberEmails.forEach(e => balances[e] = 0);

    wallet.expenses.forEach(exp => {
      const splitWith = exp.splitAmong.length > 0 ? exp.splitAmong : memberEmails;
      const perPerson = exp.amount / splitWith.length;

      // Payer gets credit
      if (balances[exp.paidByEmail] !== undefined) {
        balances[exp.paidByEmail] += exp.amount - perPerson;
      }

      // Others owe
      splitWith.forEach(email => {
        if (email !== exp.paidByEmail && balances[email] !== undefined) {
          balances[email] -= perPerson;
        }
      });
    });

    // Generate settlement suggestions
    const settlements = [];
    const debtors = Object.entries(balances).filter(([, bal]) => bal < 0).sort((a, b) => a[1] - b[1]);
    const creditors = Object.entries(balances).filter(([, bal]) => bal > 0).sort((a, b) => b[1] - a[1]);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(-debtors[i][1], creditors[j][1]);
      if (amount > 0.01) {
        settlements.push({
          from: debtors[i][0],
          to: creditors[j][0],
          amount: Math.round(amount * 100) / 100,
        });
      }
      debtors[i][1] += amount;
      creditors[j][1] -= amount;
      if (Math.abs(debtors[i][1]) < 0.01) i++;
      if (Math.abs(creditors[j][1]) < 0.01) j++;
    }

    res.status(200).json({
      success: true,
      data: {
        expenses: wallet.expenses,
        balances,
        settlements,
        totalSpent: wallet.totalBalance,
      }
    });
  } catch (error) {
    console.error("Statements Error:", error);
    res.status(500).json({ message: "Error generating statements", error: error.message });
  }
};

// Update Wallet (Rename & Balance)
exports.updateWallet = async (req, res) => {
  try {
    const { name, totalBalance, category, description } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (totalBalance !== undefined) {
      updateData.targetBudget = Number(totalBalance);
    }

    const wallet = await SharedWallet.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updateData,
      { new: true }
    );
    if (!wallet) return res.status(404).json({ message: "Wallet not found or unauthorized" });
    await wallet.populate("members.user", "fullName email profileImageUrl");
    res.status(200).json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ message: "Error updating wallet", error: error.message });
  }
};

// Delete Wallet
exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await SharedWallet.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!wallet) return res.status(404).json({ message: "Wallet not found or unauthorized" });
    res.status(200).json({ message: "Wallet deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting wallet", error: error.message });
  }
};
