import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 text-center bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-sportsGreen/5 via-darkBg-deep to-darkBg-deep animate-fadeIn">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-sportsGreen/5 rounded-full filter blur-2xl pulse-cricket"></div>
        
        {/* Visual bowld animation/icon */}
        <div className="w-20 h-20 bg-sportsGreen/10 border border-sportsGreen/30 rounded-2xl flex items-center justify-center mx-auto text-4xl pulse-cricket select-none">
          🏏
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Clean Bowled! (404)</h1>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            The page slot or URL parameter you were aiming for has been knocked out of the stumps. It either doesn't exist or was moved to another boundary.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-neon-green text-xs py-2 px-5">
            Back to Pitch Home
          </Link>
          <Link to="/browse" className="btn-glass text-xs py-2 px-5">
            Search Slots
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
