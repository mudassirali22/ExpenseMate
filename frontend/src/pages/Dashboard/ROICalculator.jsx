import React, { useState, useMemo } from 'react';
import { Percent, TrendingUp, Calculator as CalcIcon, Wallet, ArrowDownCircle, ArrowUpCircle, ShieldAlert, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useAuth } from '../../context/AuthContext';

const ROICalculator = () => {
  const { currencySymbol } = useAuth();
  // Basic & Advanced Inputs
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [expectedReturn, setExpectedReturn] = useState(8); 
  const [years, setYears] = useState(10);
  
  const [inflation, setInflation] = useState(3.5);
  const [capitalGainsTax, setCapitalGainsTax] = useState(15);

  // Compute Compound Interest + Macro Economics
  const { chartData, finalValue, totalContributed, grossInterest, totalTaxes, inflationLost, netTakeHome, realPurchasingPower } = useMemo(() => {
    const data = [];
    let principal = Number(initialInvestment) || 0;
    let totalC = Number(initialInvestment) || 0;
    const r = (Number(expectedReturn) || 0) / 100 / 12; 
    const infRate = (Number(inflation) || 0) / 100;
    const taxRate = (Number(capitalGainsTax) || 0) / 100;
    const mCont = Number(monthlyContribution) || 0;
    const yrs = Number(years) || 0;

    data.push({
      name: 'Yr 0',
      contributions: totalC,
      nominalValue: principal,
      realValue: principal
    });

    for (let i = 1; i <= Math.max(1, yrs); i++) {
      for (let m = 1; m <= 12; m++) {
         if (r !== 0) principal = principal * (1 + r) + mCont;
         else principal += mCont;
         totalC += mCont;
      }
      
      const realVal = principal / Math.pow(1 + infRate, i); 
      
      data.push({
        name: `Yr ${i}`,
        contributions: Math.round(totalC),
        nominalValue: Math.round(principal),
        realValue: Math.round(realVal)
      });
    }

    const last = data[data.length - 1];
    const finalNominal = last.nominalValue;
    const finalReal = last.realValue;
    const grossInt = Math.max(0, finalNominal - last.contributions);
    const taxesOwed = Math.round(grossInt * taxRate);
    const netGains = grossInt - taxesOwed;
    
    return {
      chartData: data,
      finalValue: finalNominal,
      totalContributed: last.contributions,
      grossInterest: grossInt,
      totalTaxes: taxesOwed,
      netTakeHome: last.contributions + netGains,
      realPurchasingPower: finalReal,
      inflationLost: Math.round(finalNominal - finalReal)
    };
  }, [initialInvestment, monthlyContribution, expectedReturn, years, inflation, capitalGainsTax]);

  return (
    <div className="page-container animate-fade-in-up pb-20">
      {/* Header (Matches Home.jsx exactly) */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Percent size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Intelligence Suite</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">ROI Metrics</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Forecast your wealth trajectory utilizing dynamic compound modeling.</p>
        </div>
      </div>

      {/* Top Level Stat Cards (Exact match to Home.jsx structure) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Projected Value (Spans 2 cols like Total Balance) */}
        <div className="md:col-span-2 stat-card bg-surface-container/10 border-primary/20 relative overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-colors !p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-8 -mt-8" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="stat-label">Projected Net Value</p>
              <div className="flex items-end gap-3 mt-0.5">
                <h3 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">{currencySymbol} {netTakeHome.toLocaleString()}</h3>
                <div className="flex items-center font-bold text-[10px] px-2 py-1 rounded-md mb-1 text-primary bg-primary/10">
                  <TrendingUp size={12} className="mr-1" />
                  Yield Model
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-glass-border/50">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider opacity-70">Gross Interest</span>
                <span className="text-xs font-semibold text-success">+ {currencySymbol} {grossInterest.toLocaleString()}</span>
              </div>
              <div className="w-px h-5 bg-glass-border" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider opacity-70">Tax Liability</span>
                <span className="text-xs font-semibold text-error">- {currencySymbol} {totalTaxes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Capital (Like Total Income) */}
        <div className="stat-card flex flex-col justify-center hover:border-success/30 transition-colors !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="stat-label mb-0">Total Seed Capital</p>
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success"><Wallet size={16} /></div>
          </div>
          <h4 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">{currencySymbol} {totalContributed.toLocaleString()}</h4>
          <div className="flex items-center gap-1.5 mt-2 text-success">
            <TrendingUp size={12} />
            <span className="text-[11px] font-medium">Contributed Principal</span>
          </div>
        </div>

        {/* Economic Drain (Like Total Expenses) */}
        <div className="stat-card flex flex-col justify-center hover:border-error/30 transition-colors !p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="stat-label mb-0">Inflation Drain</p>
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error"><ArrowDownCircle size={16} /></div>
          </div>
          <h4 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">{currencySymbol} {inflationLost.toLocaleString()}</h4>
          <div className="flex items-center gap-1.5 mt-2 text-error">
            <TrendingDown size={12} />
            <span className="text-[11px] font-medium">Purchasing Power Lost</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chart Widget (lg:col-span-8) */}
        <div className="lg:col-span-8">
           <div className="stat-card flex flex-col h-full min-h-[450px]">
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="section-title text-base font-semibold mb-0 text-on-surface">Growth Overview</h3>
                   <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Over {years} Years</p>
                 </div>
                 <div className="flex gap-3 bg-surface-container/50 p-1 rounded-lg border border-glass-border">
                    <div className="px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-secondary" /> Nominal</div>
                    <div className="px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Real Value</div>
                 </div>
              </div>

              <div className="flex-1 w-full -ml-4 mt-2">
                 <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorNom" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="var(--secondary-color)" stopOpacity={0.25}/>
                         <stop offset="95%" stopColor="var(--secondary-color)" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.05}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" opacity={0.3} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 'bold' }} dy={10} minTickGap={20} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
                     <Tooltip
                       contentStyle={{ backgroundColor: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                       itemStyle={{ fontSize: '11px', fontWeight: '800', fontFamily: 'monospace' }}
                       formatter={(value, name) => [`${currencySymbol}${value.toLocaleString()}`, name === 'nominalValue' ? 'Nominal Tracker' : 'Real Adjusted']}
                       labelStyle={{ fontSize: '10px', color: 'var(--on-surface-variant)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}
                     />
                     <Area type="monotone" dataKey="nominalValue" name="nominalValue" stroke="var(--secondary-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorNom)" animationDuration={1800} />
                     <Area type="monotone" dataKey="realValue" name="realValue" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorReal)" animationDuration={1800} />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Right Sidebar Inputs (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="stat-card">
            <h3 className="section-title text-base font-semibold mb-4 text-on-surface">Base Parameters</h3>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Start Capital</label>
                <div className="relative">
                  <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} className="input-field w-full h-10 font-bold text-sm bg-surface-lowest pl-4 border-primary/20 focus:border-primary text-primary" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Monthly Input</label>
                <div className="relative">
                  <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="input-field w-full h-10 font-bold text-sm bg-surface-lowest pl-4 border-secondary/20 focus:border-secondary text-secondary" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Exp. Yield (%)</label>
                  <input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} className="input-field w-full h-10 font-bold text-sm bg-surface-lowest text-center" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Years</label>
                  <input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="input-field w-full h-10 font-bold text-sm bg-surface-lowest text-center" />
                </div>
              </div>
            </div>
          </section>

          <section className="stat-card border-error/10">
            <h3 className="section-title text-base font-semibold mb-4 text-error">Macro Tensions</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-error/80 mb-1 block">Inflation (%)</label>
                  <input type="number" value={inflation} onChange={(e) => setInflation(e.target.value)} max="20" step="0.5" className="input-field w-full h-10 font-bold text-sm text-center border-error/20 text-error focus:border-error" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-error/80 mb-1 block">Cap Tax (%)</label>
                  <input type="number" value={capitalGainsTax} onChange={(e) => setCapitalGainsTax(e.target.value)} max="50" step="1" className="input-field w-full h-10 font-bold text-sm text-center border-error/20 text-error focus:border-error" />
                </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default ROICalculator;
