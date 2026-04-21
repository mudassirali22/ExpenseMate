import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ShoppingCart } from 'lucide-react';
import StatCard from '../common/StatCard';

const DashboardStats = ({ stats, currencySymbol }) => {
  const totalBalance = stats.totalBalance || 0;
  const totalIncome = stats.totalIncome || 0;
  const totalExpense = stats.totalExpense || 0;
  const totalTaxPaid = stats.totalTaxPaid || 0;
  const aggregateExpense = totalExpense + totalTaxPaid;
  const savingsRate = totalIncome > 0 ? (((totalIncome - aggregateExpense) / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Balance Card */}
      <StatCard
        className="md:col-span-2 bg-surface-container/10 border-primary/20 hover:border-primary/40"
        label="Total Balance"
        value={`${currencySymbol} ${totalBalance.toLocaleString()}`}
        trend={`${Math.abs(savingsRate)}% Saved`}
        trendIcon={Number(savingsRate) >= 0 ? TrendingUp : TrendingDown}
        trendColorClass={Number(savingsRate) >= 0 ? 'text-success bg-success/10' : 'text-error bg-error/10'}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-8 -mt-8" />
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-glass-border/50 relative z-10">
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
      </StatCard>

      {/* Income Card */}
      <StatCard
        className="hover:border-success/30"
        label="Total Income"
        value={`${currencySymbol} ${totalIncome.toLocaleString()}`}
        icon={Wallet}
        trend="Total Income"
        trendIcon={TrendingUp}
        trendColorClass="text-success"
      />

      {/* Expense Card */}
      <StatCard
        className="hover:border-error/30"
        label="Total Expenses"
        value={`${currencySymbol} ${totalExpense.toLocaleString()}`}
        icon={ShoppingCart}
        trend={totalIncome > 0 ? `${((aggregateExpense / totalIncome) * 100).toFixed(0)}% Budget Used` : 'Budget Limit'}
        trendIcon={TrendingDown}
        trendColorClass="text-error"
      />
    </div>
  );
};

export default DashboardStats;
