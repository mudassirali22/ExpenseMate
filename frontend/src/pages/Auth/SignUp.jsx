import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AuthLayout from '../../components/layouts/AuthLayout';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, googleAuth } = useAuth();
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
    if (!fullName || !email || !password || !confirmPassword) return toast.error('All fields are required');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!agreed) return toast.error('Please agree to the Terms of Service');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('password', password);
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
          className="mb-8"
        >
          <h2 className="text-3xl font-black text-on-surface tracking-tightest mb-2">Create Account</h2>
          <p className="text-on-surface-variant text-sm font-medium">Start your journey to financial freedom.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="space-y-1.5">
            <label htmlFor="name" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Full Name</label>
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors pointer-events-none" />
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="input-field !py-3 pl-11 !text-sm"
                required
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="space-y-1.5">
            <label htmlFor="email" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="input-field !py-3 pl-11 !text-sm"
                required
              />
            </div>
          </motion.div>

          {/* Password Fields */}
          <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="input-field !py-3 !text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Confirm</label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="input-field !py-3 !text-sm"
                required
              />
            </div>
          </motion.div>

          <motion.button 
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="text-[10px] text-on-surface-variant flex items-center gap-1.5 hover:text-primary transition-colors font-black uppercase tracking-widest px-1"
          >
            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPassword ? 'hide password' : 'show password'}
          </motion.button>

          {/* Terms */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex items-start gap-3 py-1">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded bg-surface-container-lowest border-glass-border text-primary focus:ring-primary/40 transition-all cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-on-surface-variant font-medium leading-snug">
              I agree to the <span className="text-primary font-bold cursor-pointer">Terms and Conditions</span> and privacy policy.
            </label>
          </motion.div>

          <motion.button
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            type="submit"
            disabled={loading}
            className="w-full btn btn-premium !py-4 text-xs uppercase tracking-[0.2em] font-black shadow-xl disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </motion.button>
        </form>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-glass-border opacity-50" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
            <span className="px-4 bg-background text-on-surface-variant">Or continue with</span>
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

        <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-8 text-center text-[12px] font-medium text-on-surface-variant">
          Already have an account?
          <Link to="/login" className="text-primary font-black hover:text-primary-container transition-colors ml-2 uppercase tracking-widest leading-loose border-b-2 border-primary/20 pb-0.5">
            Sign In
          </Link>
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
};

export default SignUp;
