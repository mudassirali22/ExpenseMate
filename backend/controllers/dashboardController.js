const Expense = require("../models/Expense");
const Income = require("../models/Income");

const getDashboardStats = async (req, res)=>{
try {
    const userId = req.user.id;

    const incomes = await Income.find({ user: userId});
    const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
    
    const expense = await Expense.find({ user: userId});
    const totalExpense = expense.reduce((acc, item) => acc + item.amount, 0);

    const totalBalance = totalIncome - totalExpense;
      
    res.status(200).json({
      totalIncome,
      totalExpense,
      totalBalance
    });


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
      incomeSheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 1) return; // Skip header
        
        try {
          const dateVal = getCellValue(row.getCell(1));
          const title = getCellValue(row.getCell(2));
          const amount = getCellValue(row.getCell(3));
          const source = getCellValue(row.getCell(4));

          if (title && amount) {
            // We use a promise array or async/await. Since eachRow is sync in its iteration but we need async, 
            // we'll collect promises or use a traditional for loop if we want strict serial execution.
            // However, to keep it simple and fix the immediate bug:
            const incomeData = {
              user: userId,
              title: String(title),
              amount: Number(amount),
              source: source || "Other",
              date: dateVal ? new Date(dateVal) : new Date(),
            };
            
            // To ensure these are saved, we should really use a for loop with worksheet.rows
            // but exceljs eachRow is commonly used. Let's switch to a for loop for safety with async.
          }
        } catch (e) {
          errors.push(`Income Row ${rowNumber}: ${e.message}`);
        }
      });

      // Refined iteration for async/await support
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

module.exports = {
    getDashboardStats,
    exportTransactions,
    importTransactions
}