import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, Calendar, Search, User, LogOut, LayoutDashboard, Settings, MapPin, ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on page transitions
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TURF_OWNER') return '/owner';
    return '/dashboard';
  };

  const isActiveRoute = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Main header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo with sleek athletic gradient TX badge */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-sportsGreen to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-sportsGreen/25 text-white font-extrabold text-lg tracking-tight select-none transform transition-transform group-hover:scale-105 duration-300">
                TX
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 transition-colors">
                Turf<span className="text-sportsGreen">X</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink 
                to="/browse" 
                className={({ isActive }) => 
                  `font-bold text-xs uppercase tracking-wider transition-all duration-300 relative py-1.5 flex items-center gap-1.5 group ${
                    isActive ? 'text-sportsGreen' : 'text-slate-600 hover:text-sportsGreen'
                  }`
                }
              >
                <Search size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Book Turf</span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-sportsGreen transition-all duration-300 ${isActiveRoute('/browse') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </NavLink>
              
              <Link 
                to={isAuthenticated && user?.role === 'TURF_OWNER' ? '/owner' : '/register'}
                className="font-bold text-xs uppercase tracking-wider transition-all duration-300 relative py-1.5 flex items-center gap-1.5 text-slate-600 hover:text-sportsGreen group"
              >
                <LayoutDashboard size={14} className="text-slate-400 group-hover:text-sportsGreen transition-colors" />
                <span>List Your Arena</span>
                <span className="absolute -bottom-1 left-0 h-0.5 bg-sportsGreen transition-all duration-300 w-0 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Desktop Actions / Dropdown */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative flex items-center gap-4">
                  {/* Dashboard Quick Access */}
                  <Link 
                    to={getDashboardRoute()} 
                    className="btn-glass py-1.5 px-3.5 text-xs font-bold border border-slate-200/80 rounded-xl hover:border-sportsGreen hover:text-sportsGreen hover:bg-sportsGreen/5 transition-all duration-300 flex items-center gap-1.5 shadow-sm"
                  >
                    <LayoutDashboard size={13} /> 
                    <span>
                      {user.role === 'ADMIN' ? 'Admin Panel' : user.role === 'TURF_OWNER' ? 'Owner Panel' : 'Dashboard'}
                    </span>
                  </Link>

                  {/* Vertical divider */}
                  <span className="w-px h-6 bg-slate-200"></span>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)} 
                      onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                      className="flex items-center gap-2 group p-1.5 rounded-xl hover:bg-slate-100/60 transition-all duration-300 focus:outline-none"
                    >
                      <img 
                        src={user.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-xl border border-slate-200 group-hover:border-sportsGreen transition-all duration-300 object-cover"
                      />
                      <div className="text-left leading-tight hidden lg:block">
                        <p className="text-xs font-black text-slate-800 group-hover:text-sportsGreen transition-colors">{user.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                      </div>
                      <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>

                    {/* Floating Dropdown Card */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn space-y-0.5">
                        <Link 
                          to="/profile"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-sportsGreen hover:bg-slate-50 transition-colors"
                        >
                          <User size={14} className="text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link 
                          to={getDashboardRoute()}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-sportsGreen hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-slate-400" />
                          <span>Dashboard</span>
                        </Link>
                        
                        <div className="border-t border-slate-100 my-1"></div>
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider px-3 py-2 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-neon-green py-2 px-5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md">
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100/60 transition-colors"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute top-full left-0 w-full p-6 space-y-4 shadow-xl z-50 animate-fadeIn">
            <Link 
              to="/browse" 
              className="flex items-center gap-2.5 font-bold text-sm text-slate-700 hover:text-sportsGreen py-2"
            >
              <Search size={16} />
              <span>Book Turf</span>
            </Link>
            
            <Link 
              to={isAuthenticated && user?.role === 'TURF_OWNER' ? '/owner' : '/register'}
              className="flex items-center gap-2.5 font-bold text-sm text-slate-700 hover:text-sportsGreen py-2"
            >
              <LayoutDashboard size={16} />
              <span>List Your Arena</span>
            </Link>
            
            {isAuthenticated ? (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={user.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                    alt="" 
                    className="w-10 h-10 rounded-xl border border-slate-200 object-cover" 
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{user.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <Link 
                  to={getDashboardRoute()} 
                  className="w-full btn-glass text-xs font-bold py-2.5 justify-start"
                >
                  <LayoutDashboard size={14} /> <span>Dashboard</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="w-full btn-glass text-xs font-bold py-2.5 justify-start"
                >
                  <Settings size={14} /> <span>Profile Settings</span>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full btn-glass text-red-500 hover:bg-red-50 text-xs font-bold py-2.5 justify-start"
                >
                  <LogOut size={14} /> <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <Link 
                  to="/login" 
                  className="btn-glass py-2.5 text-center text-xs font-black uppercase tracking-wider"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn-neon-green py-2.5 text-center text-xs font-black uppercase tracking-wider"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* App-like mobile navigation dock */}
      <nav className="md:hidden fixed bottom-0 left-0 z-40 w-full h-16 bg-white/95 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around px-2 pb-safe shadow-lg">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 py-1 relative ${
            isActiveRoute('/') ? 'text-sportsGreen scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar size={18} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-wider">Home</span>
          {isActiveRoute('/') && <span className="absolute bottom-1 w-1.5 h-1.5 bg-sportsGreen rounded-full"></span>}
        </Link>
        <Link 
          to="/browse" 
          className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 py-1 relative ${
            isActiveRoute('/browse') ? 'text-sportsGreen scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search size={18} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-wider">Explore</span>
          {isActiveRoute('/browse') && <span className="absolute bottom-1 w-1.5 h-1.5 bg-sportsGreen rounded-full"></span>}
        </Link>
        {isAuthenticated ? (
          <>
            <Link 
              to={getDashboardRoute()} 
              className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 py-1 relative ${
                isActiveRoute(getDashboardRoute()) ? 'text-sportsGreen scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="text-[9px] mt-1 font-black uppercase tracking-wider">Panel</span>
              {isActiveRoute(getDashboardRoute()) && <span className="absolute bottom-1 w-1.5 h-1.5 bg-sportsGreen rounded-full"></span>}
            </Link>
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 py-1 relative ${
                isActiveRoute('/profile') ? 'text-sportsGreen scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User size={18} />
              <span className="text-[9px] mt-1 font-black uppercase tracking-wider">Profile</span>
              {isActiveRoute('/profile') && <span className="absolute bottom-1 w-1.5 h-1.5 bg-sportsGreen rounded-full"></span>}
            </Link>
          </>
        ) : (
          <Link 
            to="/login" 
            className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 py-1 relative ${
              isActiveRoute('/login') ? 'text-sportsGreen scale-105' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={18} />
            <span className="text-[9px] mt-1 font-black uppercase tracking-wider">Login</span>
            {isActiveRoute('/login') && <span className="absolute bottom-1 w-1.5 h-1.5 bg-sportsGreen rounded-full"></span>}
          </Link>
        )}
      </nav>
    </>
  );
};

export default Navbar;
