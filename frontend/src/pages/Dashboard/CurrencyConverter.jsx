import React, { useState, useEffect } from 'react';
import { RefreshCcw, ArrowRightLeft, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState({});
  const [currencies, setCurrencies] = useState(["USD", "EUR", "GBP", "PKR", "INR", "AUD", "CAD", "JPY"]);

  const popularPairs = [
    { from: "USD", to: "PKR" },
    { from: "EUR", to: "PKR" },
    { from: "GBP", to: "PKR" },
    { from: "AED", to: "PKR" },
    { from: "USD", to: "EUR" },
    { from: "EUR", to: "USD" }
  ];

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await res.json();
      setRates(data.rates);
      setCurrencies(Object.keys(data.rates).sort());
      setResult(amount * data.rates[toCurrency]);
    } catch (error) {
      console.error("Exchange rate fetch failed:", error);
      toast.error("Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [fromCurrency]);

  const handleConvert = () => {
    if (rates[toCurrency]) {
      setResult(amount * rates[toCurrency]);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 w-full max-w-3xl mx-auto animate-fade-in flex flex-col gap-8">

      {/* Converter Section */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <RefreshCcw size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Global Exchange Pro</h3>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Real-time Market Data
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Capital Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full px-6 py-4 bg-slate-50 rounded-3xl border-2 border-slate-100 outline-none focus:border-emerald-500 focus:bg-white transition-all text-3xl font-black text-slate-800"
            />
            <div className="absolute right-8 top-13 text-slate-300 font-bold text-lg">{fromCurrency}</div>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Base</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-5 bg-slate-50 text-slate-700 rounded-2xl font-black text-lg outline-none border-2 border-slate-100 cursor-pointer hover:border-emerald-300 transition-colors text-center"
              >
                {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>

            <button
              onClick={swapCurrencies}
              className="mt-6 p-5 bg-white border-2 border-slate-200 rounded-full hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-xl shadow-slate-100 text-slate-400 hover:text-emerald-600 active:scale-95"
            >
              <ArrowRightLeft size={24} />
            </button>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Target</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-5 bg-emerald-50 text-emerald-800 rounded-2xl font-black text-lg outline-none border-2 border-emerald-100 cursor-pointer hover:border-emerald-300 transition-colors text-center"
              >
                {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white rounded-4xl font-black text-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-4 active:scale-95 shadow-2xl shadow-slate-200"
          >
            {loading ? <Loader2 size={28} className="animate-spin" /> : "Initiate Conversion"}
          </button>

          {result && !loading && (
            <div className="p-10 bg-linear-to-br from-emerald-50 to-teal-50 rounded-[2.5rem] border-2 border-emerald-100 text-center animate-fade-in-up shadow-inner">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">{amount} {fromCurrency} equals</p>
              <h4 className="text-5xl font-black text-slate-900 tracking-tighter">
                {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-emerald-600">{toCurrency}</span>
              </h4>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
                <RefreshCcw size={12} className="opacity-50" />
                <span>Market rate updated live</span>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Trending Section - Integrated */}
        <div className="flex flex-col gap-6">
        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex-1">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" /> Market Trends
          </h4>
          <div className="space-y-3">
            {popularPairs.map((pair, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white hover:bg-emerald-50 rounded-[1.25rem] transition-all border border-slate-200 hover:border-emerald-200 group cursor-pointer shadow-sm active:scale-95"
                onClick={() => { setFromCurrency(pair.from); setToCurrency(pair.to); }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-700">{pair.from}</span>
                  <ArrowRightLeft size={12} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-sm font-black text-slate-700">{pair.to}</span>
                </div>
                <div className="text-xs font-black text-emerald-600">
                  {rates[pair.to] ? (rates[pair.to] / rates[pair.from]).toFixed(2) : "..."}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-4xl p-6 text-white text-center shadow-lg shadow-indigo-100">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Exchange Advice</p>
          <p className="text-xs font-bold leading-relaxed">Exchange rates are volatile. Consider setting a target alert!</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
