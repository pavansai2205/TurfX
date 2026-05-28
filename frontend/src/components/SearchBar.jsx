import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

const SearchBar = ({ onSearch, initialSearch = '', initialLocation = '' }) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, location });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="glass-card p-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 max-w-4xl mx-auto shadow-sm"
    >
      {/* Search Input */}
      <div className="flex items-center gap-3 px-4 py-2 w-full sm:flex-1">
        <Search size={20} className="text-sportsGreen shrink-0" />
        <input 
          type="text" 
          placeholder="Search turf name or area"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-slate-100 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-500 w-full"
        />
      </div>

      <div className="h-px sm:h-8 w-full sm:w-px bg-slate-800 my-1 sm:my-0"></div>

      {/* Location Selector */}
      <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-60">
        <MapPin size={20} className="text-sportsGreen shrink-0" />
        <select 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-transparent border-none text-slate-100 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-500 w-full cursor-pointer"
        >
          <option value="" className="bg-darkBg-card text-slate-300">All Cities</option>
          <option value="Mumbai" className="bg-darkBg-card text-slate-300">Mumbai</option>
          <option value="Bangalore" className="bg-darkBg-card text-slate-300">Bangalore</option>
          <option value="Delhi" className="bg-darkBg-card text-slate-300">Delhi</option>
        </select>
      </div>

      {/* Search Button */}
      <button 
        type="submit" 
        className="btn-neon-green py-3 w-full sm:w-auto px-8 text-sm font-extrabold shrink-0"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
