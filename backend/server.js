require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const goalRoutes = require("./routes/goalRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const noteRoutes = require("./routes/noteRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const taxRoutes = require("./routes/taxRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const sharedWalletRoutes = require("./routes/sharedWalletRoutes");
const dataRoutes = require("./routes/dataRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


const app = express();

const allowedOrigins = [
  "https://expansemate.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      console.log(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
}));

// Pre-flight handling for all routes
app.options("*", cors());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.send("ExpanseMate API v2.0 — Luminescent Ledger");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/reminders", reminderRoutes);
app.use("/api/v1/budgets", budgetRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/tax", taxRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/portfolio", portfolioRoutes);
app.use("/api/v1/shared-wallet", sharedWalletRoutes);
app.use("/api/v1/data", dataRoutes);
app.use("/api/v1/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;