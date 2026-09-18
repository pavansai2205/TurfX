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
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            🛡️ System Control Desk
          </h1>
          <p className="text-xs text-slate-500">Monitor system registers, configure users, and oversee bookings.</p>
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
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Players</span>
          <span className="text-xl font-black text-slate-900">{metrics.totalUsers}</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Turf Owners</span>
          <span className="text-xl font-black text-slate-900">{metrics.totalOwners}</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Active Turfs</span>
          <span className="text-xl font-black text-sportsGreen">{metrics.totalTurfs} Listed</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Bookings Count</span>
          <span className="text-xl font-black text-slate-900">{metrics.totalBookings} Total</span>
        </div>
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Gross Revenue</span>
          <span className="text-xl font-black text-sportsGreen flex items-center">
            ₹{Number(metrics.totalRevenue || 0).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Tabs list switches */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-sportsGreen text-sportsGreen'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          👤 Accounts ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'bookings'
              ? 'border-sportsGreen text-sportsGreen'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          📋 Bookings ({bookingsList.length})
        </button>
        <button
          onClick={() => setActiveTab('turfs')}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'turfs'
              ? 'border-sportsGreen text-sportsGreen'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          🏟️ Turfs ({turfsList.length})
        </button>
      </div>

      {/* Dynamic Tab Contents */}
      <div className="glass-card rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        
        {/* Tab 1: Users Grid */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Account Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 text-center">Active Role</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-900">{usr.name}</td>
                    <td className="px-6 py-4 text-slate-600">{usr.email}</td>
                    <td className="px-6 py-4 text-slate-600">{usr.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${
                        usr.role === 'ADMIN'
                          ? 'bg-purple-50 border border-purple-200 text-purple-700'
                          : usr.role === 'TURF_OWNER'
                          ? 'bg-amber-50 border border-amber-200 text-amber-700'
                          : 'bg-slate-100 border border-slate-200 text-slate-600'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {usr.role !== 'ADMIN' && (
                        <>
                          <button
                            onClick={() => handleToggleRole(usr.id, usr.role)}
                            className="bg-white border border-slate-200 hover:border-sportsGreen text-slate-700 hover:text-sportsGreen p-2 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs"
                            title="Toggle User/Owner Role"
                          >
                            <ArrowRightLeft size={12} /> <span className="text-[10px] font-bold">Toggle Role</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="text-slate-400 hover:text-red-600 p-2 transition-colors"
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
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Turf Ground / City</th>
                  <th className="px-6 py-4">Slot timings</th>
                  <th className="px-6 py-4 text-center">Revenue</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Audits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookingsList.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-900">{booking.user?.name}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">{booking.user?.email}</p>
                    </td>

                    {/* Turf details */}
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-800">{booking.turf.name}</p>
                      <p className="text-[10px] text-slate-500 leading-normal">{booking.turf.location}</p>
                    </td>

                    {/* Date/Timings */}
                    <td className="px-6 py-4">
                      <p className="text-slate-700 font-bold">
                        {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold">{booking.slot.startTime} - {booking.slot.endTime}</p>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-center text-slate-900 font-extrabold">
                      ₹{booking.totalPrice}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider inline-block ${
                        booking.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : booking.bookingStatus === 'PENDING'
                          ? 'bg-amber-50 border border-amber-200 text-amber-700'
                          : 'bg-red-50 border border-red-200 text-red-600'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {['CONFIRMED', 'PENDING'].includes(booking.bookingStatus) && (
                        <button
                          onClick={() => handleCancelBookingOverride(booking.id)}
                          className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all text-[10px] font-black"
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

        {/* Tab 3: Turfs Audit */}
        {activeTab === 'turfs' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4">Ground / Pitch Name</th>
                  <th className="px-6 py-4">Location City</th>
                  <th className="px-6 py-4">Street Address</th>
                  <th className="px-6 py-4 text-center">Hourly Price</th>
                  <th className="px-6 py-4 text-center">Ratings Score</th>
                  <th className="px-6 py-4 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {turfsList.map((turf) => (
                  <tr key={turf.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-900">{turf.name}</td>
                    <td className="px-6 py-4 text-sportsGreen font-extrabold uppercase tracking-wider">{turf.location}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={turf.address}>{turf.address}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-slate-900">₹{turf.pricePerHour}</td>
                    <td className="px-6 py-4 text-center font-black text-sportsGreen">⭐ {Number(turf.rating) > 0 ? Number(turf.rating).toFixed(1) : 'New'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteTurfOverride(turf.id)}
                        disabled={submitting}
                        className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all text-[10px] font-black"
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
