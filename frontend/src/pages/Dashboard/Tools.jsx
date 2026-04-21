import Calculator from './Calculator';
import CurrencyConverter from './CurrencyConverter';
import { Wrench, Percent, Wallet, Receipt, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Tools = () => {
  return (
    <div className="page-container animate-fade-in-up pb-20">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Helpful Tools</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Financial Tools</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Simple tools to help you manage your money.</p>
        </div>
      </div>

      {/* Top Level Summary Cards (Matches Dashboard Aesthetic) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Tax Monitor', sub: 'Track your taxes', icon: Percent, color: 'secondary', path: '/tax-monitor' },
          { title: 'Investment Portfolio', sub: 'Manage your investments', icon: Wallet, color: 'tertiary', path: '/portfolio' },
          { title: 'ROI Forecaster', sub: 'Calculate your savings', icon: Receipt, color: 'primary', path: '/roi-calculator' }
        ].map((tool, idx) => (
          <Link to={tool.path} key={idx} className="stat-card block relative group cursor-pointer transition-all hover:border-primary/30 md:active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-${tool.color}/10 flex items-center justify-center text-${tool.color} group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                  <tool.icon size={22} />
                </div>
                <div>
                  <h5 className="font-bold text-on-surface tracking-tight text-sm mb-0.5">{tool.title}</h5>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">{tool.sub}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
          </Link>
        ))}
      </section>

      {/* Main Widgets (Calculator & Currency) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <CurrencyConverter />
        <Calculator />
      </div>
    </div>
  );
};

export default Tools;
