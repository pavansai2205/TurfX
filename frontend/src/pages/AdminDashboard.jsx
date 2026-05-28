import React, { useState, useEffect } from 'react';
import { adminAPI, bookingAPI, turfAPI, getErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, Calendar, ShieldAlert, Trash2, ArrowRightLeft, RefreshCw, BarChart3, TrendingUp, Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  // Analytical State
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [turfsList, setTurfsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tab navigation: 'users', 'bookings', 'turfs'
  const [activeTab, setActiveTab] = useState('users');

  const fetchAdminData = async () => {
    try {
      // 1. Get stats metrics
      const analyticsRes = await adminAPI.getAnalytics();
      setMetrics(analyticsRes.data.metrics);

      // 2. Get users list
      const usersRes = await adminAPI.getAllUsers();
      setUsersList(usersRes.data);

      // 3. Get bookings list
      const bookingsRes = await adminAPI.getAllBookings();
      setBookingsList(bookingsRes.data);

      // 4. Get all turfs list on platform
      const turfsRes = await turfAPI.getAll({ limit: 100 });
      setTurfsList(turfsRes.data.turfs);
    } catch (error) {
      toast.error('Failed to load system admin parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Action: Toggle Role
  const handleToggleRole = async (userId, currentRole) => {
    const targetRole = currentRole === 'USER' ? 'TURF_OWNER' : 'USER';
    if (!window.confirm(`Are you sure you want to change this account's role to ${targetRole}?`)) return;

    try {
      await adminAPI.toggleRole(userId, targetRole);
      toast.success('User role modified successfully.');
      await fetchAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Action: Delete user account
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Deleting this user account permanently wipes all their listings and bookings. Proceed?')) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User profile removed permanently.');
      await fetchAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Action: Cancel Booking override
  const handleCancelBookingOverride = async (bookingId) => {
    if (!window.confirm('Cancel this booking transaction?')) return;

    try {
      await bookingAPI.cancel(bookingId);
      toast.success('Booking cancelled successfully.');
      await fetchAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Action: Delete Turf Listing override (Admin control)
  const handleDeleteTurfOverride = async (turfId) => {
    if (!window.confirm('WARNING: Removing this turf ground listing permanently deletes all its timing slots and bookings ledger. Proceed?')) return;

    setSubmitting(true);
    try {
      await turfAPI.delete(turfId);
      toast.success('Turf listing deleted successfully.');
      await fetchAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-darkBg-deep flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            🛡️ System Control Desk
          </h1>
          <p className="text-xs text-slate-400">Monitor system registers, configure users, and oversee bookings.</p>
        </div>

        <button 
          onClick={fetchAdminData}
          className="btn-glass text-xs font-bold py-2 px-4 self-start flex items-center gap-1.5 hover:border-sportsGreen/50"
        >
          <RefreshCw size={12} /> Sync Dashboard
        </button>
      </div>

      {/* Analytical Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-850">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Players</span>
          <span className="text-xl font-black text-slate-200">{metrics.totalUsers}</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-850">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Turf Owners</span>
          <span className="text-xl font-black text-slate-200">{metrics.totalOwners}</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-850">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Active Turfs</span>
          <span className="text-xl font-black text-sportsGreen">{metrics.totalTurfs} Listed</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-850">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Bookings Count</span>
          <span className="text-xl font-black text-slate-200">{metrics.totalBookings} Total</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-850">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Gross Revenue</span>
          <span className="text-xl font-black text-sportsGreen flex items-center">
            ₹{metrics.totalRevenue.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Tabs list switches */}
      <div className="flex border-b border-slate-900 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-sportsGreen text-sportsGreen'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          👤 Accounts ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'bookings'
              ? 'border-sportsGreen text-sportsGreen'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          📋 Bookings ({bookingsList.length})
        </button>
        <button
          onClick={() => setActiveTab('turfs')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'turfs'
              ? 'border-sportsGreen text-sportsGreen'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          🏟️ Turfs ({turfsList.length})
        </button>
      </div>

      {/* Dynamic Tab Contents */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        
        {/* Tab 1: Users Grid */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Account Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-center">Active Role</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-850/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{usr.name}</td>
                    <td className="px-6 py-4 text-slate-400">{usr.email}</td>
                    <td className="px-6 py-4 text-slate-450">{usr.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${
                        usr.role === 'ADMIN'
                          ? 'bg-purple-950/40 border border-purple-500/20 text-purple-400'
                          : usr.role === 'TURF_OWNER'
                          ? 'bg-amber-950/40 border border-amber-500/20 text-amber-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {usr.role !== 'ADMIN' && (
                        <>
                          <button
                            onClick={() => handleToggleRole(usr.id, usr.role)}
                            className="bg-slate-900 border border-slate-800 hover:border-sportsGreen/40 text-slate-400 hover:text-sportsGreen p-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                            title="Toggle User/Owner Role"
                          >
                            <ArrowRightLeft size={12} /> <span className="text-[10px]">Toggle Role</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Bookings Audit */}
        {activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Turf Ground / City</th>
                  <th className="px-6 py-4">Slot timings</th>
                  <th className="px-6 py-4 text-center">Revenue</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Audits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {bookingsList.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-850/10 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-200">{booking.user?.name}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">{booking.user?.email}</p>
                    </td>

                    {/* Turf details */}
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-355">{booking.turf.name}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">{booking.turf.location}</p>
                    </td>

                    {/* Date/Timings */}
                    <td className="px-6 py-4">
                      <p className="text-slate-400">
                        {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold">{booking.slot.startTime} - {booking.slot.endTime}</p>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-center text-slate-300 font-extrabold">
                      ₹{booking.totalPrice}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider inline-block ${
                        booking.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-400'
                          : booking.bookingStatus === 'PENDING'
                          ? 'bg-amber-950/40 border border-amber-500/20 text-amber-400 animate-pulse'
                          : 'bg-red-950/40 border border-red-500/20 text-red-400'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {['CONFIRMED', 'PENDING'].includes(booking.bookingStatus) && (
                        <button
                          onClick={() => handleCancelBookingOverride(booking.id)}
                          className="bg-red-950/45 border border-red-500/20 hover:bg-red-900/80 text-red-450 p-2 rounded-xl transition-all text-[10px] font-black"
                          title="Admin Cancel Booking override"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Turfs Audit (New!) */}
        {activeTab === 'turfs' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Ground / Pitch Name</th>
                  <th className="px-6 py-4">Location City</th>
                  <th className="px-6 py-4">Street Address</th>
                  <th className="px-6 py-4 text-center">Hourly Price</th>
                  <th className="px-6 py-4 text-center">Ratings Score</th>
                  <th className="px-6 py-4 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {turfsList.map((turf) => (
                  <tr key={turf.id} className="hover:bg-slate-850/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{turf.name}</td>
                    <td className="px-6 py-4 text-sportsGreen font-extrabold uppercase tracking-wider">{turf.location}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={turf.address}>{turf.address}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-slate-200">₹{turf.pricePerHour}</td>
                    <td className="px-6 py-4 text-center font-black text-sportsGreen">⭐ {turf.rating > 0 ? turf.rating.toFixed(1) : 'New'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTurfOverride(turf.id)}
                        disabled={submitting}
                        className="bg-red-950/45 border border-red-500/20 hover:bg-red-900/80 text-red-450 p-2 rounded-xl transition-all text-[10px] font-black"
                        title="Admin Delete Turf Listing"
                      >
                        Remove Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
