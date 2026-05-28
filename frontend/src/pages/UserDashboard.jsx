import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Receipt,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from 'lucide-react';
import { bookingAPI, getErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const statusStyles = {
  CONFIRMED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  PENDING: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  CANCELLED: 'bg-red-500/10 text-red-300 border-red-500/30',
  COMPLETED: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
};

const filters = ['ALL', 'UPCOMING', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const isUpcoming = (booking) => {
  const bookingDay = new Date(booking.bookingDate);
  bookingDay.setHours(23, 59, 59, 999);
  return bookingDay >= new Date() && ['PENDING', 'CONFIRMED'].includes(booking.bookingStatus);
};

const getSlotLabel = (booking) =>
  booking?.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'Slot unavailable';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchMyBookings = async ({ silent = false } = {}) => {
    if (!silent) setRefreshing(true);

    try {
      const res = await bookingAPI.getMyHistory();
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyBookings({ silent: true });
  }, []);

  const handleCancelBooking = async (booking) => {
    if (!window.confirm(`Cancel ${booking.turf?.name || 'this booking'} on ${formatDate(booking.bookingDate)}?`)) {
      return;
    }

    setSubmittingId(booking.id);
    try {
      await bookingAPI.cancel(booking.id);
      toast.success('Booking cancelled successfully.');
      await fetchMyBookings({ silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmittingId(null);
    }
  };

  const stats = useMemo(() => {
    const paidBookings = bookings.filter((booking) => booking.paymentStatus === 'PAID');
    return {
      total: bookings.length,
      upcoming: bookings.filter(isUpcoming).length,
      pending: bookings.filter((booking) => booking.bookingStatus === 'PENDING').length,
      paid: paidBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );

    if (activeFilter === 'ALL') return sortedBookings;
    if (activeFilter === 'UPCOMING') return sortedBookings.filter(isUpcoming);
    return sortedBookings.filter((booking) => booking.bookingStatus === activeFilter);
  }, [activeFilter, bookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg-deep flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sportsGreen/30 bg-sportsGreen/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sportsGreen">
            <Calendar size={13} />
            Player Dashboard
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Your turf bookings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Track upcoming games, complete pending payments, download receipts, and cancel open reservations.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Link to="/browse" className="btn-neon-green py-2.5 px-4 text-xs font-black">
            <Search size={15} />
            Find Turf
          </Link>
          <button
            type="button"
            onClick={() => fetchMyBookings()}
            disabled={refreshing}
            className="btn-glass py-2.5 px-4 text-xs font-bold hover:border-sportsGreen/50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total bookings" value={stats.total} />
        <StatCard icon={Clock} label="Upcoming slots" value={stats.upcoming} accent="text-sportsGreen" />
        <StatCard icon={AlertTriangle} label="Pending payment" value={stats.pending} accent="text-sportsOrange" />
        <StatCard icon={Wallet} label="Total spent" value={currency.format(stats.paid)} />
      </section>

      <section className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 bg-darkBg-accent/60 px-4 sm:px-6 py-5">
          <div>
            <h2 className="text-lg font-black text-slate-100">Booking history</h2>
            <p className="mt-1 text-xs text-slate-500">Status, slot time, payment, and quick actions in one place.</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${
                  activeFilter === filter
                    ? 'border-sportsGreen bg-sportsGreen text-slate-950'
                    : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-100'
                }`}
              >
                {filter.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length > 0 ? (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead className="bg-slate-950/40 text-[10px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Turf</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Slot</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      submitting={submittingId === booking.id}
                      onCancel={handleCancelBooking}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden p-4 space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  submitting={submittingId === booking.id}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState activeFilter={activeFilter} />
        )}
      </section>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent = 'text-slate-100' }) => (
  <div className="glass-card rounded-2xl border border-slate-800 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className={`mt-2 text-2xl font-black ${accent}`}>{value}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 text-sportsGreen">
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
      statusStyles[status] || statusStyles.PENDING
    }`}
  >
    {status}
  </span>
);

const PaymentBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
      status === 'PAID'
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
        : status === 'FAILED'
        ? 'border-red-500/30 bg-red-500/10 text-red-300'
        : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    }`}
  >
    <CreditCard size={11} />
    {status}
  </span>
);

const BookingActions = ({ booking, submitting, onCancel }) => (
  <div className="flex flex-wrap justify-end gap-2">
    {booking.bookingStatus === 'PENDING' && (
      <Link to={`/bookings/payment/${booking.id}`} className="btn-neon-orange py-2 px-3 text-[10px] font-black">
        <CreditCard size={12} />
        Pay Now
      </Link>
    )}

    {booking.paymentStatus === 'PAID' && (
      <Link to={`/bookings/payment/${booking.id}`} className="btn-glass py-2 px-3 text-[10px] font-bold">
        <Receipt size={12} />
        Receipt
      </Link>
    )}

    {['CONFIRMED', 'PENDING'].includes(booking.bookingStatus) && (
      <button
        type="button"
        disabled={submitting}
        onClick={() => onCancel(booking)}
        className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-950/30 p-2 text-red-300 transition hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-50"
        title="Cancel booking"
      >
        <XCircle size={15} />
      </button>
    )}
  </div>
);

const BookingRow = ({ booking, submitting, onCancel }) => (
  <tr className="hover:bg-slate-900/30 transition-colors">
    <td className="px-6 py-4">
      <p className="font-black text-slate-100">{booking.turf?.name || 'Deleted turf'}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin size={12} />
        {booking.turf?.location || 'Location unavailable'}
      </p>
    </td>
    <td className="px-6 py-4 font-bold text-slate-300">{formatDate(booking.bookingDate)}</td>
    <td className="px-6 py-4">
      <span className="inline-flex items-center gap-2 font-black text-slate-200">
        <Clock size={14} className="text-sportsGreen" />
        {getSlotLabel(booking)}
      </span>
    </td>
    <td className="px-6 py-4 space-y-2">
      <p className="font-black text-slate-100">{currency.format(Number(booking.totalPrice || 0))}</p>
      <PaymentBadge status={booking.paymentStatus} />
    </td>
    <td className="px-6 py-4 text-center">
      <StatusBadge status={booking.bookingStatus} />
    </td>
    <td className="px-6 py-4 text-right">
      <BookingActions booking={booking} submitting={submitting} onCancel={onCancel} />
    </td>
  </tr>
);

const BookingCard = ({ booking, submitting, onCancel }) => (
  <article className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-black text-slate-100">{booking.turf?.name || 'Deleted turf'}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={12} />
          {booking.turf?.location || 'Location unavailable'}
        </p>
      </div>
      <StatusBadge status={booking.bookingStatus} />
    </div>

    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="rounded-xl bg-slate-900/70 p-3">
        <p className="text-slate-500 font-bold">Date</p>
        <p className="mt-1 font-black text-slate-200">{formatDate(booking.bookingDate)}</p>
      </div>
      <div className="rounded-xl bg-slate-900/70 p-3">
        <p className="text-slate-500 font-bold">Slot</p>
        <p className="mt-1 font-black text-slate-200">{getSlotLabel(booking)}</p>
      </div>
      <div className="rounded-xl bg-slate-900/70 p-3">
        <p className="text-slate-500 font-bold">Amount</p>
        <p className="mt-1 font-black text-slate-200">{currency.format(Number(booking.totalPrice || 0))}</p>
      </div>
      <div className="rounded-xl bg-slate-900/70 p-3">
        <p className="text-slate-500 font-bold">Payment</p>
        <div className="mt-1">
          <PaymentBadge status={booking.paymentStatus} />
        </div>
      </div>
    </div>

    <BookingActions booking={booking} submitting={submitting} onCancel={onCancel} />
  </article>
);

const EmptyState = ({ activeFilter }) => (
  <div className="px-6 py-16 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/50 text-sportsGreen">
      <Calendar size={26} />
    </div>
    <h3 className="text-lg font-black text-slate-100">No bookings found</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
      {activeFilter === 'ALL'
        ? 'Book a turf slot and it will appear here with payment and status details.'
        : `There are no ${activeFilter.toLowerCase()} bookings right now.`}
    </p>
    <Link to="/browse" className="btn-neon-green mx-auto mt-5 w-fit py-2.5 px-5 text-xs font-black">
      Browse Turfs
    </Link>
  </div>
);

export default UserDashboard;
