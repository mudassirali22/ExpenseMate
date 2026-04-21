const Expense = require("../models/Expense");
const Income = require("../models/Income");
const TaxPayment = require("../models/TaxPayment");
const Portfolio = require("../models/Portfolio");
const Subscription = require("../models/Subscription");
const SharedWallet = require("../models/SharedWallet");
const Budget = require("../models/Budget");
const { createNotification } = require("../utils/notificationHelper");

const getDashboardStats = async (req, res)=>{
try {
    const userId = req.user.id;

    // Fetch all data points
    const [incomes, expenses, taxPayments, portfolio, subscriptions, sharedWallets, budgets] = await Promise.all([
      Income.find({ user: userId }),
      Expense.find({ user: userId }),
      TaxPayment.find({ user: userId }),
      Portfolio.find({ user: userId }),
      Subscription.find({ user: userId }),
      SharedWallet.find({ $or: [{ createdBy: userId }, { "members.user": userId }, { "members.email": req.user.email }] }),
      Budget.find({ user: userId })
    ]);

    // Calculate Subscription Impact
    const subMonthlyOutflow = subscriptions.reduce((acc, sub) => {
      const amt = sub.amount || 0;
      return acc + (sub.billingCycle === 'Yearly' ? amt / 12 : amt);
    }, 0);

    // Filter Shared Wallet Expenses paid by this user
    const sharedWalletExpenses = sharedWallets.flatMap(w => 
      w.expenses.filter(e => String(e.paidBy) === userId || e.paidByEmail === req.user.email)
        .map(e => ({ ...e.toObject(), walletName: w.name, walletCategory: w.category }))
    );

    const totalSharedExpense = sharedWalletExpenses.reduce((acc, e) => acc + e.amount, 0);

    // Aggregate totals (Standard + Shared)
    const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
    const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0) + totalSharedExpense + subMonthlyOutflow;
    const totalTaxPaid = taxPayments.reduce((acc, item) => acc + (item.amount || 0), 0);
    
    // Total Balance (Liquid + Investment)
    const totalBalance = totalIncome - totalExpense - totalTaxPaid;

    // Calculate Portfolio Value (Invested Amount)
    const totalInvested = portfolio.reduce((acc, item) => acc + (item.buyPrice * item.amount || 0), 0);
    const currentPortfolioValue = portfolio.reduce((acc, item) => acc + (item.currentValue || item.buyPrice * item.amount || 0), 0);

    // Create Unified Recent Activity
    const unifiedActivity = [
      ...incomes.map(i => ({ ...i._doc, type: 'income', activityType: 'Cash Flow', displayType: 'Income' })),
      ...expenses.map(e => ({ ...e._doc, type: 'expense', activityType: 'Expenditure', displayType: 'Expense' })),
      ...taxPayments.map(t => ({ ...t._doc, title: t.description || 'Tax Payment', type: 'tax', activityType: 'Fiscal Duty', displayType: 'Tax' })),
      ...portfolio.map(p => ({ ...p._doc, title: `Invested in ${p.assetName}`, type: 'portfolio', activityType: 'Investment', displayType: 'Portfolio', amount: p.buyPrice * p.amount })),
      ...subscriptions.map(s => ({ ...s._doc, title: `${s.name} Subscription`, type: 'expense', activityType: 'Recurring Outflow', displayType: 'Subscription', amount: s.billingCycle === 'Yearly' ? s.amount / 12 : s.amount, date: s.createdAt })),
      ...sharedWalletExpenses.map(e => ({ ...e, title: `${e.description} (Shared)`, type: 'expense', activityType: 'Collaboration', displayType: 'Shared', date: e.date }))
    ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 50);
      
    res.status(200).json({
      totalIncome,
      totalExpense,
      totalTaxPaid,
      totalBalance,
      totalInvested,
      currentPortfolioValue,
      recentActivity: unifiedActivity
    });

    // Intelligent Insights Engine (Async)
    (async () => {
      try {
        // 1. Portfolio Insight
        if (totalInvested > 0) {
          const ratio = currentPortfolioValue / totalInvested;
          if (ratio >= 1.1) {
            await createNotification(userId, {
              type: "ACTION",
              message: `High Performance: Your portfolio is up ${((ratio - 1) * 100).toFixed(1)}%!`,
              link: "/portfolio",
              category: "marketing"
            });
          } else if (ratio <= 0.9) {
            await createNotification(userId, {
              type: "SYSTEM",
              message: `Market Alert: Your portfolio value has declined by ${((1 - ratio) * 100).toFixed(1)}%.`,
              link: "/portfolio",
              category: "security"
            });
          }
        }

        // 2. Savings Rate Insight
        if (totalIncome > 0) {
          const savingsRate = (totalIncome - totalExpense) / totalIncome;
          if (savingsRate >= 0.5) {
             await createNotification(userId, {
               type: "ACTION",
               message: "Financial Peak: Your savings rate is currently above 50% this month!",
               link: "/analytics",
               category: "marketing"
             });
          }
        }

        // 3. Budget Threshold Alert
        if (budgets && budgets.length > 0) {
          for (const budget of budgets) {
            const usage = budget.spent / budget.limit;
            if (usage >= 0.8) {
              await createNotification(userId, {
                type: "SYSTEM",
                message: `Budget Alert: Your '${budget.category}' budget is ${Math.round(usage * 100)}% utilized.`,
                link: "/budgets",
                category: "budget"
              });
            }
          }
        }

        // 4. Subscription Renewal Alert
        if (subscriptions && subscriptions.length > 0) {
          const today = new Date();
          for (const sub of subscriptions) {
            const renewalDate = new Date(sub.nextBillingDate);
            const daysDiff = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 0 && daysDiff <= 3) {
              await createNotification(userId, {
                type: "SYSTEM",
                message: `Subscription Renewal: Your '${sub.name}' plan renews in ${daysDiff === 0 ? 'today' : daysDiff + ' days'}.`,
                link: "/subscriptions",
                category: "monthly"
              });
            }
          }
        }
      } catch (err) {
        console.error("Intelligence Engine Error:", err.message);
      }
    })();


} catch (error) {
    console.log("Get Dashboard Stats Error :", error.message);
       res.status(500).json({ message: error.message }); 
}
}

