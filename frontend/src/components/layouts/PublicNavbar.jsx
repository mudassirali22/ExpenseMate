import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Wallet, ArrowRight } from 'lucide-react';

const PublicNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-10 lg:px-20 py-3.5 w-full bg-glass-surface backdrop-blur-xl border-b border-glass-border">
      <Link to="/" className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Wallet size={16} className="text-white sm:w-[20px] sm:h-[20px]" />
        </div>
        <span className="text-xl sm:text-2xl font-black tracking-tightest text-primary">ExpenseMate</span>
      </Link>

      {isLanding && (
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#stats" className="hover:text-primary transition-colors">Stats</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
        </div>
      )}

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-on-surface hover:bg-surface-low rounded-lg sm:rounded-xl transition-all duration-300 active:scale-95 bg-surface-lowest border border-glass-border shadow-sm"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <span className="material-symbols-outlined text-[18px] sm:text-[20px] transition-all duration-500 transform active:rotate-180" style={{ fontVariationSettings: "'FILL' 1" }}>
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {location.pathname !== '/login' && (
          <Link to="/login" className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-on-surface hover:text-primary transition-colors hidden sm:block">
            Sign In
          </Link>
        )}
        {location.pathname !== '/signup' && (
          <Link to="/signup" className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full btn-premium text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
            Get Started <ArrowRight size={14} className="hidden sm:block" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
