import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Bell, User, Settings, LogOut, CheckCircle2, UserPlus, Handshake, AlertCircle, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Topbar = ({ onMenuClick, isSidebarOpen }) => {
  const { user, logout, API } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const dropdownRef = React.useRef(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/notifications`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [API]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Poll every 45s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    const handleEvents = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleEvents);
    document.addEventListener('keydown', handleEvents);
    return () => {
      document.removeEventListener('mousedown', handleEvents);
      document.removeEventListener('keydown', handleEvents);
    };
  }, []);

  const handleMarkRead = async (id, link = null) => {
    try {
      if (id !== 'all') {
        const res = await fetch(`${API}/api/v1/notifications/read/${id}`, {
          method: 'PUT',
          credentials: 'include'
        });
        if (res.ok) fetchNotifications();
      } else {
        const res = await fetch(`${API}/api/v1/notifications/read/all`, {
          method: 'PUT',
          credentials: 'include'
        });
        if (res.ok) fetchNotifications();
      }

      if (link) {
        navigate(link);
        setShowNotifications(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type, message = "") => {
    const msg = message.toLowerCase();
    if (msg.includes('performance') || msg.includes('up')) return <TrendingUp size={14} className="text-success" />;
    if (msg.includes('market alert') || msg.includes('decline')) return <TrendingDown size={14} className="text-error" />;
    if (msg.includes('financial peak') || msg.includes('savings rate')) return <PieChart size={14} className="text-secondary" />;

    switch (type) {
      case 'INVITE': return <UserPlus size={14} className="text-secondary" />;
      case 'REQUEST': return <Handshake size={14} className="text-primary" />;
      case 'ACTION': return <CheckCircle2 size={14} className="text-success" />;
      default: return <AlertCircle size={14} className="text-on-surface-variant" />;
    }
  };

  return (
    <header ref={dropdownRef} className="sticky top-0 z-40 flex justify-between items-center w-full px-4 sm:px-6 py-3 bg-glass-surface backdrop-blur-xl border-b border-glass-border font-['Inter'] tracking-tight transition-colors duration-300">

      {/* Left — Mobile hamburger & Brand */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-low rounded-xl transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className="lg:hidden text-[1.1rem] font-[900] text-on-surface tracking-tightest">ExpenseMate</h1>
      </div>

      {/* Mobile-only: Notification bell + profile avatar */}
      <div className="flex lg:hidden items-center gap-2">
        {/* Notification bell (mobile) */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95 relative ${showNotifications ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-low'}`}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface text-[7px] font-black text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown (mobile) */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-2 top-14 w-[calc(100vw-1rem)] max-w-[360px] bg-surface-container-high border border-glass-border rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
            >
              <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface-container-highest">
                <h3 className="text-xs font-black text-on-surface uppercase tracking-[0.2em]">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={() => handleMarkRead('all')} className="text-[10px] font-bold text-primary hover:underline transition-all">Mark all as read</button>
                )}
              </div>
              <div className="max-h-[55vh] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkRead(n._id, n.link)}
                      className={`p-4 border-b border-glass-border last:border-0 hover:bg-surface-lowest/50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-primary/[0.02]' : 'opacity-60'}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                      <div className="flex gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border border-glass-border shrink-0 ${!n.isRead ? 'bg-surface-lowest shadow-sm' : 'bg-surface-container'}`}>
                          {getIcon(n.type, n.message)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-on-surface leading-snug mb-1">{n.message}</p>
                          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-14 text-center px-8">
                    <div className="w-12 h-12 rounded-2xl bg-surface-lowest border border-glass-border flex items-center justify-center mx-auto mb-3 text-on-surface-variant opacity-20">
                      <Bell size={24} />
                    </div>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">All Caught Up</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-surface-container-highest border-t border-glass-border text-center">
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Tap outside to dismiss</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile avatar (mobile) */}
        <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 shadow-md">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=3b82f6&color=fff`; }}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-black text-xs">{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right — Action hub (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center gap-2 sm:gap-3">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-low rounded-xl transition-all duration-300 active:scale-95"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light'
            ? <Moon size={20} className="transition-transform duration-500" />
            : <Sun size={20} className="transition-transform duration-500 rotate-12" />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95 relative ${showNotifications ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-low'}`}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface text-[7px] font-black text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                className="absolute right-0 mt-2 w-[320px] sm:w-[380px] bg-surface-container-high border border-glass-border rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
              >
                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface-container-highest">
                  <h3 className="text-xs font-black text-on-surface uppercase tracking-[0.2em]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => handleMarkRead('all')} className="text-[10px] font-bold text-primary hover:underline transition-all">Mark all as read</button>
                  )}
                </div>

                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkRead(n._id, n.link)}
                        className={`p-4 border-b border-glass-border last:border-0 hover:bg-surface-lowest/50 transition-colors cursor-pointer group relative ${!n.isRead ? 'bg-primary/[0.02]' : 'opacity-60'}`}
                      >
                        {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border border-glass-border shrink-0 ${!n.isRead ? 'bg-surface-lowest shadow-sm' : 'bg-surface-container'}`}>
                            {getIcon(n.type, n.message)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-on-surface leading-snug mb-1">{n.message}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!n.isRead && <span className="w-1 h-1 rounded-full bg-primary" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center px-10">
                      <div className="w-16 h-16 rounded-3xl bg-surface-lowest border border-glass-border flex items-center justify-center mx-auto mb-4 text-on-surface-variant opacity-20">
                        <Bell size={32} />
                      </div>
                      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-40">All Caught Up</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-surface-container-highest border-t border-glass-border text-center">
                  <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Press ESC to dismiss</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-glass-border mx-1" />

        {/* Profile Dropdown */}
        <div className="group relative">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-high/30 hover:backdrop-blur-lg p-1.5 rounded-xl transition-all duration-300">
            {/* Name (xl+) */}
            <div className="text-right hidden xl:block pr-1">
              <p className="text-[11px] font-[900] text-primary uppercase tracking-tight leading-none mb-1">
                {user?.fullName || 'User Identity'}
              </p>
              <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-black leading-none opacity-60">
                Free
              </p>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 group-hover:border-primary/50 transition-colors shadow-lg">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=3b82f6&color=fff`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-black text-xs tracking-tighter">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-52 bg-surface backdrop-blur-3xl border border-glass-border rounded-[1.25rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[999] overflow-hidden translate-y-2 group-hover:translate-y-0">
            <div className="bg-surface/95 py-1.5">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group/item"
              >
                <User size={16} className="opacity-60 group-hover/item:opacity-100 transition-opacity" />
                My Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group/item"
              >
                <Settings size={16} className="opacity-60 group-hover/item:opacity-100 transition-opacity" />
                App Settings
              </Link>
              <div className="border-t border-glass-border my-1 mx-2" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-error hover:bg-error/10 transition-colors group/item"
              >
                <LogOut size={16} className="opacity-70 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
