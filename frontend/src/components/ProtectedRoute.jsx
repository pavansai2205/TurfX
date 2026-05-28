import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg-deep flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save past location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role is not authorized to access this resource
    return (
      <div className="min-h-screen bg-darkBg-deep flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-darkBg-card p-8 rounded-3xl border border-red-500/30 max-w-md shadow-2xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Restrained</h1>
          <p className="text-slate-400 mb-6">
            Your current account credentials ({user.role}) lack sufficient administrative clear level to view this dashboard page.
          </p>
          <a href="/" className="btn-neon-green py-2.5 px-5 text-xs font-black inline-flex">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
