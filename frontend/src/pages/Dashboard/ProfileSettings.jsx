import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Image as ImageIcon, CheckCircle, Loader2, Calendar, Activity, Rocket, X, ShieldCheck, Database, Smartphone, Clock, Globe, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfileSettings = ({ user, stats, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profileImageUrl || null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '',
      });
      setPreviewImage(user.profileImageUrl || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If password is NOT changing, just update profile normally
    if (!formData.password) {
      return executeUpdate();
    }

    // If password IS changing, trigger OTP
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/send-otp`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      toast.success("OTP sent to your email!");
      setShowOtpModal(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) return toast.error("Please enter a valid 6-digit OTP");
    
    setLoading(true);
    try {
      // 1. Verify OTP and Update Password
      const otpResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify-otp-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: otpValue, newPassword: formData.password }),
      });
      
      const otpResult = await otpResponse.json();
      if (!otpResponse.ok) throw new Error(otpResult.message);

      // 2. Clear password and proceed to update other profile fields if changed
      const { password, ...otherData } = formData;
      if (otherData.fullName !== user.fullName || otherData.email !== user.email || profileImage) {
        await executeUpdate();
      } else {
        toast.success("Password updated successfully!");
        if (onSuccess) onSuccess();
      }
      
      setShowOtpModal(false);
      setOtpValue("");
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const executeUpdate = async () => {
    setLoading(true);
    const data = new FormData();
    if (formData.fullName !== user?.fullName) data.append("fullName", formData.fullName);
    if (formData.email !== user?.email) data.append("email", formData.email);
    if (profileImage) data.append("image", profileImage);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/profile`, {
        method: "PUT",
        credentials: "include",
        body: data,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const securityLogs = [
    { event: "Login", device: "Chrome / Windows", location: "Karachi, PK", time: "2 hours ago" },
    { event: "Password Change", device: "Chrome / Windows", location: "Karachi, PK", time: "3 days ago" },
    { event: "New Device Linked", device: "Safari / iOS", location: "Lahore, PK", time: "1 week ago" }
  ];

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      toast.success("Account deleted successfully");
      // Redirect to login or home
      window.location.href = "/";
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/export-data`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message);
      }

      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expanse-tracker-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to export data");
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel overflow-hidden animate-fade-in-up">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white text-center relative">
        <h2 className="text-2xl font-bold mb-2">Profile Settings</h2>
        <p className="text-slate-400 text-sm">Update your personal information and security settings.</p>
        
        {/* Profile Image Upload */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-700 bg-slate-800 flex items-center justify-center shadow-2xl">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-slate-500">{formData.fullName?.charAt(0)}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-500 transition-colors border-2 border-slate-900">
              <ImageIcon size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Calendar size={14} /> Member Since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Loading...'}
          </div>
        </div>
      </div>

      <div className="p-8 pb-0 grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <Activity size={16} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Total Income</span>
              </div>
              <p className="text-lg font-bold text-emerald-800">${stats?.totalIncome || 0}</p>
          </div>
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                      <Rocket size={16} />
                  </div>
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Total Expense</span>
              </div>
              <p className="text-lg font-bold text-rose-800">${stats?.totalExpense || 0}</p>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-slate-400" /> Full Name
          </label>
          <div className="input-box">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-transparent outline-none"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Mail size={16} className="text-slate-400" /> Email Address
          </label>
          <div className="input-box">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Lock size={16} className="text-slate-400" /> New Password
          </label>
          <div className="input-box">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none"
              placeholder="Leave blank to keep current password"
            />
          </div>
          {formData.password && (
             <p className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
               <ShieldCheck size={12} /> Password change requires OTP verification
             </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full py-4 mt-6 text-base flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
          {loading ? 'Processing...' : 'Save Profile Changes'}
        </button>
      </form>

      <div className="px-8 pb-12 space-y-10">
        {/* Security Log */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <ShieldCheck size={20} className="text-indigo-600" />
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Security Audit</h3>
           </div>
           
           <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              {securityLogs.map((log, idx) => (
                <div key={idx} className={`p-4 flex items-center justify-between ${idx !== securityLogs.length - 1 ? 'border-b border-white/5' : ''}`}>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                         {log.event === 'Login' ? <Clock size={16} /> : <Globe size={16} />}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white">{log.event}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{log.device} • {log.location}</p>
                      </div>
                   </div>
                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md">{log.time}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Data Management */}
        <div className="space-y-6 pt-6">
           <div className="flex items-center gap-2 border-b border-rose-100 pb-4">
              <Database size={20} className="text-rose-600" />
              <h3 className="font-black text-rose-600 uppercase tracking-widest text-xs">Data & Privacy</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleExportData}
                className="flex items-center justify-center gap-3 p-5 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all active:scale-95 group"
              >
                 <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> Export Vault
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-3 p-5 bg-rose-50 border border-rose-100 rounded-2xl font-black text-xs uppercase tracking-widest text-rose-600 hover:bg-rose-100 transition-all active:scale-95 group"
              >
                 <Trash2 size={18} className="group-hover:scale-110 transition-transform" /> Delete Account
              </button>
           </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-[6px] animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 relative shadow-2xl border border-slate-100 animate-fade-in-up">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Delete Account</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
            
            <div className="space-y-6">
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="btn-danger w-full py-4 text-lg flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : "Delete Account Permanently"}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 relative shadow-2xl border border-slate-100 animate-fade-in-up">
            <button 
              onClick={() => { setShowOtpModal(false); setLoading(false); }}
              className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Verify Password Change</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">
                We've sent a 6-digit code to your email. Enter it below to confirm.
              </p>
            </div>
            
            <div className="space-y-6">
              <input 
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                placeholder="000 000"
                className="w-full text-center text-4xl font-black tracking-[0.5em] py-5 bg-slate-50 rounded-3xl border border-slate-100 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-200"
              />
              <button 
                onClick={handleVerifyOtp}
                disabled={loading || otpValue.length !== 6}
                className="btn-primary w-full py-4 text-lg flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : "Verify and Update"}
              </button>
              <p className="text-center text-xs font-bold text-slate-400">
                Didn't receive code? <button onClick={handleSubmit} className="text-indigo-600 hover:underline">Resend</button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ProfileSettings;
