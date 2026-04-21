import React, { useState } from 'react';
import { Calculator as CalculatorIcon } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState([
    { exp: '1,200 / 4', res: '300.00' },
    { exp: '45.50 * 3', res: '136.50' }
  ]);
  const [resetDisplay, setResetDisplay] = useState(false);

  const calculate = (expr) => {
    try {
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100');
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      return Number.isInteger(result) ? result.toString() : result.toFixed(2);
    } catch {
      return 'Error';
    }
  };

  const handleClick = (val) => {
    if (val === 'AC') {
      setDisplay('0');
      setExpression('');
    } else if (val === '=') {
      const fullExp = expression + display;
      const result = calculate(fullExp);
      if (result !== 'Error' && fullExp.trim() !== display.trim()) {
         setHistory([{ exp: fullExp, res: result }, ...history].slice(0, 5));
      }
      setDisplay(result);
      setExpression('');
      setResetDisplay(true);
    } else if (['+', '-', '×', '÷', '%'].includes(val)) {
      setExpression(display + ' ' + val + ' ');
      setResetDisplay(true);
    } else if (val === '+/-') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
    } else {
      if (resetDisplay) {
        setDisplay(val);
        setResetDisplay(false);
      } else {
        setDisplay(display === '0' ? val : display + val);
      }
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <section className="col-span-1 xl:col-span-5 stat-card flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary/10 rounded-xl border border-secondary/20 flex items-center justify-center text-secondary">
          <CalculatorIcon size={20} />
        </div>
        <div>
           <h4 className="text-sm font-black text-on-surface uppercase tracking-tighter">Strategic <span className="text-primary italic">Calculator</span></h4>
           <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Real-time Accounting</p>
        </div>
      </div>
      
      {/* Calculator Screen */}
      <div className="bg-surface-container p-5 rounded-2xl flex flex-col items-end gap-1 shadow-inner border border-glass-border">
        <span className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest min-h-[16px] truncate max-w-full opacity-40 italic">{expression || '\u00A0'}</span>
        <div className="text-3xl font-black font-mono tracking-tighter text-on-surface overflow-hidden truncate max-w-full">
           {display !== 'Error' && !isNaN(display) && display !== '' ? Number(display).toLocaleString(undefined, { maximumFractionDigits: 6 }) : display}
        </div>
      </div>
      
      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Row 1 */}
        <button onClick={() => handleClick('AC')} className="aspect-square bg-surface-lowest rounded-xl font-black text-error hover:bg-error/10 transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-glass-border shadow-sm">AC</button>
        <button onClick={() => handleClick('+/-')} className="aspect-square bg-surface-lowest rounded-xl font-black text-primary hover:bg-primary/10 transition-all active:scale-95 text-xs border border-glass-border shadow-sm">+/-</button>
        <button onClick={() => handleClick('%')} className="aspect-square bg-surface-lowest rounded-xl font-black text-primary hover:bg-primary/10 transition-all active:scale-95 text-xs border border-glass-border shadow-sm">%</button>
        <button onClick={() => handleClick('÷')} className="aspect-square bg-primary/10 rounded-xl font-black text-primary hover:bg-primary/20 transition-all active:scale-95 text-lg border border-primary/20 shadow-sm transition-colors">÷</button>
        
        {/* Row 2 */}
        <button onClick={() => handleClick('7')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">7</button>
        <button onClick={() => handleClick('8')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">8</button>
        <button onClick={() => handleClick('9')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">9</button>
        <button onClick={() => handleClick('×')} className="aspect-square bg-primary/10 rounded-xl font-black text-primary hover:bg-primary/20 transition-all active:scale-95 text-lg border border-primary/20 shadow-sm transition-colors">×</button>
        
        {/* Row 3 */}
        <button onClick={() => handleClick('4')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">4</button>
        <button onClick={() => handleClick('5')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">5</button>
        <button onClick={() => handleClick('6')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">6</button>
        <button onClick={() => handleClick('-')} className="aspect-square bg-primary/10 rounded-xl font-black text-primary hover:bg-primary/20 transition-all active:scale-95 text-lg border border-primary/20 shadow-sm transition-colors">-</button>
        
        {/* Row 4 */}
        <button onClick={() => handleClick('1')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">1</button>
        <button onClick={() => handleClick('2')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">2</button>
        <button onClick={() => handleClick('3')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">3</button>
        <button onClick={() => handleClick('+')} className="aspect-square bg-primary/10 rounded-xl font-black text-primary hover:bg-primary/20 transition-all active:scale-95 text-lg border border-primary/20 shadow-sm transition-colors">+</button>
        
        {/* Row 5 */}
        <button onClick={() => handleClick('0')} className="col-span-2 aspect-[2.1/1] bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 text-left pl-7 border border-glass-border shadow-sm">0</button>
        <button onClick={() => handleClick('.')} className="aspect-square bg-surface-lowest rounded-xl font-bold text-on-surface hover:bg-surface-container transition-all active:scale-95 border border-glass-border shadow-sm">.</button>
        <button onClick={() => handleClick('=')} className="aspect-square bg-primary rounded-xl font-black text-on-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-xl">=</button>
      </div>
      
      <div className="mt-2 bg-surface-container/30 p-5 rounded-2xl border border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">History Log</h5>
          <button onClick={clearHistory} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline transition-all">Clear all</button>
        </div>
        <ul className="space-y-2 max-h-32 overflow-y-auto no-scrollbar mask-fade-y">
          {history.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-lowest border border-glass-border group hover:bg-surface-container transition-colors shadow-sm">
              <span className="text-[10px] font-mono text-on-surface-variant font-bold opacity-60">{item.exp}</span>
              <span className="text-xs font-black text-on-surface tracking-tight">{item.res}</span>
            </li>
          ))}
          {history.length === 0 && (
            <li className="text-center py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-30 italic">No entries detected</li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default Calculator;
