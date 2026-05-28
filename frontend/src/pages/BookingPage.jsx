import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { turfAPI, bookingAPI, getErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Clock, User, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const turfId = searchParams.get('turfId');
  const slotId = searchParams.get('slotId');
  const dateStr = searchParams.get('date');

  // API State
  const [turf, setTurf] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCheckoutDetails = async () => {
      if (!turfId || !slotId || !dateStr) {
        toast.error('Missing checkout URL query parameters.');
        navigate('/browse');
        return;
      }

      try {
        const res = await turfAPI.getById(turfId);
        setTurf(res.data);

        // Extract selected slot
        const targetSlot = res.data.slots.find((s) => s.id === slotId);
        if (!targetSlot) {
          toast.error('Selected slot timings no longer valid.');
          navigate(`/turfs/${turfId}`);
          return;
        }
        setSlot(targetSlot);
      } catch (error) {
        toast.error('Error loading booking checkout elements.');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [turfId, slotId, dateStr]);

  const handleCheckoutConfirm = async () => {
    setSubmitting(true);
    try {
      // Re-validate availability on date before booking
      const checkRes = await bookingAPI.getAvailability(turfId, dateStr);
      const activeSlot = checkRes.data.slots.find((s) => s.id === slotId);
      
      if (activeSlot && activeSlot.isBooked) {
        toast.error('Sorry, this slot was just booked by another team! Please pick another.');
        navigate(`/turfs/${turfId}`);
        return;
      }

      // Create Pending booking transaction in DB
      const res = await bookingAPI.create({
        turfId,
        slotId,
        bookingDate: dateStr,
      });

      const bookingId = res.data.booking.id;
      toast.success('Booking initialized! Redirecting to payment screen.');
      
      // Redirect to simulated secure transaction screen
      navigate(`/bookings/payment/${bookingId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg-deep flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Cost matches the backend booking total, which stores one hourly slot price.
  const pricePerHour = Number(turf.pricePerHour || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Visual Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
        <Link to={`/turfs/${turfId}`} className="hover:text-sportsGreen">{turf.name}</Link>
        <ChevronRight size={10} />
        <span className="text-slate-300">Checkout Verification</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left billing & Summary information (Left 7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Summary Box */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wide">
              🏟️ Game Details Summary
            </h3>
            
            <div className="space-y-4 pt-2 divide-y divide-slate-900">
              {/* Turf */}
              <div className="flex items-center gap-3 text-slate-300 text-xs py-2 first:pt-0">
                <div className="w-8 h-8 rounded-lg bg-sportsGreen/10 flex items-center justify-center text-sportsGreen font-extrabold shrink-0">
                  🏏
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Selected Pitch</p>
                  <p className="font-bold text-slate-200">{turf.name}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 text-slate-300 text-xs py-2">
                <Calendar size={18} className="text-sportsGreen shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Booking Date</p>
                  <p className="font-bold text-slate-200">
                    {new Date(dateStr).toLocaleDateString('en-IN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Timing Slot */}
              <div className="flex items-center gap-3 text-slate-300 text-xs py-2">
                <Clock size={18} className="text-sportsGreen shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Timings Slot</p>
                  <p className="font-bold text-slate-200">
                    {slot.startTime} - {slot.endTime} (1 Hour Duration)
                  </p>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="flex items-center gap-3 text-slate-300 text-xs py-2">
                <User size={18} className="text-sportsGreen shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Captain / Player Profile</p>
                  <p className="font-bold text-slate-200">{user.name} ({user.phone})</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/15 border border-emerald-500/20 p-5 rounded-2xl flex items-start gap-3.5 text-xs text-slate-400 leading-relaxed font-semibold">
            <ShieldCheck size={20} className="text-sportsGreen shrink-0 mt-0.5" />
            <p>
              Your slot is checked and dynamically locked for 10 minutes upon creating the booking. Secure checkouts are guarded against duplicate transactions.
            </p>
          </div>
        </div>

        {/* Right billing invoice receipt details card (Right 5 cols) */}
        <div className="md:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 h-fit space-y-6 shadow-xl">
          <h3 className="text-base font-black text-slate-100 uppercase tracking-wide">
            💳 Cost Breakdown
          </h3>

          <div className="space-y-3.5 pt-2 text-xs">
            <div className="flex justify-between items-center text-slate-400 font-medium">
              <span>One Hour Slot Fee</span>
              <span>₹{pricePerHour.toFixed(2)}</span>
            </div>

            <div className="h-px bg-slate-850 my-4"></div>

            <div className="flex justify-between items-center text-slate-100 font-bold text-sm">
              <span>Total Payable</span>
              <span className="text-sportsGreen text-base font-black">₹{pricePerHour.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutConfirm}
            disabled={submitting}
            className="w-full btn-neon-green py-3 text-xs font-black shadow-neon-green uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <CreditCard size={14} />
            {submitting ? 'Locking Slot...' : 'Proceed to Payment'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
