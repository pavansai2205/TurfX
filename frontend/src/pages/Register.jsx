import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Lock, UserCheck, ArrowRight, Shield } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER' // Default
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSelect = (selectedRole) => {
    setFormData(prev => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setErrorMsg('Please populate all registration fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate(formData.role === 'TURF_OWNER' ? '/owner' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#eef2f0]">
      <div className="max-w-md w-full relative">
        
        {/* Glass Card Box */}
        <div className="glass-card p-8 rounded-2xl border border-[#d8d9d1] shadow-sm relative">
          
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 bg-sportsGreen rounded-xl flex items-center justify-center text-white font-black text-lg mx-auto">
              T
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Create TurfX Account</h2>
            <p className="text-xs text-slate-400">Join the ultimate sports cricket community</p>
          </div>

          {/* Validation Alert */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-semibold mb-5 animate-fadeIn">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Interactive Role Cards Selection */}
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Select Profile Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('USER')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    formData.role === 'USER'
                      ? 'bg-sportsGreen/10 border-sportsGreen text-sportsGreen'
                      : 'bg-white border-[#d8d9d1] text-[#68736b] hover:border-sportsGreen/50'
                  }`}
                >
                  <User size={16} />
                  <span className="text-xs font-bold">Cricket Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('TURF_OWNER')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                    formData.role === 'TURF_OWNER'
                      ? 'bg-sportsGreen/10 border-sportsGreen text-sportsGreen'
                      : 'bg-white border-[#d8d9d1] text-[#68736b] hover:border-sportsGreen/50'
                  }`}
                >
                  <Shield size={16} />
                  <span className="text-xs font-bold">Turf Owner</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserCheck size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="text" 
                  required
                  placeholder="Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input py-2.5 pl-11 pr-4 text-xs"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="email" 
                  required
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input py-2.5 pl-11 pr-4 text-xs"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="tel" 
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input py-2.5 pl-11 pr-4 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="password" 
                  required
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input py-2.5 pl-11 pr-4 text-xs"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-neon-green mt-3 py-3"
            >
              {loading ? 'Processing...' : 'Register Account'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Prompt */}
          <div className="border-t border-slate-900/60 pt-5 mt-5 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-sportsGreen hover:underline font-extrabold">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
