import React from 'react';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIAdviceCard = ({ stats, currencySymbol }) => {
  const totalIncome = stats.totalIncome || 0;
  const totalExpense = stats.totalExpense || 0;
  const totalTaxPaid = stats.totalTaxPaid || 0;
  const aggregateExpense = totalExpense + totalTaxPaid;
  const savingsRate = totalIncome > 0 ? (((totalIncome - aggregateExpense) / totalIncome) * 100).toFixed(1) : 0;

  return (
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
  );
};

export default AIAdviceCard;
