import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, X } from 'lucide-react';

const TransactionFilters = ({ 
  activeTab, setActiveTab, 
  searchQuery, setSearchQuery, 
  dateFrom, setDateFrom, 
  dateTo, setDateTo, 
  counts, resetFilters, hasFilters, setCurrentPage 
}) => {
  const tabs = ['All', 'Income', 'Expense', 'Tax', 'Investment'];

  return (
    <div className="w-full lg:w-56 xl:w-60 shrink-0 space-y-4 lg:sticky lg:top-6">
      {/* Search */}
      <div className="stat-card !p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-3 flex items-center gap-2">
          <Search size={11} /> Search
        </p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" />
          <input type="text" placeholder="Title, category…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-surface-lowest border border-glass-border rounded-xl pl-8 pr-3 py-2 text-[12px] text-on-surface focus:outline-none focus:border-primary/40 transition-colors" />
        </div>
      </div>

      {/* Type Filter tabs */}
      <div className="stat-card !p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-3 flex items-center gap-2">
          <Filter size={11} /> Type
        </p>
        <div className="space-y-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold transition-all z-10 ${activeTab === tab
                ? 'text-primary'
                : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}>
              {activeTab === tab && (
                <motion.div
                  layoutId="transactions-type-filter"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
              <span className={`relative z-10 text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTab === tab ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant opacity-70'}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="stat-card !p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-3 flex items-center gap-2">
          <Calendar size={11} /> Date Range
        </p>
        <div className="space-y-2">
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant opacity-50 mb-1 block">From</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-full bg-surface-lowest border border-glass-border rounded-xl px-3 py-2 text-[11px] text-on-surface focus:outline-none" />
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant opacity-50 mb-1 block">To</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="w-full bg-surface-lowest border border-glass-border rounded-xl px-3 py-2 text-[11px] text-on-surface focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      {hasFilters && (
        <button onClick={resetFilters}
          className="w-full text-[11px] font-bold uppercase tracking-wider text-error hover:underline flex items-center justify-center gap-1.5 py-2 opacity-70 hover:opacity-100 transition-all">
          <X size={12} /> Reset Filters
        </button>
      )}
    </div>
  );
};

export default TransactionFilters;
