import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Landing from './pages/Auth/Landing';
import ForceChangePassword from './pages/Auth/ForceChangePassword';

// Dashboard Pages
import Home from './pages/Dashboard/Home';
import Transactions from './pages/Dashboard/Transactions';
import Analytics from './pages/Dashboard/Analytics';
import Budgets from './pages/Dashboard/Budgets';
import SavingsGoals from './pages/Dashboard/SavingsGoals';
import CalendarView from './pages/Dashboard/CalendarView';
import TaxMonitor from './pages/Dashboard/TaxMonitor';
import AIAdvisor from './pages/Dashboard/AIAdvisor';
import Notes from './pages/Dashboard/Notes';
import Reminders from './pages/Dashboard/Reminders';
import Tools from './pages/Dashboard/Tools';
import ROICalculator from './pages/Dashboard/ROICalculator';
import Profile from './pages/Dashboard/Profile';
import Settings from './pages/Dashboard/Settings';
import Portfolio from './pages/Dashboard/Portfolio';
import SharedWallets from './pages/Dashboard/SharedWallets';
import Subscriptions from './pages/Dashboard/Subscriptions';
import DataManagement from './pages/Dashboard/DataManagement';

// Loading Screen
const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-sm font-black text-blue-100 tracking-widest uppercase mb-1">ExpenseMate</p>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Initializing Dashboard</p>
      </div>
    </div>
  </div>
);

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.mustChangePassword) return <Navigate to="/force-change-password" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/force-change-password" element={<ForceChangePassword />} />

        {/* Protected Dashboard Routes */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/savings" element={<SavingsGoals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/shared-wallets" element={<SharedWallets />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/tax-monitor" element={<TaxMonitor />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/roi-calculator" element={<ROICalculator />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-left"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-surface-container-high)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-glass-border)',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                fontSize: '14px',
              }
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;