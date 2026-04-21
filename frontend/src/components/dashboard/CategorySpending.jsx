import React from 'react';

const CategorySpending = ({ expenses, currencySymbol }) => {
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const totalAllocated = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
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
  );
};

export default CategorySpending;
