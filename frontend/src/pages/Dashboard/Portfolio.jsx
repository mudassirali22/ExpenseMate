import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Plus, Trash2, ArrowUpRight, ArrowDownRight, Briefcase,
  Shield, PieChart as PieIcon, Activity, Globe, Zap, DollarSign,
  Edit2, AlertCircle, Clock, Wallet, BarChart3, Info,
  ArrowDown
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

const ASSET_TYPES = [
  { id: 'Stock', label: 'Liquid Equity (Stock)', icon: <Zap size={16} />, desc: 'High-yield listed company shares' },
  { id: 'Crypto', label: 'Digital Assets (Crypto)', icon: <Activity size={16} />, desc: 'Blockchain tokens and decentralized assets' },
  { id: 'ETFs', label: 'Managed Funds (ETFs)', icon: <Briefcase size={16} />, desc: 'Exchange traded baskets of securities' },
  { id: 'RealEstate', label: 'Fixed Assets (Real Estate)', icon: <Globe size={16} />, desc: 'Physical property and land investments' },
  { id: 'Cash', label: 'Fiat / Cash Reserves', icon: <DollarSign size={16} />, desc: 'Stable currency and liquidity buffers' },
  { id: 'Other', label: 'Custom Portfolios', icon: <PieIcon size={16} />, desc: 'Derivatives, private equity, etc.' },
];

const ASSET_ICONS = {
  Stock: <Zap size={20} />,
  Crypto: <Activity size={20} />,
  ETFs: <Briefcase size={20} />,
  RealEstate: <Globe size={20} />,
  Cash: <DollarSign size={20} />,
  Other: <PieIcon size={20} />,
};

