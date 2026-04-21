<div align="center">
  <img src="https://via.placeholder.com/150/6366f1/ffffff?text=E" alt="ExpenseMate Logo" width="100" />
  <h1>ExpenseMate</h1>
  <p><strong>A Next-Generation, Glassmorphic Financial Management Dashboard</strong></p>
  
  [![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-4DB33D.svg)](https://www.mongodb.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

<br />

## 📖 Overview

**ExpenseMate** is a full-stack, enterprise-grade personal finance application designed to replace messy spreadsheets with a sleek, automated "Command Center." Unlike traditional trackers, ExpenseMate offers a comprehensive suite of tools ranging from AI-powered financial advisory and tax monitoring to multi-user shared wallets and investment portfolio tracking.

Built with a custom **Glassmorphism** design engine using Tailwind CSS and Framer Motion, it natively provides a fluid, responsive, and visually stunning experience across all devices.

---

## ✨ Comprehensive Features

ExpenseMate isn't just an expense tracker—it's an entire ecosystem for your money.

### 📊 Core Analytics & Dashboard
*   **Real-Time Data Visualization**: Interactive Area, Bar, and Pie charts powered by Recharts.
*   **Net Savings Calculator**: Automated calculation of your monthly surplus or deficit.
*   **Cross-Module Unification**: A single activity feed that pulls data from your investments, taxes, subscriptions, and regular expenses.

### 💳 Transaction Engine
*   Seamless **Inline Editing**: Quickly click any transaction row to edit figures directly.
*   **Advanced Filtering**: Filter by custom date ranges, categories, amounts, or priority.
*   **Bulk Formats**: Import massive CSV files or download robust PDF reports of your complete transaction history.

### 👥 Collaborative Shared Wallets
*   Create distinct wallets for group trips, housemates, or events.
*   Add members dynamically and track "Who paid what."
*   Automatic **Debt Settlement Computations**—know exactly who owes whom at a glance.

### 📈 Portfolio & Wealth Management
*   Track Stocks, Mutual Funds, Crypto, and Real Estate.
*   Automated **ROI (Return on Investment)** and Growth calculations.
*   Status tags for "Active", "Matured", and "Sold" assets.

### 🔄 Intelligent Subscriptions
*   Hate sneaky billing charges? The app automatically tracks upcoming streaming/software bills.
*   **Billing Cycle Engine**: Accurately computes annualized costs vs weekly/monthly.
*   Urgent UI flags for subscriptions due within the next 5 days.

### 🤖 AI Financial Advisor
*   Integrated smart analysis tool that reads your spending behavior.
*   Get automatically generated, actionable recommendations to improve your cash flow trajectory.

### ⚖️ Tax Monitor
*   Log potential tax deductions and liabilities throughout the year.
*   Keep a running total of your estimated taxable income to prevent surprises during tax season.

### 📝 Notes & Reminders
*   Urgent priority system (High, Medium, Low) for impending financial deadlines.
*   Pin critical financial notes, debts, or ideas to the top of your dashboard.

---

## 🛠️ Technology Stack

| Architecture | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React.js (v19) + Vite |
| **Styling & UI** | Tailwind CSS v4, Lucide React (Icons) |
| **Animations** | Framer Motion |
| **Charting Library** | Recharts |
| **PDF/Data Generation** | jsPDF, jspdf-autotable, Blob API |
| **Backend Framework** | Node.js, Express.js |
| **Database & ORM** | MongoDB, Mongoose 9 |
| **Security** | JWT (Cookie-based Auth), Bcrypt.js |
| **File Processing** | Multer, CSV-Parse |

---

## 📂 Project Structure

```text
ExpenseMate/
├── backend/                  # Express/Node Environment
│   ├── config/               # DB Connection & Passport logic
│   ├── controllers/          # Business logic (Dashboard, AI, Auth, etc)
│   ├── middleware/           # JWT Protection & Error Handlers
│   ├── models/               # Mongoose Schemas (User, Expense, Wallet, etc)
│   ├── routes/               # Modular Express API routing
│   └── server.js             # Application entry point
│
└── frontend/                 # React/Vite Environment
    ├── src/
    │   ├── components/       # Reusable UI (Cards, Modals, Topbar)
    │   ├── context/          # React Context (AuthContext)
    │   ├── hooks/            # Custom logic (useDashboard, useAnalytics, etc)
    │   ├── pages/            # View-level components (Transactions, Portfolios)
    │   ├── utils/            # Axios API Clients & formatters
    │   ├── App.jsx           # React Router implementation
    │   └── index.css         # Global Glassmorphism CSS variables
    └── tailwind.config.js    # Theming & custom animation keyframes
```

---

## 🚀 Local Deployment Guide

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v16.x or higher)
*   [MongoDB URI](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster)

### 1. Environment Variables Configuration

**Backend (`backend/.env`)**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=super_secret_jwt_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`)**
Create a `.env` file in the `frontend` directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 2. Install & Run

Fire up two terminal windows or tabs:

**Terminal 1 (Backend API):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser. The app should instantly connect to your local backend API!

---

## 📸 Screenshots

*(You can add images here inside your repository by pasting them inside an `assets` folder.)*

- **Dashboard:** `![Dashboard View](assets/dashboard.png)`
- **Shared Wallets:** `![Wallets View](assets/wallets.png)`
- **PDF Report Generation:** `![Report](assets/report.png)`

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
1. **Fork** the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

<p align="center">
  <i>Developed with precision and care. Redefine the way you manage your wealth.</i>
</p>
