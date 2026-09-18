import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, getErrorMessage } from '../services/api';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Recover target route or fallback to dashboard
  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please input all login credentials.');
      return;
    }

    setLoading(true);
    try {
      const userData = await login({ email, password });
      
      // Redirect to previous route if exist, otherwise route directly based on operational roles
      if (location.state?.from?.pathname && location.state.from.pathname !== '/') {
        navigate(location.state.from.pathname, { replace: true });
      } else {
        if (userData.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (userData.role === 'TURF_OWNER') {
          navigate('/owner', { replace: true });
        } else {
          navigate('/dashboard', { replace: true }); // Standard player goes to bookings dashboard
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const targetEmail = window.prompt('Enter your registered email address:', email);
    if (!targetEmail) return;

    try {
      const res = await authAPI.forgotPassword(targetEmail);
      toast.success(res.data.message || 'Password reset instructions sent.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#eef2f0]">
      <div className="max-w-md w-full relative">
        
        {/* Glass Card Box */}
        <div className="glass-card p-8 rounded-2xl border border-[#d8d9d1] shadow-sm relative">
          
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 bg-sportsGreen rounded-xl flex items-center justify-center text-white font-black text-lg mx-auto">
              T
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Sign In to TurfX</h2>
            <p className="text-xs text-slate-400">Lock slots, challenge peers, and play cricket</p>
          </div>

          {/* Validation Alert */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-semibold mb-6 animate-fadeIn">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input py-3 pl-11 pr-4 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] text-sportsGreen hover:underline font-bold uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="text-slate-500 absolute top-1/2 left-4 -translate-y-1/2" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input py-3 pl-11 pr-4 text-xs"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-neon-green mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Prompt */}
          <div className="border-t border-slate-900/60 pt-6 mt-6 text-center text-xs text-slate-400">
            Don't have a TurfX account?{' '}
            <Link to="/register" className="text-sportsGreen hover:underline font-extrabold">
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
