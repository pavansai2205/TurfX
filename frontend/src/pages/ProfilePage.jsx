import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, getErrorMessage } from '../services/api';
import { User, Phone, Key, ShieldCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateLocalProfile } = useAuth();

  // Profile Edit Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Both name and phone fields are required.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await userAPI.updateProfile({ name, phone });
      updateLocalProfile({ name, phone });
      toast.success('Demographic profile updated successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Both current and new passwords are required.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      await userAPI.changePassword({ currentPassword, newPassword });
      toast.success('Your account password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-100 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-400">Configure your demographic credentials and secure account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Demographics Panel (Left 7 cols) */}
        <div className="md:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-lg">
          <h3 className="text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
            👤 Profile Details
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs font-semibold">
            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider block">Registered Email Address</label>
              <div className="relative opacity-60">
                <Mail size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="email" 
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl py-3 pl-11 pr-4 text-slate-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 focus:outline-none focus:border-sportsGreen focus:ring-0 transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="text" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 focus:outline-none focus:border-sportsGreen focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={updatingProfile}
              className="btn-neon-green px-6 py-2.5 text-xs font-black rounded-xl"
            >
              {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Password Reset Panel (Right 5 cols) */}
        <div className="md:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 h-fit space-y-6 shadow-lg">
          <h3 className="text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Key size={16} className="text-sportsGreen" /> Change Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs font-semibold">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider block">Current Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-sportsGreen focus:ring-0 transition-colors"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider block">New Password</label>
              <input 
                type="password" 
                required
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none focus:border-sportsGreen focus:ring-0 transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={changingPassword}
              className="w-full btn-glass text-xs font-bold py-2.5"
            >
              {changingPassword ? 'Processing...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