const Portfolio = () => {
  const { API, currencySymbol } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);

  const [formData, setFormData] = useState({
    assetName: '',
    ticker: '',
    assetType: 'Stock',
    platform: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
    notes: ''
  });

  const fetchAssets = async () => {
    try {
      const res = await fetch(`${API}/api/v1/portfolio/get`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAssets(data.data);
    } catch (err) {
      toast.error("Failed to sync investment records");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAssets(); }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      assetName: formData.assetName || formData.ticker,
      ticker: formData.ticker,
      assetType: formData.assetType,
      platform: formData.platform,
      amount: Number(formData.quantity),
      buyPrice: Number(formData.buyPrice),
      currentValue: Number(formData.currentPrice || formData.buyPrice) * Number(formData.quantity),
      notes: formData.notes
    };

    try {
      const url = isEditMode ? `${API}/api/v1/portfolio/update/${currentAsset._id}` : `${API}/api/v1/portfolio/add`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEditMode ? "Investment updated!" : "Investment added!");
        closeModal();
        fetchAssets();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch (err) {
      toast.error("System connection error");
    }
  };

  const handleEdit = (asset) => {
    setCurrentAsset(asset);
    setIsEditMode(true);
    setFormData({
      assetName: asset.assetName,
      ticker: asset.ticker || '',
      assetType: asset.assetType,
      platform: asset.platform || '',
      quantity: asset.amount,
      buyPrice: asset.buyPrice,
      currentPrice: (asset.currentValue / asset.amount).toFixed(2),
      notes: asset.notes || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (asset) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-error" />
          <span className="text-xs font-bold font-sans text-on-surface">Confirm Asset Liquidation</span>
        </div>
        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
          Remove <span className="text-error font-bold">{asset.assetName}</span>? This will permanently erase the record from your investment portfolio.
        </p>
        <div className="flex justify-end gap-2 mt-1" onPointerDownCapture={(e) => e.stopPropagation()}>
          <button onClick={() => toast.dismiss(t.id)} className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await fetch(`${API}/api/v1/portfolio/delete/${asset._id}`, {
                  method: 'DELETE',
                  credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                  toast.success("Investment deleted");
                  fetchAssets();
                } else {
                  toast.error(data.message || "Action failed");
                }
              } catch (err) {
                toast.error("System connection error");
              }
            }}
            className="btn btn-danger !py-1.5 !px-3 !text-[10px]"
          >
            Delete Now
          </button>
        </div>
      </div>
    ), { duration: Infinity, className: '!bg-surface-container !border !border-glass-border !rounded-2xl !shadow-2xl' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentAsset(null);
    setFormData({
      assetName: '', ticker: '', assetType: 'Stock', platform: '',
      quantity: '', buyPrice: '', currentPrice: '', notes: ''
    });
    setShowTypeDropdown(false);
  };

  // Calculations
  const totalInvested = useMemo(() => assets.reduce((acc, a) => acc + (a.buyPrice * a.amount), 0), [assets]);
  const totalValue = useMemo(() => assets.reduce((acc, a) => acc + (a.currentValue || a.buyPrice * a.amount), 0), [assets]);
  const totalProfit = totalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const categorizedData = useMemo(() => {
    const data = {};
    assets.forEach(asset => {
      data[asset.assetType] = (data[asset.assetType] || 0) + (asset.currentValue || asset.buyPrice * asset.amount);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const riskScore = useMemo(() => {
    if (assets.length === 0) return 0;
    const types = new Set(assets.map(a => a.assetType)).size;
    return Math.min((types / 6) * 100, 100);
  }, [assets]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in-up pb-28">

      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Investment Portfolio</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Investments</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Track and manage all your investments in one place.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary px-6 flex-1 md:flex-none justify-center">
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="sm:col-span-2 stat-card bg-surface-container/10 border-primary/20 relative overflow-hidden flex flex-col justify-between min-h-[140px] lg:min-h-[160px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20" />
          <div className="relative z-10">
            <p className="stat-label">Total Portfolio Value</p>
            <div className="flex items-end gap-3 mt-1 flex-wrap">
              <h3 className="stat-value text-2xl sm:text-3xl lg:text-4xl">{currencySymbol} {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
              <div className={`flex items-center font-black text-[10px] px-2 py-1 rounded-md mb-2 ${totalProfit >= 0 ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
                {totalProfit >= 0 ? <ArrowUpRight size={10} className="mr-1" /> : <ArrowDownRight size={10} className="mr-1" />}
                {Math.abs(profitPercentage).toFixed(2)}%
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Total Invested</span>
                <span className="text-xs font-black text-on-surface">{currencySymbol} {totalInvested.toLocaleString()}</span>
              </div>
              <div className="w-px h-6 bg-glass-border" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Net Profit</span>
                <span className={`text-xs font-black ${totalProfit >= 0 ? 'text-success' : 'text-error'}`}>
                  {totalProfit >= 0 ? '+' : ''}{currencySymbol} {totalProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-1/2 h-24 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={[{ v: 40 }, { v: 35 }, { v: 50 }, { v: 45 }, { v: 60 }, { v: 55 }, { v: 75 }]}>
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.4} strokeWidth={3} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <p className="stat-label mb-0">Risk Level</p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Shield size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold text-on-surface mt-1">{riskScore.toFixed(0)}% Index</h4>
          <div className="progress-bar !h-1.5 bg-background mt-4 overflow-hidden rounded-full">
            <div className={`progress-fill ${riskScore > 70 ? 'bg-success' : riskScore > 40 ? 'bg-warning' : 'bg-error'}`} style={{ width: `${riskScore}%` }} />
          </div>
          <p className="text-[9px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest opacity-60">
            {riskScore > 70 ? 'Highly Diversified' : riskScore > 40 ? 'Moderate Buffer' : 'Concentrated Risk'}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start mb-4">
            <p className="stat-label mb-0">Estimated Returns</p>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary"><Activity size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold text-on-surface mt-1">{currencySymbol} {(totalValue * 0.082).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
          <div className="flex items-center gap-1.5 mt-4 text-secondary">
            <TrendingUp size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">8.2% Proj. APR</span>
          </div>
          <p className="text-[9px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest opacity-60">Estimated 12m growth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Allocation Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="stat-card">
            <h3 className="section-title text-sm mb-6">Investment Mix</h3>
            {categorizedData.length > 0 ? (
              <>
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={categorizedData}
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1500}
                      >
                        {categorizedData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ background: 'var(--color-surface-container)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter opacity-40">Diversity</span>
                    <span className="text-xl font-black text-primary leading-none">{categorizedData.length}</span>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  {categorizedData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider group-hover:text-primary transition-colors">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-on-surface">{currencySymbol} {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-center opacity-20 italic">
                <PieIcon size={40} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Start adding your investments</p>
              </div>
            )}
          </div>

        </div>

        {/* Holdings Registry */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="section-title mb-0">Current Investments</h3>
            <div className="flex items-center gap-2 bg-surface-container/50 border border-glass-border rounded-xl px-4 py-2">
              <Info size={14} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Real-time</span>
            </div>
          </div>

          {assets.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block stat-card !p-0 overflow-hidden border border-glass-border shadow-2xl shadow-primary/5">
                <div className="overflow-x-auto">
                  <table className="data-table w-full text-left">
                    <thead>
                      <tr className="bg-surface-container/30">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Investment</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Current Value</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Change</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 pr-8">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {assets.map((asset) => {
                        const cost = asset.buyPrice * asset.amount;
                        const val = asset.currentValue || cost;
                        const gain = val - cost;
                        const gainPerc = cost > 0 ? (gain / cost) * 100 : 0;
                        const isPositive = gain >= 0;
                        return (
                          <tr key={asset._id} className="group hover:bg-primary/[0.03] transition-all duration-300">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                  {ASSET_ICONS[asset.assetType] || <PieIcon size={20} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-on-surface truncate pr-2 uppercase tracking-tight">{asset.assetName}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{asset.ticker || 'HODL'}</span>
                                    <span className="w-1 h-1 rounded-full bg-on-surface-variant opacity-30" />
                                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter opacity-60">{asset.platform || 'Direct'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-xs font-black text-on-surface">{currencySymbol} {val.toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40 mt-0.5">{asset.amount} Units @ {asset.buyPrice}</p>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`flex items-center gap-1.5 text-xs font-black ${isPositive ? 'text-success' : 'text-error'}`}>
                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(gainPerc).toFixed(2)}%
                              </div>
                              <p className={`text-[9px] font-bold uppercase tracking-tighter opacity-60 mt-0.5 ${isPositive ? 'text-success' : 'text-error'}`}>
                                {isPositive ? '+' : ''}{currencySymbol} {Math.abs(gain).toLocaleString()}
                              </p>
                            </td>
                            <td className="px-6 py-5 text-right pr-6">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button onClick={() => handleEdit(asset)} className="p-2.5 rounded-xl bg-surface-container text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                  <Edit2 size={12} />
                                </button>
                                <button onClick={() => openDeleteModal(asset)} className="p-2.5 rounded-xl bg-surface-container text-error hover:bg-error hover:text-white transition-all shadow-sm">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden space-y-3">
                {assets.map((asset) => {
                  const cost = asset.buyPrice * asset.amount;
                  const val = asset.currentValue || cost;
                  const gain = val - cost;
                  const gainPerc = cost > 0 ? (gain / cost) * 100 : 0;
                  const isPositive = gain >= 0;
                  return (
                    <div key={asset._id} className="stat-card !p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          {ASSET_ICONS[asset.assetType] || <PieIcon size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-on-surface truncate uppercase tracking-tight">{asset.assetName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{asset.ticker || 'HODL'}</span>
                            <span className="text-[9px] text-on-surface-variant opacity-50">{asset.platform || 'Direct'}</span>
                          </div>
                        </div>
                        {/* Always visible on mobile */}
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => handleEdit(asset)} className="p-2 rounded-xl bg-surface-container text-primary hover:bg-primary hover:text-white transition-all">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => openDeleteModal(asset)} className="p-2 rounded-xl bg-surface-container text-error hover:bg-error hover:text-white transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-on-surface-variant opacity-50 uppercase tracking-widest">{asset.amount} units @ {asset.buyPrice}</p>
                          <p className="text-sm font-black text-on-surface mt-0.5">{currencySymbol} {val.toLocaleString()}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-black ${isPositive ? 'text-success' : 'text-error'}`}>
                          {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          {Math.abs(gainPerc).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="stat-card !p-0 overflow-hidden border border-glass-border">
              <div className="py-24 text-center">
                <div className="flex flex-col items-center opacity-20">
                  <Wallet size={48} className="mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.2em]">No investments found</p>
                  <button onClick={() => setIsModalOpen(true)} className="btn btn-primary text-[10px] px-6 mt-6 uppercase tracking-widest">Add First Investment</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Modals */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditMode ? "Edit Investment" : "Add Investment"}>
        <form onSubmit={handleSubmit} className="space-y-7 pt-2 pb-2">
          {/* Section 1: Asset Identity */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 border-b border-glass-border pb-2 ml-1">Asset Identity</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Asset Name</label>
                <input required type="text" value={formData.assetName} onChange={e => setFormData({ ...formData, assetName: e.target.value })} className="input-field !py-4 font-bold" placeholder="e.g. Bitcoin, NVIDIA" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Ticker / Symbol</label>
                <input required type="text" value={formData.ticker} onChange={e => setFormData({ ...formData, ticker: e.target.value })} className="input-field !py-4 font-bold uppercase" placeholder="e.g. BTC, NVDA" />
              </div>
            </div>
          </div>

          {/* Section 2: Classification & Origin */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 border-b border-glass-border pb-2 ml-1">Classification & Origin</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Custom Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Vector Classification</label>
                <div
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="input-field !py-4 font-bold cursor-pointer flex justify-between items-center transition-all hover:border-primary/40"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{ASSET_TYPES.find(t => t.id === formData.assetType)?.label}</span>
                  </div>
                  <motion.div animate={{ rotate: showTypeDropdown ? 180 : 0 }}>
                    <ArrowDown size={14} className="opacity-40" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {showTypeDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute left-0 right-0 mt-2 bg-surface-container-high border border-glass-border rounded-2xl shadow-2xl z-[100] max-h-[280px] overflow-y-auto custom-scrollbar"
                    >
                      {ASSET_TYPES.map((type) => (
                        <div
                          key={type.id}
                          onClick={() => {
                            setFormData({ ...formData, assetType: type.id });
                            setShowTypeDropdown(false);
                          }}
                          className={`p-4 border-b border-glass-border last:border-0 hover:bg-primary/10 cursor-pointer transition-all ${formData.assetType === type.id ? 'bg-primary/5' : ''}`}
                        >
                          <p className="text-[11px] font-black text-on-surface leading-none mb-1">{type.label}</p>
                          <p className="text-[9px] font-medium text-on-surface-variant truncate opacity-60">{type.desc}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Platform Origin</label>
                <input type="text" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="input-field !py-4 font-bold" placeholder="e.g. Binance, Fidelity" />
              </div>
            </div>
          </div>

          {/* Section 3: Financial Metrics */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 border-b border-glass-border pb-2 ml-1">Financial Metrics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Quantity</label>
                <input required type="number" step="any" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="input-field !py-4 font-bold" placeholder="0.00" />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1 leading-tight">Avg. Buy <span className="opacity-40">({currencySymbol})</span></label>
                <input required type="number" step="any" value={formData.buyPrice} onChange={e => setFormData({ ...formData, buyPrice: e.target.value })} className="input-field !py-4 font-bold" placeholder="0.00" />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1 leading-tight">Current <span className="opacity-40">({currencySymbol})</span></label>
                <input required type="number" step="any" value={formData.currentPrice} onChange={e => setFormData({ ...formData, currentPrice: e.target.value })} className="input-field !py-4 font-bold border-primary/20 bg-primary/5 text-primary" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Section 4: Purchase Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Purchase Notes</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="input-field !py-3 font-medium text-xs resize-none"
              placeholder="Strategic context..."
            />
          </div>

          {/* Value Summary */}
          <div className="p-6 bg-surface-container/30 rounded-[2rem] border border-glass-border">
            <div className="flex justify-between items-center text-right">
              <div>
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40 mb-1 leading-none">Total Value</p>
                <p className="text-[10px] font-black text-success uppercase tracking-widest">Live Registry</p>
              </div>
              <span className="text-3xl font-black text-on-surface font-mono tracking-tighter">
                {currencySymbol} {(Number(formData.quantity || 0) * Number(formData.currentPrice || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          <button type="submit" className="w-full btn btn-primary py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 mt-2">
            {isEditMode ? "Update Asset Registry" : "Execute Capital Injection"}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default Portfolio;
