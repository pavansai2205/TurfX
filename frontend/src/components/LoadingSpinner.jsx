import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div className={`rounded-full border-t-sportsGreen border-r-transparent border-b-sportsGreen border-l-transparent animate-spin ${sizeClasses[size]}`}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sportsGreen/20 rounded-full w-3 h-3"></div>
      </div>
      <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 animate-pulse">
      <div className="bg-slate-100 h-48 w-full"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-slate-100 rounded w-16"></div>
          <div className="h-6 bg-slate-100 rounded w-16"></div>
        </div>
        <div className="h-10 bg-slate-100 rounded-xl w-full pt-2"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
