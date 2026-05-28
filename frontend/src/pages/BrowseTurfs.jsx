import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterSidebar from '../components/FilterSidebar';
import TurfCard from '../components/TurfCard';
import { CardSkeleton } from '../components/LoadingSpinner';
import { turfAPI } from '../services/api';
import { SlidersHorizontal } from 'lucide-react';

const BrowseTurfs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // API State
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filter State
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    maxPrice: parseInt(searchParams.get('maxPrice')) || 2000,
    minRating: parseFloat(searchParams.get('minRating')) || 0,
    page: parseInt(searchParams.get('page')) || 1
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchTurfs = async () => {
      setLoading(true);
      try {
        const queryParams = {
          search: filters.search || undefined,
          location: filters.location || undefined,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating || undefined,
          page: filters.page,
          limit: 6 // 6 items per page for perfect grid pacing
        };

        const res = await turfAPI.getAll(queryParams);
        setTurfs(res.data.turfs);
        setPagination(res.data.pagination);
      } catch (error) {
        console.error('Failed to load turfs list:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, [filters]);

  const handleSearch = ({ search, location }) => {
    setFilters((prev) => ({
      ...prev,
      search,
      location,
      page: 1 // Reset pagination page on new search
    }));

    // Update query parameters
    const params = { ...filters, search, location, page: 1 };
    setSearchParams(params);
  };

  const handleFilterChange = ({ maxPrice, minRating }) => {
    setFilters((prev) => ({
      ...prev,
      maxPrice,
      minRating,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-100 tracking-tight">Find a Turf</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Search by city, price, and rating to book a slot that fits your group.
        </p>
      </div>

      {/* Floating Search Controls */}
      <SearchBar 
        onSearch={handleSearch} 
        initialSearch={filters.search} 
        initialLocation={filters.location} 
      />

      {/* Main Filters + Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
        {/* Left Side Filters Sidebar (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar 
            onFilterChange={handleFilterChange} 
            initialFilters={filters} 
          />
        </div>

        {/* Mobile Filters Trigger */}
        <div className="lg:hidden flex items-center justify-between bg-darkBg-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300">
            Showing {pagination.total} Turf matches
          </span>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="btn-glass py-2 px-4 text-xs font-extrabold flex items-center gap-2"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        {/* Mobile slide-down filter card */}
        {mobileFiltersOpen && (
          <div className="lg:hidden animate-fadeIn">
            <FilterSidebar 
              onFilterChange={(f) => {
                handleFilterChange(f);
                setMobileFiltersOpen(false);
              }} 
              initialFilters={filters} 
            />
          </div>
        )}

        {/* Right side results Grid */}
        <div className="lg:col-span-3 space-y-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array(4).fill(null).map((_, idx) => <CardSkeleton key={idx} />)}
            </div>
          ) : turfs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {turfs.map((turf) => (
                  <TurfCard key={turf.id} turf={turf} />
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-900">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                    className="btn-glass py-2 px-4 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-400 font-bold">
                    Page <span className="text-sportsGreen">{filters.page}</span> of {pagination.totalPages}
                  </span>
                  <button
                    disabled={filters.page === pagination.totalPages}
                    onClick={() => handlePageChange(filters.page + 1)}
                    className="btn-glass py-2 px-4 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-16 text-center rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-4">
              <div className="text-slate-655 text-6xl">🏏</div>
              <h3 className="text-lg font-bold text-slate-300">No turfs found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Try another city, lower the rating filter, or increase your max budget.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseTurfs;
