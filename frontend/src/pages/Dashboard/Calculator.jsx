import React, { useState } from 'react';
import { Delete, X, History } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState([]);
  const [shouldReset, setShouldReset] = useState(false);

  const handleNumber = (num) => {
    if (shouldReset || display === "0" || display === "Error") {
      setDisplay(num);
      setShouldReset(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
    setShouldReset(false);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      const result = new Function(`return ${fullEquation}`)();
      const formattedResult = Number.isFinite(result) ? String(parseFloat(result.toFixed(8))) : "Error";
      
      if (formattedResult !== "Error") {
        setHistory([{ eq: fullEquation, res: formattedResult }, ...history].slice(0, 5));
      }
      
      setDisplay(formattedResult);
      setEquation("");
      setShouldReset(true);
    } catch {
      setDisplay("Error");
      setShouldReset(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
    setShouldReset(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 w-full max-w-3xl mx-auto animate-fade-in flex flex-col gap-8 transition-all">
      
      {/* Main Calc Area */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                 <CalculatorIcon size={16} />
              </div>
              Pro Calculator
           </h3>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Standard Mode
           </div>
        </div>

        <div className="relative">
          <div className="text-right px-6 py-8 bg-slate-900 rounded-[2rem] border-4 border-slate-800 shadow-2xl flex flex-col justify-end min-h-[140px]">
            <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest min-h-[1.5rem] opacity-60 mb-1">
              {equation}
            </div>
            <div className="text-5xl font-black text-white truncate tracking-tighter">
              {display}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <CalcButton label="C" onClick={clear} variant="danger" />
          <CalcButton label="DEL" onClick={backspace} variant="secondary" />
          <CalcButton label="%" onClick={() => handleOperator("/ 100")} variant="operator" />
          <CalcButton label="÷" onClick={() => handleOperator("/")} variant="operator" />

          <CalcButton label="7" onClick={() => handleNumber("7")} />
          <CalcButton label="8" onClick={() => handleNumber("8")} />
          <CalcButton label="9" onClick={() => handleNumber("9")} />
          <CalcButton label="×" onClick={() => handleOperator("*")} variant="operator" />

          <CalcButton label="4" onClick={() => handleNumber("4")} />
          <CalcButton label="5" onClick={() => handleNumber("5")} />
          <CalcButton label="6" onClick={() => handleNumber("6")} />
          <CalcButton label="-" onClick={() => handleOperator("-")} variant="operator" />

          <CalcButton label="1" onClick={() => handleNumber("1")} />
          <CalcButton label="2" onClick={() => handleNumber("2")} />
          <CalcButton label="3" onClick={() => handleNumber("3")} />
          <CalcButton label="+" onClick={() => handleOperator("+")} variant="operator" />

          <CalcButton label="0" onClick={() => handleNumber("0")} colSpan={1} />
          <CalcButton label="." onClick={() => handleNumber(".")} />
          <CalcButton label="=" onClick={calculate} variant="primary" colSpan={2} />
        </div>
      </div>

      {/* History Area - Compact */}
      <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
         <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
            <History size={12} /> Recent History
         </h4>
         <div className="space-y-6 flex-1">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                 <History size={32} className="mb-4" />
                 <p className="text-xs font-bold uppercase tracking-widest">No history</p>
              </div>
            ) : (
              history.map((h, i) => (
                <div key={i} className="animate-fade-in group cursor-pointer" onClick={() => { setDisplay(h.res); setEquation(""); }}>
                   <p className="text-[10px] text-slate-400 font-bold mb-1 group-hover:text-indigo-500 transition-colors">{h.eq} =</p>
                   <p className="text-xl font-black text-slate-700">{h.res}</p>
                </div>
              ))
            )}
         </div>
         <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
               Click any entry to restore result to display.
            </p>
         </div>
      </div>
    </div>
  );
};

const CalculatorIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" />
  </svg>
);

const CalcButton = ({ label, onClick, variant = "default", colSpan = 1, rowSpan = 1 }) => {
  const baseStyles = "h-16 rounded-[1.25rem] font-black transition-all active:scale-95 flex items-center justify-center text-xl shadow-sm border-2";
  const variants = {
    default: "bg-white text-slate-600 hover:bg-slate-50 border-slate-100 hover:border-slate-200",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 border-indigo-500",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200",
    operator: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]}`}
      style={{ 
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        height: rowSpan > 1 ? 'auto' : '4rem'
      }}
    >
      {label}
    </button>
  );
};

export default Calculator;
