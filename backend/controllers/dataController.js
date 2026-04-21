const Expense = require("../models/Expense");
const Income = require("../models/Income");

// @desc    Bulk Import Data
// @route   POST /api/v1/data/import
// @access  Private
exports.importData = async (req, res) => {
  try {
    const { data } = req.body;
    const userId = req.user.id;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or empty data array" });
    }

    const expensesToInsert = [];
    const incomesToInsert = [];

    data.forEach(item => {
      const type = (item.Type || item.type || "expense").toLowerCase();
      const entry = {
        user: userId,
        title: item.Title || item.title || item.Description || item.description || "Imported Entry",
        amount: Number(item.Amount || item.amount) || 0,
        date: item.Date || item.date || new Date()
      };

      if (type === 'income') {
        entry.source = item.Source || item.source || item.Category || item.category || "Other";
        incomesToInsert.push(entry);
      } else {
        entry.category = item.Category || item.category || "Other";
        incomesToInsert.length; // no-op
        expensesToInsert.push(entry);
      }
    });

    if (expensesToInsert.length > 0) await Expense.insertMany(expensesToInsert);
    if (incomesToInsert.length > 0) await Income.insertMany(incomesToInsert);

    res.status(200).json({
      success: true,
      message: `Imported ${expensesToInsert.length} expenses and ${incomesToInsert.length} incomes successfully.`,
      count: expensesToInsert.length + incomesToInsert.length
    });
  } catch (err) {
    console.error("Import Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Export Expenses as CSV
// @route   GET /api/v1/data/export/expenses
// @access  Private
exports.exportExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    
    let csv = "Type,Title,Amount,Category,Date,Method\n";
    expenses.forEach(e => {
      csv += `Expense,"${e.title}",${e.amount},"${e.category || 'Other'}","${new Date(e.date).toLocaleDateString()}","${e.method || 'Cash'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expenses_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error("Export Expenses Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Export Income as CSV
// @route   GET /api/v1/data/export/income
// @access  Private
exports.exportIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });
    
    let csv = "Type,Title,Amount,Source,Date\n";
    incomes.forEach(i => {
      csv += `Income,"${i.title}",${i.amount},"${i.source || 'Other'}","${new Date(i.date).toLocaleDateString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="income_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error("Export Income Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Export All Data as CSV
// @route   GET /api/v1/data/export/all
// @access  Private
exports.exportAll = async (req, res) => {
  try {
    const [expenses, incomes] = await Promise.all([
      Expense.find({ user: req.user.id }).sort({ date: -1 }),
      Income.find({ user: req.user.id }).sort({ date: -1 })
    ]);
    
    let csv = "Type,Title,Amount,Category/Source,Date,Method\n";
    expenses.forEach(e => {
      csv += `Expense,"${e.title}",${e.amount},"${e.category || 'Other'}","${new Date(e.date).toLocaleDateString()}","${e.method || 'Cash'}"\n`;
    });
    incomes.forEach(i => {
      csv += `Income,"${i.title}",${i.amount},"${i.source || 'Other'}","${new Date(i.date).toLocaleDateString()}",""\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="all_data_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error("Export All Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Export All Data as PDF (simple text-based)
// @route   GET /api/v1/data/export/pdf
// @access  Private
exports.exportPDF = async (req, res) => {
  try {
    const [expenses, incomes] = await Promise.all([
      Expense.find({ user: req.user.id }).sort({ date: -1 }),
      Income.find({ user: req.user.id }).sort({ date: -1 })
    ]);
    
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    
    // Generate a simple HTML report that can be rendered as PDF on frontend
    const html = `
<!DOCTYPE html>
<html><head><title>Luminescent Ledger - Financial Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
  body { font-family: 'Outfit', sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
  h1 { font-size: 28px; font-weight: 800; margin: 0; color: #1a1c1e; letter-spacing: -1px; }
  .brand { color: #6366f1; font-style: italic; }
  .timestamp { font-size: 11px; font-bold; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
  
  .summary-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-bottom: 40px; }
  .card { padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; position: relative; }
  .card h3 { font-size: 10px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; color: #64748b; letter-spacing: 1px; }
  .card p { font-size: 24px; font-weight: 800; margin: 0; color: #1e293b; }
  .card.income { background: #f0fdf4; border-color: #bcf0da; }
  .card.expense { background: #fef2f2; border-color: #fecaca; }
  .card.balance { background: #f5f3ff; border-color: #ddd6fe; }
  .card.income p { color: #166534; }
  .card.expense p { color: #991b1b; }
  .card.balance p { color: #5b21b6; }

  h2 { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 30px 0 15px 0; color: #475569; display: flex; align-items: center; gap: 8px; }
  h2::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

  table { width: 100%; border-collapse: collapse; font-size: 12px; page-break-inside: auto; }
  tr { page-break-inside: avoid; page-break-after: auto; }
  th { background: #f8fafc; text-align: left; padding: 12px; color: #64748b; font-weight: 800; border-bottom: 1px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  .amt { font-weight: 600; text-align: right; }
  .cat { font-size: 10px; font-weight: 600; background: #f1f5f9; padding: 2px 8px; border-radius: 99px; }
  
  .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; text-align: center; color: #94a3b8; }
</style></head><body>
<div class="header">
  <div>
    <h1>Luminescent <span class="brand">Ledger</span></h1>
    <p class="timestamp">Master Financial Report</p>
  </div>
  <div style="text-align: right">
    <p class="timestamp">Generated on</p>
    <p style="font-size: 12px; font-weight: 800;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</div>

<div class="summary-grid">
  <div class="card income"><h3>Gross Inflow</h3><p>Rs ${totalIncome.toLocaleString()}</p></div>
  <div class="card expense"><h3>Total Outflow</h3><p>Rs ${totalExpense.toLocaleString()}</p></div>
  <div class="card balance"><h3>Net Position</h3><p>Rs ${(totalIncome - totalExpense).toLocaleString()}</p></div>
</div>

<h2>Cash Flow Inflow (${incomes.length} records)</h2>
<table><thead><tr><th>Date</th><th>Description</th><th>Source</th><th class="amt">Volume</th></tr></thead><tbody>
${incomes.map(i => `<tr><td>${new Date(i.date).toLocaleDateString()}</td><td style="font-weight:600">${i.title}</td><td><span class="cat">${i.source || 'General'}</span></td><td class="amt" style="color:#166534">+Rs ${i.amount.toLocaleString()}</td></tr>`).join('')}
</tbody></table>

<h2>Expenditure Log (${expenses.length} records)</h2>
<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="amt">Volume</th></tr></thead><tbody>
${expenses.map(e => `<tr><td>${new Date(e.date).toLocaleDateString()}</td><td style="font-weight:600">${e.title}</td><td><span class="cat">${e.category || 'Lifestyle'}</span></td><td class="amt" style="color:#991b1b">-Rs ${e.amount.toLocaleString()}</td></tr>`).join('')}
</tbody></table>

<div class="footer">
  This is a system-generated fiscal report from Luminescent Ledger Command Center. 
  All accurate records are synchronized with our real-time fiscal engine.
  <br/>&copy; ${new Date().getFullYear()} Luminescent Ledger Enterprise. All rights reserved.
</div>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error("Export PDF Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Dynamic CSV Template
// @route   GET /api/v1/data/template/:type
// @access  Private
exports.getTemplate = async (req, res) => {
  try {
    const { type } = req.params;
    let csv = "";
    
    if (type === 'expense') {
      csv = "Type,Title,Amount,Category,Date,Method\nExpense,Sample Grocery,2500,Shopping,2026-01-15,Cash\nExpense,Electricity Bill,3200,Bills,2026-01-20,Bank Transfer\n";
    } else if (type === 'income') {
      csv = "Type,Title,Amount,Source,Date\nIncome,Monthly Salary,85000,Salary,2026-01-01\nIncome,Freelance Project,15000,Freelancing,2026-01-10\n";
    } else {
      csv = "Type,Title,Amount,Category/Source,Date,Method\nExpense,Sample Grocery,2500,Shopping,2026-01-15,Cash\nIncome,Monthly Salary,85000,Salary,2026-01-01,\n";
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_template.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
