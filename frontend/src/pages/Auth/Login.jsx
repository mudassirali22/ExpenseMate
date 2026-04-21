import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/layouts/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleAuth(credentialResponse.credential);
      toast.success('Google Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Google Auth Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('All fields are required');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="mb-8 text-left"
        >
          <h2 className="text-3xl font-black text-on-surface tracking-tightest mb-2">Welcome Back</h2>
          <p className="text-on-surface-variant text-sm font-medium leading-relaxed">Please login to access your account.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="space-y-2">
            <label htmlFor="email" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="input-field !py-3.5 pl-11 !text-sm"
                required
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="password" className="block text-[10px] font-black text-primary uppercase tracking-[0.15em]">
                Password
              </label>
              <Link to="/forgot-password" virtual="true" className="text-[10px] font-black text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest">
                Recover?
              </Link>
            </div>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field !py-3.5 pl-11 pr-11 !text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          {/* Remember Me */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex items-center px-1">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded bg-surface-lowest border-glass-border text-primary focus:ring-primary/40 cursor-pointer"
            />
            <label htmlFor="remember" className="ml-3 text-[12px] text-on-surface font-medium cursor-pointer select-none">
              Remember me
            </label>
          </motion.div>

          {/* Submit */}
          <motion.button
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            type="submit"
            disabled={loading}
            className="w-full btn btn-premium !py-4 text-xs uppercase tracking-[0.2em] font-black shadow-xl disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-glass-border opacity-50" />
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="bg-background px-4 text-on-surface-variant">
              Secure Login
            </span>
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Auth Failed')}
            theme="filled_white"
            shape="pill"
            size="large"
            text="continue_with"
            width="100%"
          />
        </motion.div>

        <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-center mt-8 text-[12px] font-medium text-on-surface-variant">
          New to ExpanseMate?
          <Link to="/signup" className="text-primary font-black hover:text-primary-container transition-colors ml-2 uppercase tracking-widest leading-loose border-b-2 border-primary/20 pb-0.5">
            Sign Up
          </Link>
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
