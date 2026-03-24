import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ExpenseEditModal from "./ExpenseEditModal";
import IncomeEditModal from "./IncomeEditModal";
import { 
  LayoutDashboard, Wallet, CreditCard, LogOut, ArrowUpRight, 
  ArrowDownLeft, Menu, X, TrendingUp, History, ChevronRight, Download, UploadCloud,
  Settings as SettingsIcon, Calculator as CalcIcon, RefreshCcw, Bell, ArrowRightLeft, Lightbulb
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'react-hot-toast';

import Expense from "./Expense"; 
import AddIncome from "./AddIncome";
import ExpenseTable from './ExpenseTable';
import IncomeTable from './IncomeTable';
import ProfileSettings from './ProfileSettings';
import Calculator from './Calculator';
import CurrencyConverter from './CurrencyConverter';
import Reminders from './Reminders';

const ResponsiveDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null);
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    checkAuth();
    refreshData();
  }, []);

 const refreshData = () => {
  fetchExpenses();
  fetchIncome();
  fetchStats();
  fetchGoals();
};


  const checkAuth = async () => {
    try {
      const response = await fetch(
         `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/me`,
         { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error("Not authenticated");
      const data = await response.json(); 
      setUser(data); 
      setLoading(false);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/expenses/get`,
         { credentials: "include" });
      const data = await res.json();
      setExpenses(data);
    } catch (err) { console.log(err); }
  };

  const deleteExpense = async (id) => {
    try {
      const res = await fetch(
         `${import.meta.env.VITE_BACKEND_URL}/api/v1/expenses/delete/${id}`,
         { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      setExpenses((prev) => prev.filter((item) => item._id !== id));
      toast.success("Expense Deleted");
    } catch (error) { 
        console.log(error); 
        toast.error("Failed to delete");
    }
  };

  const updateExpense = async (updatedData) => {
    try {
      const res = await fetch(
                 `${import.meta.env.VITE_BACKEND_URL}/api/v1/expenses/update/${updatedData._id}`,
         {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setExpenses((prev) => prev.map((item) => item._id === data._id ? data : item));
      setEditingExpense(null);
      toast.success("Updated Successfully");
    } catch (error) { 
        console.log(error); 
        toast.error("Update failed");
    }
  };

  const handleLogout = async () => {
     try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/logout`,
         { method: "POST", credentials: "include" });
      
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate('/login');
     } catch (error) { console.log("Logout Error:", error); }
  }

  const fetchIncome = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/income/getIncome`,
         { credentials: "include" });
      const data = await res.json();
      setIncomes(data);
    } catch (err) { console.log(err); }
  };

  const deleteIncome = async (id) => {
    try {
      const res = await fetch(
         `${import.meta.env.VITE_BACKEND_URL}/api/v1/income/delete/${id}`,
         { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
      setIncomes((prev) => prev.filter((item) => item._id !== id));
      toast.success("Income Deleted");
    } catch (error) { 
        console.log(error); 
        toast.error("Failed to delete");
    }
  };

  const updateIncome = async (updatedData) => {
    try {
      const res = await fetch(
                 `${import.meta.env.VITE_BACKEND_URL}/api/v1/income/update/${updatedData._id}`,
         {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setIncomes((prev) => prev.map((item) => item._id === data._id ? data : item));
      setEditingIncome(null);
      toast.success("Updated Successfully");
    } catch (error) { 
        console.log(error); 
        toast.error("Update failed");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/dashboard/stats`,
         { credentials: "include" });
      const data = await res.json();
      setStats(data);
    } catch (err) { console.log(err); }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/goals/get`,
         { credentials: "include" });
      const data = await res.json();
      setGoals(data);
    } catch (err) { console.log(err); }
  };

  const handleExport = async () => {
    const loadingToast = toast.loading("Preparing export...");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/dashboard/export`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ExpanseMate_Transactions.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Transactions exported successfully!", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to export transactions", { id: loadingToast });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading("Processing import...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/dashboard/import`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      const data = await response.json();
      
      // Add a small delay to ensure database operations are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      refreshData();
      
      if (data.errors && data.errors.length > 0) {
        toast.error(`Import completed with ${data.errors.length} errors. Check console for details.`, { id: loadingToast });
      } else {
        toast.success(`Successfully imported ${data.importedIncomes} incomes and ${data.importedExpenses} expenses!`, { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to import transactions", { id: loadingToast });
    } finally {
      e.target.value = null; // Reset input
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-sm font-black text-slate-800 tracking-widest uppercase mb-1">ExpanseMate</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initializing Dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  const DashboardHome = () => {
    const chartData = [
      { name: 'Expenses', value: stats.totalExpense || 0, color: '#f43f5e' },
      { name: 'Income', value: stats.totalIncome || 0, color: '#10b981' },
      { name: 'Balance', value: stats.totalBalance || 0, color: '#6366f1' },
    ];

    const activeGoal = goals.length > 0 ? goals[0] : null;
    const goalTarget = activeGoal ? activeGoal.targetAmount : 10000;
    const goalCurrent = activeGoal ? activeGoal.currentAmount : 0;
    const goalName = activeGoal ? activeGoal.name : "Savings Goal";
    const goalProgress = Math.min(Math.round((goalCurrent / goalTarget) * 100), 100);
    const goalRemaining = Math.max(goalTarget - goalCurrent, 0);

    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in-up">
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Overview</h2>
            <p className="text-slate-500 font-medium tracking-tight">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! Ready to manage your finances?</p>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="glass-panel text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-white transition-all flex items-center gap-2 border-slate-100"
            >
              <UploadCloud size={16} /> Import
            </button>
            <button 
              onClick={handleExport}
              className="glass-panel text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-white transition-all flex items-center gap-2 hidden sm:flex border-slate-100"
            >
              <Download size={16} /> Export
            </button>
            <button 
              onClick={() => setActiveTab('expense')}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
            >
              <ArrowDownLeft size={16} /> Add Expense
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Balance"
            amount={stats.totalBalance || 0}
            icon={<Wallet className="text-indigo-600" />}
            trend="Live"
            color="indigo"
          />
          <StatCard 
            title="Total Income"
            amount={stats.totalIncome || 0}
            icon={<TrendingUp className="text-emerald-600" />}
            trend="Active"
            color="emerald"
          />
          <StatCard 
            title="Total Expenses"
            amount={stats.totalExpense || 0}
            icon={<ArrowUpRight className="text-rose-600" />}
            trend="Tracked"
            color="rose"
          />
        </div>

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel p-8 flex flex-col justify-center items-center relative overflow-hidden group">
            <div className="absolute top-6 left-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Distribution</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Allocation</p>
            </div>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                  <Pie 
                    data={chartData} 
                    dataKey="value" 
                    innerRadius="65%" 
                    outerRadius="85%" 
                    paddingAngle={8} 
                    cornerRadius={12}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} className="outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Worth</span>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">Rs {stats.totalBalance?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <FinancialHealthScore income={stats.totalIncome || 0} expense={stats.totalExpense || 0} />
        </div>

        {/* Intelligence & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <IntelligenceBox />
           <div className="space-y-6">
              <div className="bg-linear-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100 group">
                 {activeGoal ? (
                   <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                       <h4 className="text-indigo-100 text-xs font-black uppercase tracking-widest">{goalName}</h4>
                       <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">{goalProgress}%</span>
                     </div>
                     <p className="text-4xl font-black mb-6 tracking-tighter">Progress Tracker</p>
                     <div className="w-full bg-white/10 h-4 rounded-full mb-3 p-1">
                       <div className="bg-white h-full rounded-full transition-all duration-[1500ms] shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{width: `${goalProgress}%`}}></div>
                     </div>
                     <p className="text-xs font-bold text-indigo-100 flex items-center gap-2">
                       {goalRemaining > 0 ? (
                         <>Target: Rs {goalTarget?.toLocaleString()} <ArrowRightLeft size={10} className="opacity-50" /> Left: Rs {goalRemaining?.toLocaleString()}</>
                       ) : 'Target achieved! 🎉 Excellence unlocked.'}
                     </p>
                   </div>
                 ) : (
                   <div className="relative z-10 text-center py-4">
                     <h4 className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-2">Savings Goal</h4>
                     <p className="text-2xl font-black mb-4 tracking-tighter">Plan Your Future</p>
                     <button onClick={() => setActiveTab('profile')} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">Set a Savings Goal</button>
                   </div>
                 )}
                 <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
              </div>
              
              <div className="glass-panel p-8 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-6">
                   <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                     <History size={16} className="text-indigo-600" /> Recent Transactions
                   </h4>
                   <button onClick={() => setActiveTab('allExpense')} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">See All</button>
                 </div>
                 <div className="space-y-4">
                   {[...expenses].slice(0, 4).map((exp, i) => (
                     <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group/item">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-50 group-hover/item:bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-rose-500 font-bold transition-colors">
                           <CreditCard size={18} />
                         </div>
                         <div>
                           <p className="text-xs font-black text-slate-700">{exp.description || exp.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(exp.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {exp.category}</p>
                         </div>
                       </div>
                       <span className="text-sm font-black text-rose-500">-Rs {exp.amount?.toLocaleString()}</span>
                     </div>
                   ))}
                   {expenses.length === 0 && (
                      <div className="text-center py-6">
                         <p className="text-xs font-bold text-slate-400 uppercase">No recent activity</p>
                      </div>
                   )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-50 p-8 transition-all duration-500 
        lg:translate-x-0 lg:static z-50 flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-[1rem] flex items-center justify-center shadow-2xl shadow-indigo-100">
              <LayoutDashboard className="text-white" size={22} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tighter">ExpanseMate</span>
          </div>
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setSidebarOpen(false)}><X size={20}/></button>
        </div>

        {user && (
          <div onClick={() => setActiveTab('profile')} className="mb-10 bg-slate-50/50 p-4 rounded-[1.8rem] flex items-center gap-4 border border-slate-100/50 cursor-pointer hover:bg-slate-50 transition-all group">
            <div className="w-11 h-11 rounded-[1.2rem] overflow-hidden shadow-sm bg-indigo-100 flex-shrink-0 group-hover:rotate-6 transition-transform">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=fff`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-black text-lg">
                  {user.fullName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-slate-800 tracking-tight">{user.fullName}</p>
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active session</p>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-4 opaciy-60">Finance</p>
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }} />
          <NavItem icon={<Wallet size={18} />} label="Incomes" active={activeTab === "addIncome" || activeTab === "incomeRecord"} onClick={() => { setActiveTab("addIncome"); setSidebarOpen(false); }} />
          <NavItem icon={<CreditCard size={18} />} label="Expenses" active={activeTab === "expense" || activeTab === "allExpense"} onClick={() => { setActiveTab("expense"); setSidebarOpen(false); }} />
          
          <div className="h-4"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-4 opacity-60">Mate Tools</p>
          <NavItem icon={<Bell size={18} />} label="Reminders" active={activeTab === "reminders"} onClick={() => { setActiveTab("reminders"); setSidebarOpen(false); }} />
          <NavItem icon={<CalcIcon size={18} />} label="Calculator" active={activeTab === "calculator"} onClick={() => { setActiveTab("calculator"); setSidebarOpen(false); }} />
          <NavItem icon={<RefreshCcw size={18} />} label="Converter" active={activeTab === "converter"} onClick={() => { setActiveTab("converter"); setSidebarOpen(false); }} />
          
          <div className="h-4"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-4 opacity-60">Account</p>
          <NavItem icon={<SettingsIcon size={18} />} label="Settings" active={activeTab === "profile"} onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }} />
        </nav>

        <button onClick={handleLogout} className="mt-8 flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="lg:hidden flex justify-between items-center p-6 bg-white border-b sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white" size={18} />
             </div>
             <span className="font-black text-slate-900 tracking-tight text-sm uppercase">ExpanseMate</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-slate-50 rounded-xl text-slate-600"><Menu size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardHome />}
          {activeTab === "expense" && (
            <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
              <div className="flex justify-between items-end mb-4 px-2">
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manage Expenses</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Track your spending</p>
                 </div>
                 <button onClick={() => setActiveTab('allExpense')} className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl font-bold text-xs text-indigo-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <History size={16} /> View History
                 </button>
              </div>
              <Expense onSuccess={refreshData} />
            </div>
          )}
          {activeTab === "addIncome" && (
            <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
              <div className="flex justify-between items-end mb-4 px-2">
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Source Income</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add your earnings</p>
                 </div>
                 <button onClick={() => setActiveTab('incomeRecord')} className="px-5 py-2.5 bg-white border border-slate-100 rounded-xl font-bold text-xs text-indigo-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <TrendingUp size={16} /> Income Records
                 </button>
              </div>
              <AddIncome onSuccess={refreshData} />
            </div>
          )}
          {activeTab === "calculator" && <div className="p-6 lg:p-20 flex justify-center"><Calculator /></div>}
          {activeTab === "converter" && <div className="p-6 lg:p-20 flex justify-center"><CurrencyConverter /></div>}
          {activeTab === "reminders" && <div className="p-6 lg:p-10 max-w-6xl mx-auto"><Reminders /></div>}
          {activeTab === "allExpense" && <div className="p-6 lg:p-10 max-w-6xl mx-auto"><ExpenseTable expenses={expenses} onEdit={(e) => setEditingExpense(e)} onDelete={deleteExpense} /></div>}
          {activeTab === "incomeRecord" && <div className="p-6 lg:p-10 max-w-6xl mx-auto"><IncomeTable incomes={incomes} onEdit={(e) => setEditingIncome(e)} onDelete={deleteIncome} /></div>}
          {activeTab === "profile" && <div className="p-6 lg:p-10 max-w-5xl mx-auto"><ProfileSettings user={user} stats={stats} onSuccess={checkAuth} /></div>}
        </div>
      </main>

      {editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
           <ExpenseEditModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSave={updateExpense} />
        </div>
      )}

      {editingIncome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
           <IncomeEditModal income={editingIncome} onClose={() => setEditingIncome(null)} onSave={updateIncome} />
        </div>
      )}
    </div>
  );
};


const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-3.5 rounded-[1.4rem] transition-all duration-300 group ${
      active ? "bg-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-1" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`}
  >
    <div className="flex items-center gap-3.5">
      <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
    </div>
    {active && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]"></div>}
  </button>
);

const StatCard = ({ title, amount, icon, color, trend }) => {
  const colorMap = {
    indigo: "bg-indigo-50/50 text-indigo-600 border-indigo-100/50",
    emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100/50",
    rose: "bg-rose-50/50 text-rose-600 border-rose-100/50"
  };

  return (
    <div className="glass-panel p-7 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group hover:-translate-y-1 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-[1.4rem] transition-transform group-hover:scale-110 duration-500 border ${colorMap[color]}`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <div className="flex flex-col items-end">
           <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${color.includes('emerald') || color.includes('indigo') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend}
           </span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">
          <span className="text-sm font-bold text-slate-300 mr-1.5 uppercase">Rs</span>
          {amount?.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const FinancialHealthScore = ({ income, expense }) => {
  const ratio = income > 0 ? (expense / income) : 0;
  const score = Math.max(0, Math.min(100, Math.round((1 - ratio) * 100)));
  
  let status = "Excellent";
  let color = "text-emerald-500";
  let bgColor = "bg-emerald-500";
  let strokeColor = "#10b981";

  if (score < 40) { 
    status = "Critical"; 
    color = "text-rose-500"; 
    bgColor = "bg-rose-500";
    strokeColor = "#f43f5e";
  } else if (score < 70) { 
    status = "Managed"; 
    color = "text-amber-500"; 
    bgColor = "bg-amber-500";
    strokeColor = "#f59e0b";
  }

  return (
    <div className="glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
       <div className="absolute top-6 left-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Audit</h4>
          <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Finance Score</p>
       </div>
       <div className="relative w-44 h-44 flex items-center justify-center mb-4 mt-6">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
             <circle cx="88" cy="88" r="75" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
             <circle cx="88" cy="88" r="75" stroke={strokeColor} strokeWidth="14" fill="transparent" strokeDasharray={471} strokeDashoffset={471 - (471 * score) / 100} className="transition-all duration-[2000ms] ease-out" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-5xl font-black text-slate-900 tracking-tighter">{score}</span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
          </div>
       </div>
       <div className={`px-4 py-1.5 rounded-full ${bgColor} text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200`}>
          {status} Level
       </div>
       <p className="mt-6 text-xs font-bold text-slate-400 leading-relaxed">
          {score > 70 ? "Excellent spending control. You are building wealth rapidly." : score > 40 ? "Your finances are stable, but there's room for optimization." : "Attention required: High expense ratio detected. Review your habits."}
       </p>
    </div>
  );
};

const IntelligenceBox = () => {
  const tips = [
    "Track every penny; small leaks sink big ships.",
    "Pay yourself first: save 20% of your income automatically.",
    "Avoid lifestyle inflation when your income increases.",
    "Diversify your investments to spread risk.",
    "Emergency funds should cover 3-6 months of expenses.",
    "Compound interest is the eighth wonder of the world.",
    "Budgeting isn't about restriction; it's about intentionality."
  ];
  const tip = tips[new Date().getDay() % tips.length];

  return (
    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl group min-h-[320px]">
       <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             ExpanseMate Intelligence
          </div>
          <p className="text-3xl font-black leading-tight tracking-tight mb-8 drop-shadow-md">
             "{tip}"
          </p>
       </div>
       <div className="relative z-10 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-500/20">EM</div>
             <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Wisdom</span>
                <span className="block text-[10px] font-bold text-indigo-300">v2.4 Neural Core</span>
             </div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 opacity-60">
             <Lightbulb size={20} className="text-indigo-400" />
          </div>
       </div>
       <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
       <Lightbulb className="absolute -bottom-10 -right-10 text-white/5 group-hover:rotate-12 transition-transform duration-700" size={180} />
    </div>
  );
};

export default ResponsiveDashboard;