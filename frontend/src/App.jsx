import React from 'react'
import {  
 BrowserRouter as Router,
 Routes,
 Route,
 Navigate,
} from "react-router-dom";
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Home from "./pages/Dashboard/Home";
import AddIncome from "./pages/Dashboard/AddIncome";
import Expense from "./pages/Dashboard/Expense";
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Landing from './pages/Auth/Landing';
import { Toaster } from 'react-hot-toast';


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Root />} />
          <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
          <Route path='/signup' element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path='/forgot-password' element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path='/reset-password/:token' element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path='/dashboard' element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path='/addIncome' element={<PrivateRoute><AddIncome /></PrivateRoute>} />
          <Route path='/expense' element={<PrivateRoute><Expense /></PrivateRoute>} />
        </Routes>      
      </Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  )
}

export default App

// Root Component: Redirects based on auth status
const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />;
};

// PrivateRoute: Replaces children with redirect if not logged in
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// PublicRoute: Replaces children with redirect if already logged in
const PublicRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};