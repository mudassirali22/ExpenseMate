import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
// jspdf and jspdf-autotable are loaded dynamically inside handleDownloadPDF
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown,
  Search, PiggyBank, Landmark,
  ArrowDownUp, Activity,
  FileBarChart2, FileSpreadsheet
} from 'lucide-react';

const Analytics = () => {
  const { API, currencySymbol } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [actRes, goalRes] = await Promise.all([
          fetch(`${API}/api/v1/dashboard/activities?limit=2000`, { credentials: 'include' }),
          fetch(`${API}/api/v1/goals/get`, { credentials: 'include' })
        ]);
        const [actData, gData] = await Promise.all([actRes.json(), goalRes.json()]);
        const acts = Array.isArray(actData.activities) ? actData.activities : [];
        setIncomes(acts.filter(a => a.type === 'income'));
        setExpenses(acts.filter(a => a.type === 'expense' || a.type === 'tax' || a.type === 'portfolio'));
        setGoals(Array.isArray(gData) ? gData : []);
      } catch (err) {
        console.error('Analytics Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API]);

  const filteredData = useMemo(() => {
    if (filterType === 'All Time') {
      return { expenses, incomes };
    }

    const now = new Date();
    let startDate = new Date();
    if (filterType === 'This Week') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    } else if (filterType === 'Last 30 Days') {
      startDate.setDate(now.getDate() - 30);
    } else if (filterType === 'This Quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    } else if (filterType === 'This Year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    const filterFn = (item) => {
      const d = new Date(item.date || item.createdAt);
      return d >= startDate && d <= now;
    };
    return { expenses: expenses.filter(filterFn), incomes: incomes.filter(filterFn) };
  }, [expenses, incomes, filterType]);

  const fExpenses = filteredData.expenses;
  const fIncomes  = filteredData.incomes;

  const totalIncome  = fIncomes.reduce((acc, i) => acc + i.amount, 0);
  const totalExpense = fExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netSavings   = totalIncome - totalExpense;
  const totalBalance = netSavings;
  const activeSavings  = goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0);
  const investmentVal  = fExpenses
    .filter(e => e.category?.toLowerCase() === 'investment')
    .reduce((acc, e) => acc + e.amount, 0);

  //Derived metrics – defined early so PDF handler can use them 
  const portfolioGrowth = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  const catTotals = {};
  fExpenses.forEach(e => {
    const cat = e.category || 'Other';
    catTotals[cat] = (catTotals[cat] || 0) + e.amount;
  });
  const sortedCats   = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const pieData      = sortedCats.map(([name, value]) => ({ name, value }));
  const topCats      = sortedCats.slice(0, 4);
  const totalSpending = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1;
  const mainCatPct    = topCats.length > 0 ? Math.round((topCats[0][1] / totalSpending) * 100) : 0;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  //Trend data 
  const getTrendData = () => {
    const groups = {};
    const now    = new Date();
    const periods = filterType === 'This Year' ? 12 : filterType === 'This Quarter' ? 3 : 6;
    const format   = { month: 'short' };
    for (let i = periods - 1; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', format);
      groups[key] = { income: 0, expense: 0 };
    }
    fExpenses.forEach(e => {
      const key = new Date(e.date || e.createdAt).toLocaleString('en-US', format);
      if (groups[key]) groups[key].expense += e.amount;
    });
    fIncomes.forEach(i => {
      const key = new Date(i.date || i.createdAt).toLocaleString('en-US', format);
      if (groups[key]) groups[key].income += i.amount;
    });
    return Object.entries(groups);
  };
  const trendData = getTrendData();

  const chartTrendData = trendData
    .slice(0, filterType === 'This Year' ? 12 : 6)
    .reverse()
    .map(([name, data]) => ({ name: name.split(' ')[0], income: data.income, expense: data.expense }));

  // PDF Export — uses dynamic import to handle jspdf v4 ESM/CJS interop with Vite
  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF…', { id: 'pdf' });

      // Dynamic import handles jspdf v4 correctly regardless of bundler interop mode
      const jspdfModule = await import('jspdf');
      const jsPDFClass = jspdfModule.jsPDF || jspdfModule.default?.jsPDF || jspdfModule.default;
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule.autoTable;

      const doc = new jsPDFClass();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(22);
      doc.setTextColor(26, 26, 46);
      doc.text('ExpenseMate Financial Report', 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 28);
      doc.text(`Report Period: ${filterType}`, 20, 33);
      doc.setDrawColor(230, 230, 230);
      doc.line(20, 38, pageWidth - 20, 38);
      doc.setFontSize(14);
      doc.setTextColor(50);
      doc.text('Financial Summary', 20, 48);

      autoTable(doc, {
        startY: 52,
        head: [['Metric', `Amount (${currencySymbol})`]],
        body: [
          ['Total Income',     `${currencySymbol} ${totalIncome.toLocaleString()}`],
          ['Total Expenses',   `${currencySymbol} ${totalExpense.toLocaleString()}`],
          ['Net Savings',      `${currencySymbol} ${netSavings.toLocaleString()}`],
          ['Portfolio Growth', `${portfolioGrowth}%`],
          ['Active Savings',   `${currencySymbol} ${activeSavings.toLocaleString()}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10, cellPadding: 5 },
      });

      doc.setFontSize(14);
      doc.setTextColor(50);
      doc.text('Income Details', 20, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Description', 'Source', 'Amount']],
        body: fIncomes.map(i => [
          new Date(i.date || i.createdAt).toLocaleDateString(),
          i.title || i.description || '—',
          i.source || 'Other',
          `${currencySymbol} ${i.amount.toLocaleString()}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
      });

      if (doc.lastAutoTable.finalY > 220) doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(50);
      doc.text('Expense Details', 20, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'Description', 'Category', 'Amount']],
        body: fExpenses.map(e => [
          new Date(e.date || e.createdAt).toLocaleDateString(),
          e.title || e.description || '—',
          e.category || 'Other',
          `${currencySymbol} ${e.amount.toLocaleString()}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 9 },
      });

      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text('This report is generated automatically by ExpenseMate.', 20, doc.internal.pageSize.getHeight() - 10);
      doc.save(`ExpenseMate_Report_${filterType.replace(/ /g, '_')}.pdf`);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error(`PDF failed: ${err.message}`, { id: 'pdf' });
    }
  };

  // CSV Export 
  const handleDownloadCSV = () => {
    const rows = [
      ['Date', 'Type', 'Description', 'Category/Source', 'Amount'],
      ...fExpenses.map(e => [
        new Date(e.date || e.createdAt).toLocaleDateString(),
        'Expense',
        e.title || e.description || '—',
        e.category || 'Other',
        `${currencySymbol} ${e.amount.toLocaleString()}`
      ]),
      ...fIncomes.map(i => [
        new Date(i.date || i.createdAt).toLocaleDateString(),
        'Income',
        i.title || i.description || '—',
        i.source || 'Other',
        `${currencySymbol} ${i.amount.toLocaleString()}`
      ])
    ];
    
    // Sort combined rows by date descending (skipping the header)
    const dataRows = rows.slice(1).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    const finalRows = [rows[0], ...dataRows];

    const csvContent = finalRows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob       = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url        = URL.createObjectURL(blob);
    const link       = document.createElement('a');
    link.href        = url;
    link.download    = `ExpenseMate_Overall_Data_${filterType.replace(/ /g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV data exported!');
  };

  // Loading
  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in-up pb-20">

      {/*Header*/}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Analysis</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight">Financial Report</h1>
          <p className="page-subtitle text-sm mt-1">Insights on how your savings are growing and where you spend most.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Period Filter Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-lowest border border-glass-border rounded-xl py-2 px-4 text-xs font-bold text-on-surface focus:outline-none focus:border-primary/50 transition-all w-full sm:w-auto"
          >
            <option value="This Week">This Week</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
            <option value="All Time">All Time (Overall)</option>
          </select>

          {/* Export PDF */}
          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary px-5 py-2 font-semibold text-xs shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
          >
            <FileBarChart2 size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Growth Overview & Category Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

        {/* Growth Overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-8 stat-card flex flex-col md:flex-row justify-between gap-6 h-full !p-5 sm:!p-6 hover:border-primary/30 transition-colors group"
        >
          <div className="flex-1">
            <h3 className="section-title text-base font-semibold mb-4 text-on-surface">Account Balance</h3>
            <div className="flex items-end gap-4 mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-on-surface leading-none tracking-tight">
                {currencySymbol} {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </h2>
              <span className={`font-semibold text-sm flex items-center mb-1 ${totalBalance >= 0 ? 'text-success bg-success/10' : 'text-error bg-error/10'} px-2 py-1 rounded-md`}>
                {totalBalance >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {portfolioGrowth}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-glass-border/50">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-on-surface-variant opacity-80 mb-1">Weekly Avg Spend</span>
                <span className="text-lg font-bold text-on-surface">{currencySymbol} {Math.round(totalExpense / 4).toLocaleString()}</span>
              </div>
              <div className="w-px h-full bg-glass-border hidden sm:block justify-self-center" />
              <div className="flex flex-col sm:pl-4">
                <span className="text-xs font-medium text-on-surface-variant opacity-80 mb-1">Annual Forecast</span>
                <span className="text-lg font-bold text-on-surface">{currencySymbol} {(netSavings * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Side Mini-Cards */}
          <div className="flex flex-col gap-3 justify-center md:min-w-[200px]">
            {[
              { label: 'Active Savings', value: `${currencySymbol} ${(activeSavings > 0 ? activeSavings : 0).toLocaleString()}`, icon: PiggyBank, color: 'orange' },
              { label: 'Investment Value', value: `${currencySymbol} ${investmentVal.toLocaleString()}`,                          icon: Landmark,   color: 'blue'   },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-surface-lowest/50 rounded-xl p-3 px-4 flex items-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-glass-border/50 hover:border-glass-border cursor-default group/card"
              >
                <div className={`w-9 h-9 rounded-lg bg-${color}-500/10 flex items-center justify-center text-${color}-500 shrink-0 group-hover/card:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs font-medium">{label}</p>
                  <p className="text-on-surface font-bold text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Spending Categories Pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-4 stat-card flex flex-col h-full min-h-[380px] !p-6 hover:border-tertiary/30 transition-colors min-w-0"
        >
          <h3 className="section-title text-base font-semibold mb-1 text-on-surface">Spending Categories</h3>
          <p className="text-on-surface-variant text-xs mb-6">How you spend across different categories</p>

          <div className="flex-1 flex flex-col items-center justify-center -mt-4 min-h-0">
            <div className="w-full h-52 relative min-h-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} style={{ border: 'none', outline: 'none' }}>
                <PieChart style={{ outline: 'none', border: 'none' }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={0}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={2000}
                    animationEasing="ease-out"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'var(--on-surface)', fontWeight: 'bold' }}
                    formatter={(value) => `${currencySymbol} ${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-on-surface">{mainCatPct}%</span>
                <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider leading-none mt-1">
                  {topCats[0]?.[0] || 'No Data'}
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 mt-4">
              {topCats.slice(0, 3).map((cat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex justify-between items-center w-full text-sm py-1"
                >
                   <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    {cat[0]}
                  </div>
                  <span className="font-semibold text-on-surface text-sm">{currencySymbol} {cat[1].toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Cashflow Trends & Income vs Liability*/}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

        {/* Cashflow Trends */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-8 stat-card min-h-[350px] !p-6 hover:border-secondary/30 transition-colors min-w-0"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="section-title text-base font-semibold mb-1 text-on-surface">Money Flow</h3>
              <p className="text-on-surface-variant text-xs">See what you made and what you spent over time</p>
            </div>
            <div className="flex items-center gap-5 text-xs font-semibold text-on-surface-variant bg-surface-low px-3 py-1.5 rounded-lg border border-glass-border">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-success" /> Income</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-error"   /> Expenses</div>
            </div>
          </div>

          <div className="h-56 w-full -ml-4 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} style={{ border: 'none', outline: 'none' }}>
              <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} style={{ outline: 'none', border: 'none' }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--success-color)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--success-color)" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--error-color)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--error-color)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" opacity={0.3} />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fill: 'var(--on-surface-variant)', fontSize: 11 }}
                  tickFormatter={(val) => `${currencySymbol} ${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--glass-border)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                />
                <Area type="monotone" dataKey="income"  stroke="var(--success-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)"  animationDuration={1500} />
                <Area type="monotone" dataKey="expense" stroke="var(--error-color)"   strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Income vs Liability */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-4 stat-card flex flex-col !p-6 hover:border-primary/30 transition-colors"
        >
          <h3 className="section-title text-base font-semibold mb-1 text-on-surface">Income vs Spending</h3>
          <p className="text-on-surface-variant text-xs mb-8">Compare what you made and what you spent</p>

          <div className="space-y-6 flex-1">
            {[
              { label: 'Earned', value: `+${totalIncome.toLocaleString()}`, fill: 100, color: 'bg-success', textColor: 'text-success' },
              { label: 'Spent',  value: `-${totalExpense.toLocaleString()}`, fill: totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : (totalExpense > 0 ? 100 : 0), color: 'bg-error', textColor: 'text-error' },
            ].map(({ label, value, fill, color, textColor }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">{label}</span>
                  <span className={`${textColor} font-semibold`}>{value}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-lowest rounded-full overflow-hidden border border-glass-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fill}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-glass-border/50 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Net Savings</p>
              <h2 className="text-2xl font-bold text-on-surface tracking-tight">{currencySymbol} {netSavings.toLocaleString()}</h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ArrowDownUp size={18} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Financial Log Table*/}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="stat-card !p-6 lg:!p-8 hover:border-primary/20 transition-colors"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="section-title text-base font-semibold mb-1 text-on-surface">Monthly Report</h3>
            <p className="text-on-surface-variant text-xs">A simple summary of your monthly spending</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search months or amounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-low border border-glass-border rounded-xl py-2 pl-9 pr-4 text-xs text-on-surface focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50"
              />
            </div>
            {/* CSV Export */}
            <button
              onClick={handleDownloadCSV}
              className="btn btn-outline px-4 py-2 text-xs font-semibold whitespace-nowrap border-glass-border flex items-center gap-2"
            >
              <FileSpreadsheet size={14} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-surface-container/20 rounded-xl border border-glass-border">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant bg-surface-low border-b border-glass-border">
                <th className="py-4 px-5 w-1/4">Period</th>
                <th className="py-4 px-5">Total Income</th>
                <th className="py-4 px-5">Total Expense</th>
                <th className="py-4 px-5">Net Savings</th>
                <th className="py-4 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {trendData
                .slice(0, 12)
                .filter(([month, d]) => {
                  if (d.income === 0 && d.expense === 0) return false;
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    month.toLowerCase().includes(q) ||
                    d.income.toString().includes(q) ||
                    d.expense.toString().includes(q) ||
                    (d.income - d.expense).toString().includes(q)
                  );
                })
                .map(([month, data], idx) => {
                  const net       = data.income - data.expense;
                  const status    = net > 0 ? 'Surplus' : net < 0 ? 'Deficit' : 'Neutral';
                  const statColor = net > 0
                    ? 'text-success bg-success/10'
                    : net < 0 ? 'text-error bg-error/10' : 'text-on-surface-variant bg-surface-low';

                  return (
                    <tr key={idx} className="hover:bg-primary/[0.02] transition-colors border-b border-glass-border/50 last:border-0 border-dashed">
                      <td className="py-4 px-5 text-on-surface font-semibold">{month}</td>
                      <td className="py-4 px-5 text-on-surface-variant">{currencySymbol} {data.income.toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
                      <td className="py-4 px-5 text-on-surface-variant">{currencySymbol} {data.expense.toLocaleString(undefined, { minimumFractionDigits: 0 })}</td>
                      <td className={`py-4 px-5 font-bold tracking-tight ${net > 0 ? 'text-success' : 'text-error'}`}>
                        {currencySymbol} {net.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide ${statColor}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {trendData.filter(([, d]) => d.income > 0 || d.expense > 0).length === 0 && (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-on-surface-variant text-sm bg-surface-lowest/50">
                    <Activity size={32} className="mx-auto mb-3 opacity-30" />
                    No money data found for this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

    </div>
  );
};

export default Analytics;
