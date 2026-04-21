import React from 'react';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardGoals = ({ goals, currencySymbol }) => {
  return (
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
  );
};

export default DashboardGoals;
