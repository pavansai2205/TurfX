import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { turfAPI, bookingAPI, reviewAPI, getErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MapPin, Star, Calendar, Clock, Sparkles, MessageSquare, Award, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const TurfDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // API states
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsData, setSlotsData] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Selector states
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activePhoto, setActivePhoto] = useState('');

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch primary details
  const fetchTurfDetails = async () => {
    try {
      const res = await turfAPI.getById(id);
      setTurf(res.data);
      if (res.data.images && res.data.images.length > 0) {
        setActivePhoto(res.data.images[0]);
      }
    } catch (error) {
      toast.error('Failed to locate turf details profile.');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfDetails();
  }, [id]);

  // Fetch slots whenever date selector changes
  useEffect(() => {
    const fetchSlotsAvailability = async () => {
      setSlotsLoading(true);
      try {
        const res = await bookingAPI.getAvailability(id, selectedDate);
        setSlotsData(res.data.slots);
      } catch (error) {
        console.error('Failed to check slot availability:', error.message);
      } finally {
        setSlotsLoading(false);
      }
    };

    if (turf) {
      fetchSlotsAvailability();
    }
  }, [selectedDate, turf?.id]);

  // Action: Select Slot
  const handleSlotSelect = (slot) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to reserve booking slots!');
      navigate('/login', { state: { from: { pathname: `/turfs/${id}` } } });
      return;
    }

    if (slot.isBooked) return;

    // Direct to Checkout Page with params
    navigate(`/bookings/checkout?turfId=${id}&slotId=${slot.id}&date=${selectedDate}`);
  };

  // Action: Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Review comment cannot be empty.');
      return;
    }

    setReviewLoading(true);
    try {
      await reviewAPI.create({
        turfId: id,
        rating: newRating,
        comment: newComment
      });
      toast.success('Thank you for rating this arena!');
      setNewComment('');
      setNewRating(5);
      // Reload details to display recalculations
      await fetchTurfDetails();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg-deep flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. TURF TOP HEADER GALLERY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pictures Gallery (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg">
            <img 
              src={activePhoto || 'https://images.unsplash.com/photo-1540747737956-37872ce3f862?w=800&auto=format&fit=crop&q=80'} 
              alt={turf.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 right-6 bg-darkBg-deep/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-850 flex items-center gap-1.5 shadow-xl">
              <Star size={16} className="text-sportsGreen fill-sportsGreen" />
              <span className="text-sm font-black text-slate-100">{turf.rating > 0 ? turf.rating.toFixed(1) : 'New'}</span>
            </div>
          </div>

          {/* Sub Thumbnails */}
          {turf.images && turf.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1 darkScrollbar">
              {turf.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 transition-all ${
                    activePhoto === img 
                      ? 'border-sportsGreen shadow-neon-green scale-95' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info Header Card (Right 5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1 bg-sportsGreen/10 border border-sportsGreen/30 text-sportsGreen px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Award size={10} /> Verified Arena
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
              {turf.name}
            </h1>

            <div className="flex items-start gap-2 text-slate-400 text-xs sm:text-sm">
              <MapPin size={16} className="text-sportsGreen shrink-0 mt-0.5" />
              <p>{turf.address}</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {turf.description}
            </p>
          </div>

          <div className="border-t border-slate-900 pt-6 flex items-center justify-between gap-4 mt-6">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price per hour</p>
              <p className="text-2xl font-black text-slate-100">₹{turf.pricePerHour}</p>
            </div>
            <a 
              href="#timings-picker" 
              className="btn-neon-green py-3 px-8 text-xs font-black shadow-md rounded-xl"
            >
              Select Timings Slot
            </a>
          </div>
        </div>
      </div>

      {/* 2. AMENITIES */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
          <Sparkles size={18} className="text-sportsGreen" /> Pitch Amenities
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
          {turf.amenities && turf.amenities.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-center text-xs font-bold text-slate-300"
            >
              🏏 {item}
            </div>
          ))}
        </div>
      </section>

      {/* 3. DYNAMIC SLOT SELECTOR TIMINGS GRID */}
      <section id="timings-picker" className="grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-24">
        
        {/* Left Timing calendar input (Left 4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-slate-800 h-fit space-y-6 shadow-lg">
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            <Calendar size={18} className="text-sportsGreen" /> 1. Pick Playing Date
          </h3>
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Reservation Date</label>
            <input 
              type="date" 
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]} // Block previous days
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs font-bold text-slate-200 cursor-pointer focus:outline-none focus:border-sportsGreen focus:ring-0"
            />
          </div>
          <div className="bg-sportsGreen/5 border border-sportsGreen/20 p-4 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-400 leading-relaxed font-semibold">
            <AlertTriangle size={14} className="text-sportsGreen shrink-0 mt-0.5" />
            <p>Select your preferred hour slot. Unlocked green boxes are available. Grey blocks indicate slots already locked by other teams.</p>
          </div>
        </div>

        {/* Hourly Slot Grid (Right 8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-lg">
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            <Clock size={18} className="text-sportsGreen" /> 2. Choose Hourly Slot
          </h3>

          {slotsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8">
              {Array(8).fill(null).map((_, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-850 h-14 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : slotsData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {slotsData.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={slot.isBooked}
                  className={`p-3 rounded-2xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                    slot.isBooked 
                      ? 'bg-slate-900/60 border-slate-850 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:border-sportsGreen hover:bg-sportsGreen/10 hover:shadow-neon-green active:scale-95'
                  }`}
                >
                  <span>{slot.startTime} - {slot.endTime}</span>
                  <span className={`text-[9px] uppercase tracking-wider ${slot.isBooked ? 'text-slate-650' : 'text-sportsGreen font-black'}`}>
                    {slot.isBooked ? 'Booked' : 'Available'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-bold text-sm">
              No hourly timings defined for this turf listing.
            </div>
          )}
        </div>
      </section>

      {/* 4. REVIEWS & FEEDBACK PANEL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-900 pt-10">
        
        {/* Write a Review (Left 4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-slate-800 h-fit space-y-6 shadow-lg">
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            <MessageSquare size={18} className="text-sportsGreen" /> Submit Feedback
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Stars selection */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="text-2xl transition-transform active:scale-90"
                    >
                      <Star 
                        size={24} 
                        className={star <= newRating ? 'text-sportsGreen fill-sportsGreen' : 'text-slate-700'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Comment</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Share your batting/bowling slot experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sportsGreen focus:ring-0"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={reviewLoading}
                className="w-full btn-neon-green text-xs py-2.5"
              >
                {reviewLoading ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 bg-slate-900/40 rounded-2xl border border-slate-855 space-y-3 p-4">
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Only authenticated cricket players can post verified reviews.
              </p>
              <Link to="/login" className="btn-glass py-2 text-xs font-bold inline-block">
                Sign In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Reviews Feed (Right 8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-lg">
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            ⭐ Reviews Feed ({turf.reviews?.length || 0})
          </h3>

          {turf.reviews && turf.reviews.length > 0 ? (
            <div className="space-y-6 divide-y divide-slate-900">
              {turf.reviews.map((review) => (
                <div key={review.id} className="pt-6 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={review.user?.profileImage || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                        alt="" 
                        className="w-8 h-8 rounded-full border border-slate-800 object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{review.user?.name}</h4>
                        <p className="text-[9px] text-slate-500 font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {Array(5).fill(null).map((_, idx) => (
                        <Star 
                          key={idx} 
                          size={12} 
                          className={idx < review.rating ? 'text-sportsGreen fill-sportsGreen' : 'text-slate-800'} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-11 font-medium">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-bold text-xs">
              No review posts left for this turf ground yet. Be the first to play and rate!
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default TurfDetails;
