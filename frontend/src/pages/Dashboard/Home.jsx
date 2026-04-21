import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, ShoppingCart, Target, Bot, ArrowRight, Activity, FileText, CreditCard, Users, Search, X, ArrowUpRight, Plus, BarChart3, ShieldCheck, Wrench } from 'lucide-react';
import QuickAddModal from '../../components/common/QuickAddModal';

const Home = () => {
  const { user, API, currencySymbol } = useAuth();
  const [stats, setStats] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, expRes, incRes, goalRes, actRes] = await Promise.all([
          fetch(`${API}/api/v1/dashboard/stats`, { credentials: 'include' }),
          fetch(`${API}/api/v1/expenses/get`, { credentials: 'include' }),
          fetch(`${API}/api/v1/income/getIncome`, { credentials: 'include' }),
          fetch(`${API}/api/v1/goals/get`, { credentials: 'include' }),
          fetch(`${API}/api/v1/dashboard/activities?limit=100`, { credentials: 'include' })
        ]);

        const [statsData, expData, incData, goalData, actData] = await Promise.all([
          statsRes.json(), expRes.json(), incRes.json(), goalRes.json(), actRes.json()
        ]);

        setStats(statsData);
        setExpenses(Array.isArray(expData) ? expData : []);
        setIncomes(Array.isArray(incData) ? incData : []);
        setGoals(Array.isArray(goalData) ? goalData : []);
        setActivities(Array.isArray(actData?.activities) ? actData.activities : (statsData.recentActivity || []));
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API]);

  const totalBalance = stats.totalBalance || 0;
  const totalIncome = stats.totalIncome || 0;
  const totalExpense = stats.totalExpense || 0;
  const totalTaxPaid = stats.totalTaxPaid || 0;
  const aggregateExpense = totalExpense + totalTaxPaid;
  const savingsRate = totalIncome > 0 ? (((totalIncome - aggregateExpense) / totalIncome) * 100).toFixed(1) : 0;

  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const [activityFilter, setActivityFilter] = useState('All');
  const totalAllocated = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredActivity = activities.filter(item => {
    if (logSearchQuery) {
      const q = logSearchQuery.toLowerCase();
      const t = item.title?.toLowerCase() || '';
      const c = item.category?.toLowerCase() || '';
      const a = item.amount?.toString() || '';
      if (!t.includes(q) && !c.includes(q) && !a.includes(q)) return false;
    }

    if (activityFilter === 'All') return true;
    if (activityFilter === 'Income') return item.type === 'income';
    if (activityFilter === 'Expense') return item.type === 'expense' && item.displayType !== 'Tax' && item.displayType !== 'Subscription' && item.displayType !== 'Shared';
    if (activityFilter === 'Tax') return item.displayType === 'Tax';
    if (activityFilter === 'Investment') return item.type === 'portfolio';
    return true;
  });

  return (
    <div className="page-container animate-fade-in-up pb-20">
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Overview</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="page-subtitle text-sm mt-1">All your money and expenses in one simple place.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Link to="/transactions" className="btn btn-primary px-4 flex-1 md:flex-none justify-center font-bold text-[10px] uppercase tracking-widest bg-surface-lowest border-glass-border shadow-sm transition-all hover:bg-surface-container hover:text-primary hover:border-primary/80 hover:border-1 hover:border-solid">
            <Activity size={14} className="mr-1" /> Transactions
          </Link>
          <Link to="/analytics" className="btn btn-outline px-4 flex-1 md:flex-none justify-center font-bold text-[10px] uppercase tracking-widest bg-surface-lowest border-glass-border shadow-sm transition-all hover:bg-surface-container">
            <BarChart3 size={14} className="mr-1" /> Analytics
          </Link>
          <Link to="/tools" className="btn btn-outline px-4 flex-1 md:flex-none justify-center font-bold text-[10px] uppercase tracking-widest bg-surface-lowest border-glass-border shadow-sm transition-all hover:bg-surface-container">
            <Wrench size={14} className="mr-1" /> Tools
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 stat-card bg-surface-container/10 border-primary/20 relative overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-colors !p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-8 -mt-8" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="stat-label">Total Balance</p>
              <div className="flex items-end gap-3 mt-0.5">
                <h3 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">{currencySymbol} {totalBalance.toLocaleString()}</h3>
                <div className={`flex items-center font-bold text-[10px] px-2 py-1 rounded-md mb-1 ${Number(savingsRate) >= 0 ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
                  {Number(savingsRate) >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                  {Math.abs(savingsRate)}% Saved
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-glass-border/50">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider opacity-70">Monthly Income</span>
                <span className="text-xs font-semibold text-success">{currencySymbol} {totalIncome.toLocaleString()}</span>
              </div>
              <div className="w-px h-5 bg-glass-border" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider opacity-70">Monthly Expense</span>
                <span className="text-xs font-semibold text-error">{currencySymbol} {totalExpense.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card flex flex-col justify-center hover:border-success/30 transition-colors !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="stat-label mb-0">Total Income</p>
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success"><Wallet size={16} /></div>
          </div>
          <h4 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">{currencySymbol} {totalIncome.toLocaleString()}</h4>
          <div className="flex items-center gap-1.5 mt-2 text-success">
            <TrendingUp size={12} />
            <span className="text-[11px] font-medium">Total Income</span>
          </div>
        </div>

        <div className="stat-card flex flex-col justify-center hover:border-error/30 transition-colors !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="stat-label mb-0">Total Expenses</p>
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error"><ShoppingCart size={16} /></div>
          </div>
          <h4 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">{currencySymbol} {totalExpense.toLocaleString()}</h4>
          <div className="flex items-center gap-1.5 mt-2 text-error">
            <TrendingDown size={12} />
            <span className="text-[11px] font-medium">{totalIncome > 0 ? `${((aggregateExpense / totalIncome) * 100).toFixed(0)}% Budget Used` : 'Budget Limit'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <section className="stat-card bg-primary/5 border-primary/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl rounded-full -mr-8 -mt-8" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Bot size={18} />
              </div>
              <h4 className="text-sm font-semibold text-primary tracking-wide">ExpenseMate Assistant</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
              {totalIncome > 0
                ? `You saved ${savingsRate}% this month. ${Number(savingsRate) > 20 ? 'Great job!' : 'Consider saving a bit more where possible.'} You could add ${currencySymbol} ${Math.round(totalIncome * 0.1).toLocaleString()} to your savings goals.`
                : 'I will give you advice when you add your income and expenses.'
              }
            </p>
            <Link to="/ai-advisor" className="btn btn-primary bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white py-2.5 text-xs font-semibold w-full justify-center transition-all">
              <Bot size={16} className="mr-2" /> View Advice
            </Link>
          </div>
        </section>

        <section className="stat-card">
          <h3 className="section-title text-base font-semibold mb-1 text-on-surface">Income vs Spending</h3>
          <p className="text-on-surface-variant text-xs mb-8">Compare what you made and what you spent</p>
          <div className="space-y-5 mt-2">
            {topCategories.length > 0 ? topCategories.map(([cat, amt], idx) => {
              const pct = Math.round((amt / totalAllocated) * 100);
              return (
                <div key={idx} className="space-y-2 group">
                  <div className="flex justify-between items-center cursor-default">
                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">{cat}</span>
                    <span className="text-sm font-bold text-on-surface">{currencySymbol} {amt.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar !h-1.5 bg-surface-lowest overflow-hidden rounded-full border border-glass-border">
                    <div
                      className={`progress-fill ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-secondary' : 'bg-tertiary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6 opacity-60">
                <p className="text-sm font-medium tracking-wide text-on-surface-variant">No spending data found.</p>
              </div>
            )}
          </div>
        </section>

        <section className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base font-semibold mb-0 text-on-surface">Savings Goals</h3>
            <Link to="/savings" className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors">Manage</Link>
          </div>
          <div className="space-y-4">
            {goals.length > 0 ? goals.slice(0, 3).map((goal, idx) => {
              const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
              return (
                <div key={idx} className="space-y-2 group p-2 rounded-xl hover:bg-surface-lowest transition-colors border border-transparent hover:border-glass-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-105">
                      <Target size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-on-surface truncate">{goal.name}</h4>
                      <p className="text-xs font-medium text-on-surface-variant mt-0.5">{currencySymbol} {(goal.currentAmount || 0).toLocaleString()} / {currencySymbol} {goal.targetAmount.toLocaleString()}</p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">{pct}%</span>
                  </div>
                  <div className="progress-bar !h-1.5 overflow-hidden rounded-full bg-background border border-glass-border">
                    <div className="progress-fill bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="empty-state !py-6 opacity-80">
                <Target size={24} className="mx-auto mb-3 text-on-surface-variant" />
                <p className="text-sm font-semibold mb-1">No active goals</p>
                <Link to="/savings" className="btn btn-outline text-xs px-5 mt-4 border-glass-border">Set Goal</Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-8 space-y-3">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-4 bg-surface-lowest/50 p-3 px-4 rounded-xl border border-glass-border">
          <div className="flex items-center gap-2">
            <h3 className="section-title mb-0 text-base font-semibold text-on-surface whitespace-nowrap">Recent Activity</h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{filteredActivity.length} Entries</span>
          </div>

          <div className="flex flex-col sm:flex-row flex-1 xl:flex-none justify-end gap-3 w-full xl:w-auto">
            <div className="relative flex-1 sm:w-64 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="w-full bg-surface-container border border-glass-border rounded-lg py-1.5 pl-9 pr-4 text-[12px] text-on-surface focus:outline-none focus:border-primary/50 transition-colors placeholder:text-on-surface-variant/50"
              />
            </div>

            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="bg-surface-container border border-glass-border rounded-lg py-1.5 px-3 text-[12px] text-on-surface focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-auto"
            >
              <option value="All">All</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Tax">Tax</option>
              <option value="Investment">Investment</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredActivity.length > 0 ? filteredActivity.slice(0, 10).map((item, idx) => {
            const handleRowClick = () => {
              if (item.displayType === 'Shared') return navigate('/shared-wallets');
              if (item.displayType === 'Subscription') return navigate('/subscriptions');
              if (item.displayType === 'Tax') return navigate('/tax-monitor');
              if (item.type === 'portfolio') return navigate('/portfolio');
              navigate('/transactions');
            };

            return (
              <div key={idx} 
                onClick={handleRowClick}
                className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-surface-lowest/70 border border-transparent hover:border-glass-border transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'income' || item.type === 'portfolio' ? 'bg-success/10 text-success' :
                  item.displayType === 'Tax' ? 'bg-warning/10 text-warning' :
                    item.displayType === 'Subscription' ? 'bg-primary/10 text-primary' :
                      item.displayType === 'Shared' ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'
                  }`}>
                  {item.type === 'income' ? <TrendingUp size={16} /> :
                    item.type === 'portfolio' ? <Activity size={16} /> :
                      item.displayType === 'Tax' ? <FileText size={16} /> :
                        item.displayType === 'Subscription' ? <CreditCard size={16} /> :
                          item.displayType === 'Shared' ? <Users size={16} /> : <TrendingDown size={16} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">
                    <span className="uppercase text-[9px] tracking-widest font-bold opacity-70 bg-surface-high px-1.5 py-0.5 rounded mr-1">{item.activityType || item.displayType || item.type}</span>
                    {item.category && <span className="mr-1">{item.category} <span className="opacity-50">•</span></span>} {new Date(item.date || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <p className={`text-sm font-bold tracking-tight ${item.type === 'income' || item.type === 'portfolio' ? 'text-success' : 'text-error'}`}>
                    {item.type === 'income' || item.type === 'portfolio' ? '+' : '-'}{currencySymbol} {item.amount?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  {item.source && <p className="text-[9px] uppercase tracking-wider font-semibold text-on-surface-variant mt-0.5">{item.source}</p>}
                </div>
                <ArrowUpRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-40 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </div>
            );
          }) : (
            <div className="text-center py-6 opacity-60 bg-surface-lowest/30 rounded-xl border border-glass-border border-dashed">
              <Activity size={20} className="mx-auto mb-2 text-on-surface-variant opacity-50" />
              <p className="text-sm font-medium mb-1">No Activity Logs</p>
            </div>
          )}
        </div>
        {filteredActivity.length > 6 && (
          <div className="text-center pt-2">
            <Link to="/transactions" className="btn btn-ghost text-xs font-medium px-6 py-2 text-primary hover:bg-primary/10">View All Transactions</Link>
          </div>
        )}
      </section>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-glass-border);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
          opacity: 0.1;
        }
      `}</style>
    </div>
  );
};

export default Home;