import React, { useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/Inputs/Input';
import { Lock, CheckCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Password reset successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="glass-panel p-8 sm:p-10 w-full animate-fade-in-up">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">New Password</h3>
        <p className="text-sm font-medium text-slate-500 mt-2 mb-8">
          Please enter and confirm your new password.
        </p>

        <form onSubmit={handleResetPassword}>
          <Input 
            value={password}
            onChange={({target}) => setPassword(target.value)}
            label="New Password"
            placeholder="Min 8 characters"
            type="password" 
            icon={<Lock size={16} />}
          />

          <Input 
            value={confirmPassword}
            onChange={({target}) => setConfirmPassword(target.value)}
            label="Confirm Password"
            placeholder="Min 8 characters"
            type="password" 
            icon={<CheckCircle size={16} />}
          />
          
          {error && <p className="text-red-500 text-xs pb-2.5"> {error}</p>}

          <button 
            disabled={loading}
            type="submit" 
            className="btn-primary mt-4 py-3.5 text-base flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? "RESETTING..." : "RESET PASSWORD"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
