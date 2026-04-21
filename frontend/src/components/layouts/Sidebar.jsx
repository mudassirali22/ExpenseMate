import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Receipt, Wallet, PiggyBank, BarChart3, TrendingUp,
  Users, CreditCard, Calculator, CalendarDays, FileText, Wrench,
  Settings, User, LogOut, X, Award, Database, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/portfolio', label: 'Portfolio', icon: TrendingUp },
    ],
  },
  {
    title: 'Finance',
    items: [
      { path: '/budgets', label: 'Budgets', icon: Wallet },
      { path: '/savings', label: 'Savings Goals', icon: PiggyBank },
      { path: '/shared-wallets', label: 'Shared Wallets', icon: Users },
      { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
    ],
  },
  {
    title: 'Tools',
    items: [
      { path: '/tax-monitor', label: 'Tax Monitor', icon: Calculator },
      { path: '/calendar', label: 'Calendar', icon: CalendarDays },
      { path: '/notes', label: 'Notes', icon: FileText },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Premium Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* High-Fidelity Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-56 glass-sidebar border-r border-glass-border flex flex-col pt-5 pb-0 gap-2 z-40 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand/Logo Section */}
        <div className="px-5 mb-6 flex items-center justify-between">
          <div className="group cursor-pointer">
            <h1 className="text-[1.1rem] font-[900] text-on-surface tracking-tightest group-hover:text-primary transition-colors">ExpenseMate</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-primary/60 mt-0.5 font-black">Control Panel</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-surface-low text-on-surface-variant hover:text-on-surface transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Scaled Navigation Menu */}
        <nav className="flex flex-col gap-0.5 px-2.5 flex-1 overflow-y-auto no-scrollbar mask-fade-y pb-2">
          {navSections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              {section.title && (
                <div className="mt-4 mb-1.5 px-3 border-t border-glass-border pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/80 font-bold">{section.title}</p>
                </div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative px-3 py-2 flex items-center gap-2.5 transition-all duration-200 rounded-xl text-[12px] font-semibold z-10 ${isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} className={`shrink-0 transition-all duration-300 transform group-hover:scale-110 z-10 relative ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                      <span className="transform transition-transform duration-300 group-hover:translate-x-0.5 z-10 relative">{item.label}</span>
                      
                      {/* Smooth Background Transition */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute inset-0 bg-primary/10 border border-primary/20 shadow-sm rounded-xl -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Mobile Action Hub (Hidden on Desktop) */}
        <div className="mt-auto border-t border-glass-border bg-surface-lowest/50 lg:hidden block">
          <div className="p-3 flex flex-col gap-1">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
            >
              <User size={16} />
              <span>Profile</span>
            </Link>
            
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <div className="h-px w-full bg-glass-border my-1" />

            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold text-error hover:bg-error/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
