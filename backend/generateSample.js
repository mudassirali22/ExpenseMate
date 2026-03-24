const ExcelJS = require('exceljs');
const path = require('path');

const generateSampleExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  
  // Income Sheet
  const incomeSheet = workbook.addWorksheet('Incomes');
  incomeSheet.columns = [
    { header: 'Title', key: 'title' },
    { header: 'Amount', key: 'amount' },
    { header: 'Source', key: 'source' },
    { header: 'Date', key: 'date' },
  ];
  incomeSheet.addRow({ title: 'Sample Salary', amount: 5000, source: 'Salary', date: new Date() });
  incomeSheet.addRow({ title: 'Freelance Work', amount: 1500, source: 'Freelance', date: new Date() });

  // Expense Sheet
  const expenseSheet = workbook.addWorksheet('Expenses');
  expenseSheet.columns = [
    { header: 'Title', key: 'title' },
    { header: 'Amount', key: 'amount' },
    { header: 'Category', key: 'category' },
    { header: 'Date', key: 'date' },
  ];
  expenseSheet.addRow({ title: 'Groceries', amount: 200, category: 'Food', date: new Date() });
  expenseSheet.addRow({ title: 'Rent', amount: 1200, category: 'Bills', date: new Date() });

  const filePath = path.join(__dirname, 'sample_import.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Sample Excel file created at: ${filePath}`);
};

generateSampleExcel().catch(err => console.error(err));
