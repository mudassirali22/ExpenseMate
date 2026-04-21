import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftRight, Search, Activity, Info, TrendingUp,
  Globe, Globe2, ChevronDown, Monitor, Zap, ShieldCheck
} from 'lucide-react';

const CurrencyConverter = () => {
  const { currencySymbol } = useAuth();
  const [amount, setAmount] = useState('');
  const [fromCode, setFromCode] = useState('USD');
  const [toCode, setToCode] = useState('PKR');

  const [rates, setRates] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFromDrop, setShowFromDrop] = useState(false);
  const [showToDrop, setShowToDrop] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [period, setPeriod] = useState('1W');

  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        setRates(data.rates);
        setCurrencies(Object.keys(data.rates).sort());
      } catch (err) {
        toast.error("Using static fallback rates due to API block.");
        const fallback = { USD: 1, EUR: 0.92, GBP: 0.79, PKR: 278.5, INR: 83.2, CAD: 1.36, AUD: 1.52, JPY: 151.2, AED: 3.67, CHF: 0.90 };
        setRates(fallback);
        setCurrencies(Object.keys(fallback).sort());
      } finally {
        setLoading(false);
      }
    };
    fetchRates();

    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) setShowFromDrop(false);
      if (toRef.current && !toRef.current.contains(event.target)) setShowToDrop(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFlagUrl = (code) => {
    const mapping = {
      'EUR': 'eu', 'USD': 'us', 'GBP': 'gb', 'JPY': 'jp', 'CNY': 'cn',
      'PKR': 'pk', 'INR': 'in', 'CAD': 'ca', 'AUD': 'au', 'CHF': 'ch',
      'SGD': 'sg', 'AED': 'ae', 'SAR': 'sa', 'HKD': 'hk', 'MYR': 'my',
      'NZD': 'nz', 'SEK': 'se', 'NOK': 'no', 'DKK': 'dk', 'TRY': 'tr',
      'BRL': 'br', 'ZAR': 'za', 'RUB': 'ru', 'KRW': 'kr', 'MXN': 'mx',
      'QAR': 'qa', 'KWD': 'kw', 'BHD': 'bh', 'OMR': 'om', 'JOD': 'jo'
    };
    if (code === 'BTC') return 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
    if (code === 'ETH') return 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
    const countryCode = mapping[code] || code.substring(0, 2).toLowerCase();
    return `https://flagcdn.com/w40/${countryCode}.png`;
  };

  if (loading || !rates) {
    return (
      <section className="col-span-1 lg:col-span-7 stat-card flex items-center justify-center min-h-[400px] border border-glass-border">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="text-center font-bold">
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-1">Synchronizing</p>
            <p className="text-[10px] text-on-surface-variant uppercase opacity-40">Connecting to global FX nodes...</p>
          </div>
        </div>
      </section>
    );
  }

  const fromRate = rates[fromCode] || 1;
  const toRate = rates[toCode] || 1;
  const convertedAmount = amount ? ((parseFloat(amount) / fromRate) * toRate).toFixed(2) : '0.00';
  const exchangeRate = (toRate / fromRate).toFixed(4);

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const generatePath = () => {
    let seed = fromCode.charCodeAt(0) + toCode.charCodeAt(0) + (period === '1D' ? 1 : period === '1W' ? 2 : period === '1M' ? 3 : 4);
    let points = [];
    let y = 50;
    let random = () => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i <= 100; i++) {
      let x = (i / 100) * 400;
      y += (random() - 0.5) * 12;
      if (y > 85) y = 85;
      if (y < 15) y = 15;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const filteredFrom = currencies.filter(c => c.toLowerCase().includes(searchFrom.toLowerCase()));
  const filteredTo = currencies.filter(c => c.toLowerCase().includes(searchTo.toLowerCase()));

  return (
    <section className="col-span-1 lg:col-span-7 stat-card !p-5 overflow-hidden border border-primary/20 shadow-2xl flex flex-col min-h-[400px] hover:border-primary/40 transition-colors">

      {/* Dynamic Header Overlay */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Globe size={18} />
          </div>
          <div>
            <p className="stat-label mb-0">Currency Converter</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-lg border border-success/20">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Live Sync</span>
        </div>
      </div>

      <div className="space-y-6 flex-1">

        <div className="grid grid-cols-1 gap-6 relative">

          {/* FROM CARD */}
          <div className="space-y-3 relative" ref={fromRef}>
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 flex items-center gap-2">
                <ChevronDown size={10} className="text-primary" /> Source Asset
              </label>
              <span className="text-[9px] font-bold text-on-surface-variant opacity-40">AVAILABLE TO TRADE</span>
            </div>

            <div className="group relative">
              <div className="relative bg-surface-lowest p-5 rounded-2xl border border-glass-border shadow-inner flex items-center justify-between hover:border-primary/30 transition-all duration-300">
                <div
                  className="flex items-center gap-4 cursor-pointer hover:bg-surface-high p-2 -ml-2 rounded-xl transition-all"
                  onClick={() => { setShowFromDrop(!showFromDrop); setSearchFrom(''); }}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-glass-border shadow-sm bg-surface-high flex items-center justify-center p-1.5">
                    <img
                      alt={fromCode}
                      className="w-full h-full object-contain"
                      src={getFlagUrl(fromCode)}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <Globe size={18} className="text-on-surface-variant hidden" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl text-on-surface tracking-tighter leading-none">{fromCode}</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-30 mt-0.5">Asset</span>
                  </div>
                  <ChevronDown size={12} className={`text-on-surface-variant transition-transform duration-300 ${showFromDrop ? 'rotate-180' : ''}`} />
                </div>

                <input
                  className="bg-transparent border-none p-0 text-right font-mono text-3xl w-full max-w-[150px] focus:ring-0 text-on-surface outline-none font-black placeholder:text-on-surface-variant/20 pr-2"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {showFromDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-24 left-0 w-full bg-surface-lowest border border-glass-border rounded-[2rem] shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-glass-border flex items-center gap-3 bg-surface-container/30">
                      <Search size={14} className="text-on-surface-variant" />
                      <input type="text" autoFocus value={searchFrom} onChange={e => setSearchFrom(e.target.value)} placeholder="SEARCH GLOBAL CODES..." className="w-full bg-transparent text-xs font-black text-on-surface outline-none placeholder:text-on-surface-variant/30 uppercase tracking-widest" />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-2 gap-1 custom-scrollbar">
                      {filteredFrom.map(c => (
                        <div key={c} onClick={() => { setFromCode(c); setShowFromDrop(false); }} className="flex items-center gap-3 p-3 hover:bg-primary/10 rounded-2xl cursor-pointer transition-all group">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-glass-border shadow-sm bg-surface-lowest flex items-center justify-center p-1">
                            <img
                              src={getFlagUrl(c)}
                              alt={c}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                            />
                            <Globe size={14} className="text-on-surface-variant hidden" />
                          </div>
                          <span className="text-xs font-black text-on-surface uppercase tracking-tight">{c}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SWAP TRIGGER */}
          <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-[40]">
            <motion.button
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={handleSwap}
              className="w-12 h-12 bg-primary text-on-primary rounded-full shadow-xl shadow-primary/30 border-[4px] border-surface-color flex items-center justify-center group"
            >
              <ArrowLeftRight size={20} className="group-hover:opacity-80" />
            </motion.button>
          </div>

          {/* TO CARD */}
          <div className="space-y-3 relative pt-2" ref={toRef}>
            <div className="group relative">
              <div className="relative bg-surface-lowest p-5 rounded-2xl border border-glass-border shadow-inner flex items-center justify-between hover:border-secondary/30 transition-all duration-300">
                <div
                  className="flex items-center gap-4 cursor-pointer hover:bg-surface-high p-2 -ml-2 rounded-xl transition-all"
                  onClick={() => { setShowToDrop(!showToDrop); setSearchTo(''); }}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-glass-border shadow-sm bg-surface-high flex items-center justify-center p-1.5">
                    <img
                      alt={toCode}
                      className="w-full h-full object-contain"
                      src={getFlagUrl(toCode)}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <Globe size={18} className="text-on-surface-variant hidden" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl text-on-surface tracking-tighter leading-none">{toCode}</span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-30 mt-0.5">Target</span>
                  </div>
                  <ChevronDown size={12} className={`text-on-surface-variant transition-transform duration-300 ${showToDrop ? 'rotate-180' : ''}`} />
                </div>

                <div className="text-right flex flex-col items-end pr-2">
                  <span className="font-mono text-3xl text-primary font-black tracking-tighter">{convertedAmount}</span>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase opacity-30">Calculated</span>
                </div>
              </div>

              <AnimatePresence>
                {showToDrop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-24 left-0 w-full bg-surface-lowest border border-glass-border rounded-[2rem] shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-glass-border flex items-center gap-3 bg-surface-container/30">
                      <Search size={14} className="text-on-surface-variant" />
                      <input type="text" autoFocus value={searchTo} onChange={e => setSearchTo(e.target.value)} placeholder="SEARCH TARGET CODES..." className="w-full bg-transparent text-xs font-black text-on-surface outline-none placeholder:text-on-surface-variant/30 uppercase tracking-widest" />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-2 gap-1 custom-scrollbar">
                      {filteredTo.map(c => (
                        <div key={c} onClick={() => { setToCode(c); setShowToDrop(false); }} className="flex items-center gap-3 p-3 hover:bg-secondary/10 rounded-2xl cursor-pointer transition-all group">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-glass-border shadow-sm bg-surface-lowest flex items-center justify-center p-1">
                            <img
                              src={getFlagUrl(c)}
                              alt={c}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                            />
                            <Globe size={14} className="text-on-surface-variant hidden" />
                          </div>
                          <span className="text-xs font-black text-on-surface uppercase tracking-tight">{c}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Intelligence Layer / Graph */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-glass-border/30 pb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-40">Exchange Ticker</span>
              <div className="text-sm font-black text-on-surface flex items-center gap-2">
                1 {fromCode} = <span className="text-primary text-base">{exchangeRate}</span> {toCode}
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-success text-[10px] bg-success/10 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <TrendingUp size={10} /> +0.02%
                </motion.span>
              </div>
            </div>
            <div className="flex bg-surface-container p-1 rounded-xl border border-glass-border">
              {['1D', '1W', '1M', '1Y'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest ${period === p ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-high'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full bg-surface-lowest/50 rounded-[1.5rem] relative overflow-hidden border border-glass-border">
            <div className="absolute inset-0 px-4 py-8">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                <defs>
                  <linearGradient id="curve-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  d={generatePath()}
                  fill="none"
                  stroke="var(--primary-color)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path d={`${generatePath()} L 400 100 L 0 100 Z`} fill="url(#curve-grad)" className="opacity-30" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrencyConverter;
