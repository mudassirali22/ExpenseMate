import React from 'react';
import { NavLink } from 'react-router-dom';

const bottomNavItems = [
  { path: '/dashboard', label: 'Home', icon: 'dashboard' },
  { path: '/transactions', label: 'Sync', icon: 'sync_alt' },
  { path: '/analytics', label: 'Audit', icon: 'bar_chart' },
  { path: '/budgets', label: 'Limits', icon: 'wallet' },
  { path: '/profile', label: 'Node', icon: 'account_circle' },
];

const BottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-[#0b1326]/80 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      {bottomNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-6 py-2 transition-all duration-300 relative group active:scale-90 ${isActive
              ? 'text-[#b4c5ff]'
              : 'text-slate-500 hover:text-slate-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined text-[24px] transition-all duration-300 ${isActive ? 'scale-110' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-4 w-12 h-1 bg-gradient-to-r from-transparent via-[#b4c5ff] to-transparent rounded-full blur-[2px] animate-pulse"></div>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