const excelJS = require("exceljs");

const exportTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const incomes = await Income.find({ user: userId }).sort({ date: -1 });
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    const workbook = new excelJS.Workbook();
    
    // Incomes Sheet
    const incomeSheet = workbook.addWorksheet("Incomes");
    incomeSheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Title", key: "title", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Source", key: "source", width: 20 },
    ];
    incomes.forEach((inc) => {
      incomeSheet.addRow({
        date: inc.date ? new Date(inc.date).toLocaleDateString() : "",
        title: inc.title,
        amount: inc.amount,
        source: inc.source,
      });
    });

    // Expenses Sheet
    const expenseSheet = workbook.addWorksheet("Expenses");
    expenseSheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Title", key: "title", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Category", key: "category", width: 20 },
    ];
    expenses.forEach((exp) => {
      expenseSheet.addRow({
        date: exp.date ? new Date(exp.date).toLocaleDateString() : "",
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions_export.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log("Export Transactions Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


const importTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new excelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    let importedIncomes = 0;
    let importedExpenses = 0;
    let errors = [];

    const getCellValue = (cell) => {
      if (!cell || cell.value === null || cell.value === undefined) return null;
      if (typeof cell.value === 'object' && cell.value.result !== undefined) return cell.value.result;
      if (typeof cell.value === 'object' && cell.value.text !== undefined) return cell.value.text;
      return cell.value;
    };

    const parseDate = (value) => {
      if (!value) return new Date();
      if (value instanceof Date) return value;
      if (typeof value === 'number') {
        // Excel date serial number (days since 1900-01-01)
        const excelEpoch = new Date(1900, 0, 1);
        return new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000);
      }
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    // Process Incomes
    const incomeSheet = workbook.getWorksheet("Incomes");
    if (incomeSheet) {
      const incomeRows = [];
      incomeSheet.eachRow((row, rowNumber) => { if(rowNumber > 1) incomeRows.push(row); });
      
      for (const row of incomeRows) {
        try {
          const title = getCellValue(row.getCell(2));
          const amount = getCellValue(row.getCell(3));
          if (title && amount !== null && amount !== undefined && !isNaN(Number(amount)) && Number(amount) > 0) {
            await Income.create({
              user: userId,
              title: String(title).trim(),
              amount: Number(amount),
              source: getCellValue(row.getCell(4)) ? String(getCellValue(row.getCell(4))).trim() : "Other",
              date: parseDate(getCellValue(row.getCell(1))),
            });
            importedIncomes++;
          }
        } catch (err) {
          console.error(`Error importing income row:`, err);
          errors.push(`Income row error: ${err.message}`);
        }
      }
    }

    // Process Expenses
    const expenseSheet = workbook.getWorksheet("Expenses");
    if (expenseSheet) {
      const expenseRows = [];
      expenseSheet.eachRow((row, rowNumber) => { if(rowNumber > 1) expenseRows.push(row); });

      for (const row of expenseRows) {
        try {
          const title = getCellValue(row.getCell(2));
          const amount = getCellValue(row.getCell(3));
          if (title && amount !== null && amount !== undefined && !isNaN(Number(amount)) && Number(amount) > 0) {
            await Expense.create({
              user: userId,
              title: String(title).trim(),
              amount: Number(amount),
              category: getCellValue(row.getCell(4)) ? String(getCellValue(row.getCell(4))).trim() : "Other",
              date: parseDate(getCellValue(row.getCell(1))),
            });
            importedExpenses++;
          }
        } catch (err) {
          console.error(`Error importing expense row:`, err);
          errors.push(`Expense row error: ${err.message}`);
        }
      }
    }

    res.status(200).json({ 
      message: "Import Processed", 
      importedIncomes,
      importedExpenses,
      errors: errors.length > 0 ? errors : undefined,
      status: (importedIncomes > 0 || importedExpenses > 0) ? "success" : "warning"
    });

  } catch (error) {
    console.log("Import Transactions Error:", error.message);
    res.status(500).json({ message: "Failed to process excel file. Ensure sheets are named 'Incomes' and 'Expenses'." });
  }
};

const getGlobalActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    let { page = 1, limit = 10, type, search, startDate, endDate, category } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch from all sources
    const [incomes, expenses, taxPayments, portfolio, subscriptions, sharedWallets] = await Promise.all([
      Income.find({ user: userId }),
      Expense.find({ user: userId }),
      TaxPayment.find({ user: userId }),
      Portfolio.find({ user: userId }),
      Subscription.find({ user: userId }),
      SharedWallet.find({ $or: [{ createdBy: userId }, { "members.user": userId }, { "members.email": req.user.email }] })
    ]);

    const sharedWalletExpenses = sharedWallets.flatMap(w => 
      w.expenses.filter(e => String(e.paidBy) === userId || e.paidByEmail === req.user.email)
        .map(e => ({ ...e.toObject(), walletName: w.name, walletCategory: w.category }))
    );

    // Normalize and Filter
    let all = [
      ...incomes.map(i => ({ ...i._doc, type: 'income', activityType: 'Cash Flow', displayType: 'Income' })),
      ...expenses.map(e => ({ ...e._doc, type: 'expense', activityType: 'Expenditure', displayType: 'Expense' })),
      ...taxPayments.map(t => ({ ...t._doc, title: t.description || 'Tax Payment', type: 'tax', activityType: 'Fiscal Duty', displayType: 'Tax', date: t.date || t.createdAt })),
      ...portfolio.map(p => ({ ...p._doc, title: `Invested in ${p.assetName}`, type: 'portfolio', activityType: 'Investment', displayType: 'Portfolio', amount: p.buyPrice * p.amount, date: p.createdAt })),
      ...subscriptions.map(s => ({ ...s._doc, title: `${s.name} Subscription`, type: 'expense', activityType: 'Recurring Outflow', displayType: 'Subscription', amount: s.billingCycle === 'Yearly' ? s.amount / 12 : s.amount, date: s.createdAt })),
      ...sharedWalletExpenses.map(e => ({ ...e, title: `${e.description} (Shared)`, type: 'expense', activityType: 'Collaboration', displayType: 'Shared', date: e.date }))
    ];

    // Apply Global Filters
    if (type && type !== 'all') {
      const t = type.toLowerCase();
      if (t === 'expenses') all = all.filter(a => a.type === 'expense');
      else if (t === 'income') all = all.filter(a => a.type === 'income');
      else if (t === 'tax') all = all.filter(a => a.type === 'tax');
      else if (t === 'portfolio') all = all.filter(a => a.type === 'portfolio');
    }

    if (search) {
      const s = search.toLowerCase();
      all = all.filter(a => 
        (a.title || '').toLowerCase().includes(s) || 
        (a.category || a.source || '').toLowerCase().includes(s)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      all = all.filter(a => new Date(a.date || a.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      all = all.filter(a => new Date(a.date || a.createdAt) <= end);
    }

    if (category) {
       all = all.filter(a => (a.category === category || a.source === category));
    }

    // Sort by Date Descending
    all.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    // Pagination
    const total = all.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = all.slice(startIndex, startIndex + limit);

    res.status(200).json({
      activities: paginatedItems,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    console.log("Get Global Activities Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getDashboardStats,
    getGlobalActivities,
    exportTransactions,
    importTransactions
}