require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://expansemate.onrender.com",
  "https://expansemate.onrender.com/",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.indexOf(origin + "/") !== -1) {
        callback(null, true);
      } else {
        console.log("CORS Rejected for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  })
);

// Global Request Logger to debug 404s
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

/* MIDDLEWARE */

app.use(express.json());
app.use(cookieParser());

connectDB();

/*ROUTES */

app.get("/", (req, res) => {
  res.send("Hello Express");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
const goalRoutes = require("./routes/goalRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/reminders", reminderRoutes);

/* DEV SERVER */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = app;