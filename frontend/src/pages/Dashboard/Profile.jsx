import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Fingerprint, Calendar, Camera, ShieldCheck, Award, Zap } from 'lucide-react';
const Profile = () => {
  const { user, API, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('email', email);
      const res = await fetch(`${API}/api/v1/auth/profile`, {
        method: 'PUT', credentials: 'include', body: formData,
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Identity updated!'); refreshUser();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('fullName', user.fullName);
    try {
      const res = await fetch(`${API}/api/v1/auth/profile`, {
        method: 'PUT', credentials: 'include', body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      toast.success('Photo updated!'); refreshUser();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="page-container animate-fade-in-up pb-10">
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant opacity-80">Profile Info</span>
          </div>
          <h1 className="page-title text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">Profile</h1>
          <p className="page-subtitle text-sm mt-1 text-on-surface-variant">Update your personal details and account info.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleUpdateProfile}
            disabled={saving}
            className="btn btn-primary px-6"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Identity Core Card */}
        <div className="lg:col-span-8 stat-card overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all"></div>

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <User size={24} />
            </div>
            <h3 className="text-xl font-bold text-on-surface uppercase tracking-tight">Account Details</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="flex flex-col items-center gap-5 shrink-0">
              <div className="relative group/avatar">
                <div className="w-44 h-44 rounded-3xl overflow-hidden border-4 border-surface-low shadow-xl bg-surface-lowest transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-black bg-surface-highest text-primary">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-3 bg-primary text-on-primary rounded-2xl shadow-2xl hover:scale-110 transition-all cursor-pointer border-4 border-background">
                  <Camera size={18} />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Profile Photo</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="input-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={16} />
                  <input
                    className="input-field pl-12"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" size={16} />
                  <input
                    className="input-field pl-12"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label">Member ID</label>
                <div className="input-field bg-surface-low opacity-60 flex items-center gap-3 cursor-not-allowed">
                  <Fingerprint size={16} className="text-primary" />
                  <span className="font-mono text-sm">EM-{user?.id?.slice(-8).toUpperCase() || 'MEMBER'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label">Member Since</label>
                <div className="input-field bg-surface-low opacity-60 flex items-center gap-3 cursor-not-allowed">
                  <Calendar size={16} className="text-on-surface-variant" />
                  <span className="text-sm font-semibold">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Metrics Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="stat-card relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 blur-[80px] rounded-full -ml-24 -mb-24 transition-colors"></div>
            <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight mb-6">Account Status</h3>
            <div className="space-y-4">
              {[
                { label: 'Status', value: 'Active', color: 'text-success', icon: Zap },
                { label: 'Plan', value: 'Free', color: 'text-primary', icon: Award },
                { label: 'Security', value: 'Encrypted', color: 'text-secondary', icon: ShieldCheck }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-surface-lowest border border-glass-border hover:bg-surface-container transition-all">
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className={item.color} />
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-tight ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card bg-primary/5 border-primary/20 text-center">
            <Award className="text-primary mx-auto mb-3" size={32} />
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Membership Badge</p>
            <p className="text-xs text-on-surface-variant italic font-medium opacity-80 leading-relaxed">
              "You are a verified free member of ExpanseMate."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
