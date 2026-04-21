import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, TrendingUp, Activity, FileText, CreditCard, Users, TrendingDown, ArrowUpRight } from 'lucide-react';
import { TRANSACTION_TYPES } from '../../constants';

const DashboardActivities = ({ activities, currencySymbol, searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filtered = activities.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const t = item.title?.toLowerCase() || '';
      const c = item.category?.toLowerCase() || '';
      const a = item.amount?.toString() || '';
      if (!t.includes(q) && !c.includes(q) && !a.includes(q)) return false;
    }

    if (filter === 'All') return true;
    if (filter === 'Income') return item.type === 'income';
    if (filter === 'Expense') return item.type === 'expense' && !['Tax', 'Subscription', 'Shared'].includes(item.displayType);
    if (filter === 'Tax') return item.displayType === 'Tax';
    if (filter === 'Investment') return item.type === 'portfolio';
    return true;
  });

  const handleRowClick = (item) => {
    if (item.displayType === 'Shared') return navigate('/shared-wallets');
    if (item.displayType === 'Subscription') return navigate('/subscriptions');
    if (item.displayType === 'Tax') return navigate('/tax-monitor');
    if (item.type === 'portfolio') return navigate('/portfolio');
    navigate('/transactions');
  };

  return (
    <section className="mt-8 space-y-3">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-4 bg-surface-lowest/50 p-3 px-4 rounded-xl border border-glass-border">
        <div className="flex items-center gap-2">
          <h3 className="section-title mb-0 text-base font-semibold text-on-surface whitespace-nowrap">Recent Activity</h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{filtered.length} Entries</span>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 xl:flex-none justify-end gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-64 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-glass-border rounded-lg py-1.5 pl-9 pr-4 text-[12px] text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-container border border-glass-border rounded-lg py-1.5 px-3 text-[12px] text-on-surface focus:outline-none"
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
        {filtered.length > 0 ? filtered.slice(0, 10).map((item, idx) => (
          <div key={idx} 
            onClick={() => handleRowClick(item)}
            className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-surface-lowest/70 border border-transparent hover:border-glass-border transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                item.type === 'income' || item.type === 'portfolio' ? 'bg-success/10 text-success' :
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
                  {item.category && <span className="mr-1">{item.category} <span className="opacity-50">•</span></span>} {new Date(item.date || item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <div className="flex flex-col items-end">
                <p className={`text-sm font-bold tracking-tight ${item.type === 'income' || item.type === 'portfolio' ? 'text-success' : 'text-error'}`}>
                  {item.type === 'income' || item.type === 'portfolio' ? '+' : '-'}{currencySymbol} {item.amount?.toLocaleString()}
                </p>
                {item.source && <p className="text-[9px] uppercase tracking-wider font-semibold text-on-surface-variant mt-0.5">{item.source}</p>}
              </div>
              <ArrowUpRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-40 transition-all" />
            </div>
          </div>
        )) : (
          <div className="text-center py-6 opacity-60 bg-surface-lowest/30 rounded-xl border border-glass-border border-dashed">
            <Activity size={20} className="mx-auto mb-2 text-on-surface-variant opacity-50" />
            <p className="text-sm font-medium mb-1">No Activity Logs</p>
          </div>
        )}
      </div>
      
      {filtered.length > 6 && (
        <div className="text-center pt-2">
          <Link to="/transactions" className="btn btn-ghost text-xs font-medium px-6 py-2 text-primary hover:bg-primary/10">View All Transactions</Link>
        </div>
      )}
    </section>
  );
};

export default DashboardActivities;
