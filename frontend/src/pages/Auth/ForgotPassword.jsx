import React, { useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Link } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Password reset link has been sent to your email!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="glass-panel p-8 sm:p-10 w-full animate-fade-in-up">
        <div className="flex items-center gap-2 mb-6">
            <Link to="/login" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <ArrowLeft size={20} />
            </Link>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Reset Password</h3>
        </div>
        
        <p className="text-sm font-medium text-slate-500 mt-2 mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message ? (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                    <Send size={20} />
                </div>
                <h4 className="text-emerald-800 font-bold mb-1">Check your Email</h4>
                <p className="text-emerald-600 text-sm">{message}</p>
                <Link to="/login" className="btn-primary mt-6 inline-block w-full text-center">
                    BACK TO LOGIN
                </Link>
            </div>
        ) : (
            <form onSubmit={handleRequestReset}>
                <Input 
                    value={email}
                    onChange={({target}) => setEmail(target.value)}
                    label="Email Address"
                    placeholder="john@example.com"
                    type="text" 
                    icon={<Mail size={16} />}
                />
                
                {error && <p className="text-red-500 text-xs pb-2.5"> {error}</p>}

                <button 
                    disabled={loading}
                    type="submit" 
                    className="btn-primary mt-4 py-3.5 text-base flex justify-center items-center gap-2 disabled:opacity-70"
                >
                    {loading ? "SENDING..." : "SEND RESET LINK"}
                </button>
            </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
