import React, { useState } from 'react';
import { Filter, Star, RefreshCw } from 'lucide-react';

const FilterSidebar = ({ onFilterChange, initialFilters = {} }) => {
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || 2000);
  const [minRating, setMinRating] = useState(initialFilters.minRating || 0);

  const handlePriceChange = (e) => {
    const val = parseInt(e.target.value);
    setMaxPrice(val);
    onFilterChange({ maxPrice: val, minRating });
  };

  const handleRatingSelect = (rating) => {
    const val = minRating === rating ? 0 : rating; // toggle
    setMinRating(val);
    onFilterChange({ maxPrice, minRating: val });
  };

  const handleReset = () => {
    setMaxPrice(2000);
    setMinRating(0);
    onFilterChange({ maxPrice: 2000, minRating: 0 });
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-8 sticky top-24 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
          <Filter size={16} className="text-sportsGreen" /> Filters
        </h3>
        <button 
          onClick={handleReset}
          className="text-slate-500 hover:text-sportsGreen transition-colors flex items-center gap-1.5 text-[10px] uppercase font-bold"
          title="Reset Filters"
        >
          <RefreshCw size={10} /> Clear
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400">Max price / hour</span>
          <span className="text-sportsGreen font-extrabold">₹{maxPrice}</span>
        </div>
        <input 
          type="range" 
          min="500" 
          max="2000" 
          step="100" 
          value={maxPrice}
          onChange={handlePriceChange}
          className="w-full accent-sportsGreen bg-slate-850 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
          <span>₹500</span>
          <span>₹2000</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-slate-400 text-xs">Minimum Star Rating</h4>
        <div className="flex flex-col gap-2">
          {[4.5, 4.0, 3.0].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingSelect(star)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                minRating === star 
                  ? 'bg-sportsGreen/10 border-sportsGreen text-sportsGreen shadow-neon-green shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Star size={14} className={minRating === star ? 'fill-sportsGreen' : 'text-slate-500'} /> 
                {star} Stars & Above
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
