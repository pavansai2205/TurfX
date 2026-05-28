import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate active token on initial page load
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('turfx_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (error) {
          console.error('Session boot failed, clearing token.');
          localStorage.removeItem('turfx_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  // Action: Register
  const registerUser = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      const { token, user: userData } = res.data;
      localStorage.setItem('turfx_token', token);
      setUser(userData);
      toast.success(`Welcome to TurfX, ${userData.name}!`);
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Action: Login
  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      const { token, user: userData } = res.data;
      localStorage.setItem('turfx_token', token);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Action: Logout
  const logoutUser = () => {
    localStorage.removeItem('turfx_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Action: Update local profile info
  const updateLocalProfile = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const value = {
    user,
    loading,
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    updateLocalProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to utilize AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider');
  }
  return context;
};
