import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  Check,
  Clock,
  Edit3,
  ImagePlus,
  IndianRupee,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, getErrorMessage, turfAPI, uploadAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  name: '',
  description: '',
  location: 'Mumbai',
  address: '',
  pricePerHour: '',
  amenities: '',
  imageUrl: '',
};

const statusStyles = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200 font-bold',
  COMPLETED: 'bg-sky-50 text-sky-700 border-sky-200 font-bold',
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const slotLabel = (booking) =>
  booking?.slot ? `${booking.slot.startTime} - ${booking.slot.endTime}` : 'Slot unavailable';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTurfId, setEditingTurfId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('OPEN');
  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async ({ silent = false } = {}) => {
    if (!user?.id) return;
    if (!silent) setRefreshing(true);

    try {
      const [turfRes, bookingRes] = await Promise.all([
        turfAPI.getAll({ ownerId: user.id, limit: 100 }),
        bookingAPI.getOwnerLedgers(),
      ]);

      setTurfs(Array.isArray(turfRes.data?.turfs) ? turfRes.data.turfs : []);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ silent: true });
  }, [user?.id]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingTurfId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setFormData(emptyForm);
    setEditingTurfId(null);
    setShowForm(true);
  };

  const openEditForm = (turf) => {
    setFormData({
      name: turf.name || '',
      description: turf.description || '',
      location: turf.location || 'Mumbai',
      address: turf.address || '',
      pricePerHour: turf.pricePerHour || '',
      amenities: Array.isArray(turf.amenities) ? turf.amenities.join(', ') : '',
      imageUrl: Array.isArray(turf.images) ? turf.images[0] || '' : '',
    });
    setEditingTurfId(turf.id);
    setShowForm(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please upload an image under 5MB.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await uploadAPI.uploadImage(reader.result);
        setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
        toast.success('Turf image uploaded.');
      } catch (error) {
        toast.error('Image upload failed. You can paste an image URL instead.');
      } finally {
        setUploadingImage(false);
      }
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.address.trim() || !formData.pricePerHour) {
      toast.error('Please complete all required fields.');
      return;
    }

    const pricePerHour = Number(formData.pricePerHour);
    if (!Number.isFinite(pricePerHour) || pricePerHour < 100) {
      toast.error('Hourly price must be at least ₹100.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      location: formData.location,
      address: formData.address.trim(),
      pricePerHour,
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      amenities: formData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setFormLoading(true);
    try {
      if (editingTurfId) {
        await turfAPI.update(editingTurfId, payload);
        toast.success('Turf listing updated.');
      } else {
        await turfAPI.create(payload);
        toast.success('Turf listed successfully. Slots were generated automatically.');
      }

      resetForm();
      await fetchData({ silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTurf = async (turf) => {
    if (!window.confirm(`Delete ${turf.name}? Existing bookings for this turf will also be removed.`)) return;

    setActionId(turf.id);
    try {
      await turfAPI.delete(turf.id);
      toast.success('Turf listing deleted.');
      await fetchData({ silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const handleUpdateBooking = async (booking, status) => {
    const label = status === 'CONFIRMED' ? 'confirm' : status === 'COMPLETED' ? 'mark complete' : 'cancel';
    if (status === 'CANCELLED' && !window.confirm(`Cancel booking for ${booking.user?.name || 'this player'}?`)) {
      return;
    }

    setActionId(booking.id);
    try {
      await bookingAPI.updateStatus(booking.id, status);
      toast.success(`Booking ${label} action completed.`);
      await fetchData({ silent: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const stats = useMemo(() => {
    const paidOrConfirmed = bookings.filter(
      (booking) => booking.paymentStatus === 'PAID' || booking.bookingStatus === 'CONFIRMED'
    );

    return {
      earnings: paidOrConfirmed.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
      activeListings: turfs.length,
      openBookings: bookings.filter((booking) => ['PENDING', 'CONFIRMED'].includes(booking.bookingStatus)).length,
      pendingBookings: bookings.filter((booking) => booking.bookingStatus === 'PENDING').length,
    };
  }, [bookings, turfs]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'ALL') return bookings;
    if (bookingFilter === 'OPEN') {
      return bookings.filter((booking) => ['PENDING', 'CONFIRMED'].includes(booking.bookingStatus));
    }
    return bookings.filter((booking) => booking.bookingStatus === bookingFilter);
  }, [bookingFilter, bookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sportsGreen/30 bg-sportsGreen/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sportsGreen">
            <Layers size={13} />
            Owner Dashboard
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Manage your turf business
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Publish grounds, update listing details, review player bookings, and keep slot status accurate.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => fetchData()}
            disabled={refreshing}
            className="btn-glass py-2.5 px-4 text-xs font-bold hover:border-sportsGreen/50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button type="button" onClick={openCreateForm} className="btn-neon-green py-2.5 px-5 text-xs font-black">
            <Plus size={15} />
            Add Turf
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Estimated revenue" value={currency.format(stats.earnings)} />
        <StatCard icon={Layers} label="Active listings" value={stats.activeListings} accent="text-sportsGreen" />
        <StatCard icon={Calendar} label="Open bookings" value={stats.openBookings} />
        <StatCard icon={Users} label="Needs approval" value={stats.pendingBookings} accent="text-sportsOrange" />
      </section>

      {showForm && (() => {
        const activeAmenities = formData.amenities 
          ? formData.amenities.split(',').map(item => item.trim()).filter(Boolean) 
          : [];
        
        const STANDARD_AMENITIES_LIST = [
          'Floodlights', 'Changing Rooms', 'Drinking Water', 'Spectator Stand', 
          'Sports Cafe', 'Equipment Rental', 'Free Parking', 'Locker Rooms'
        ];

        const handleAmenityBadgeToggle = (item) => {
          let updated = [...activeAmenities];
          if (updated.includes(item)) {
            updated = updated.filter(a => a !== item);
          } else {
            updated.push(item);
          }
          setFormData(prev => ({ ...prev, amenities: updated.join(', ') }));
        };

        return (
          <section className="glass-card rounded-3xl border border-sportsGreen/30 p-6 sm:p-8 shadow-xl space-y-8 bg-white animate-slideDown">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                  🏟️ {editingTurfId ? 'Update Pitch Parameters' : 'Publish New Cricket Turf'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Fill in parameters to instantly publish the arena and auto-generate hourly timing sheets.
                </p>
              </div>
              <button 
                type="button" 
                onClick={resetForm} 
                className="btn-glass self-start py-2 px-4 text-xs font-bold hover:border-slate-400"
              >
                <X size={14} /> Close Editor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 text-xs font-semibold">
              
              {/* SECTION 1: BASIC DEMOGRAPHICS */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-sportsGreen font-black border-b border-slate-200 pb-2">
                  1. Basic Turf Parameters
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-slate-600 uppercase tracking-wider block">Turf Ground Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sportsGreen focus:ring-2 focus:ring-sportsGreen/20 transition-all"
                      placeholder="E.g. Wankhede Nets Arena"
                    />
                  </div>

                  {/* Location City */}
                  <div className="space-y-1.5">
                    <label className="text-slate-600 uppercase tracking-wider block">City Location *</label>
                    <select
                      value={formData.location}
                      onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 cursor-pointer focus:bg-white focus:outline-none focus:border-sportsGreen focus:ring-2 focus:ring-sportsGreen/20"
                    >
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Pune">Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>

                  {/* Hourly rent */}
                  <div className="space-y-1.5">
                    <label className="text-slate-600 uppercase tracking-wider block">Price Per Hour (₹ INR) *</label>
                    <input
                      type="number"
                      min="100"
                      required
                      value={formData.pricePerHour}
                      onChange={(event) => setFormData((prev) => ({ ...prev, pricePerHour: event.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sportsGreen focus:ring-2 focus:ring-sportsGreen/20 transition-all"
                      placeholder="E.g. 1200"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PHOTOS & LOCATION ADDRESS */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs uppercase tracking-wider text-sportsGreen font-black border-b border-slate-200 pb-2">
                  2. Media & Physical Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Photo details & file selector */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-600 uppercase tracking-wider block">Ground Banner Photo</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(event) => setFormData((prev) => ({ ...prev, imageUrl: event.target.value }))}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sportsGreen"
                          placeholder="https://images.unsplash.com/... or upload local"
                        />
                        <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-3 rounded-xl cursor-pointer text-slate-700 hover:text-sportsGreen flex items-center justify-center gap-1.5 shrink-0 transition-colors">
                          {uploadingImage ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                          <span>Upload File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            disabled={uploadingImage} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>

                    {/* Physical Street address */}
                    <div className="space-y-1.5">
                      <label className="text-slate-600 uppercase tracking-wider block">Physical Street Address *</label>
                      <textarea
                        required
                        rows="3"
                        value={formData.address}
                        onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sportsGreen resize-none"
                        placeholder="Street details, landmarks, postcode details..."
                      />
                    </div>
                  </div>

                  {/* Photo Visual Preview Frame */}
                  <div className="md:col-span-5 flex flex-col justify-center">
                    <span className="text-slate-500 uppercase tracking-wider block mb-2 text-[10px]">Photo Banner Preview</span>
                    <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
                      {formData.imageUrl.trim() ? (
                        <>
                          <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="h-full w-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                            className="absolute top-2 right-2 bg-white/90 p-2 rounded-xl text-slate-600 hover:text-red-600 border border-slate-200 shadow-sm"
                            title="Remove Photo"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4 space-y-1.5 text-slate-400">
                          <p className="text-lg">🏏</p>
                          <p className="text-[10px]">Image preview will load here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: AMENITIES & DESCRIPTION */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs uppercase tracking-wider text-sportsGreen font-black border-b border-slate-200 pb-2">
                  3. Pitch Specs & Click-to-Select Amenities
                </h3>

                {/* Clickable Amenities Badges Grid */}
                <div className="space-y-2">
                  <label className="text-slate-600 uppercase tracking-wider block">Pitch Amenities (Select All That Apply)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STANDARD_AMENITIES_LIST.map((item) => {
                      const isSelected = activeAmenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleAmenityBadgeToggle(item)}
                          className={`p-3 rounded-xl border text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            isSelected 
                              ? 'bg-sportsGreen/10 border-sportsGreen text-sportsGreen shadow-sm font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                          }`}
                        >
                          <span>🏏</span>
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Pitch Description */}
                <div className="space-y-1.5">
                  <label className="text-slate-600 uppercase tracking-wider block">Ground / Pitch Description *</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sportsGreen resize-none"
                    placeholder="Provide grass blade specifications, pitch dimensions, standard boundaries, security policies, cafe timings..."
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="btn-glass py-2.5 px-6 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading} 
                  className="btn-neon-green py-2.5 px-8 font-black"
                >
                  {formLoading ? 'Saving changes...' : editingTurfId ? 'Update Pitch listing' : 'Publish Ground listing'}
                </button>
              </div>

            </form>
          </section>
        );
      })()}

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 glass-card rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <PanelHeader title="Your turf listings" subtitle={`${turfs.length} listing${turfs.length === 1 ? '' : 's'} live`} />

          {turfs.length > 0 ? (
            <div className="p-4 space-y-4">
              {turfs.map((turf) => (
                <TurfListing
                  key={turf.id}
                  turf={turf}
                  disabled={actionId === turf.id}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTurf}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={ImagePlus}
              title="No turfs listed yet"
              body="Add your first turf to start receiving slot bookings."
              action={<button type="button" onClick={openCreateForm} className="btn-neon-green mx-auto mt-4 py-2.5 px-5 text-xs font-black">Add Turf</button>}
            />
          )}
        </div>

        <div className="xl:col-span-7 glass-card rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Booking requests</h2>
              <p className="mt-1 text-xs text-slate-500">Approve, complete, or cancel player reservations.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {['OPEN', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'ALL'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setBookingFilter(filter)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    bookingFilter === filter
                      ? 'border-sportsGreen bg-sportsGreen text-white font-black shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {filter.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <BookingRequest
                  key={booking.id}
                  booking={booking}
                  disabled={actionId === booking.id}
                  onUpdate={handleUpdateBooking}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Calendar}
              title="No bookings in this view"
              body="New requests will appear here when players reserve your turf slots."
            />
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent = 'text-slate-900' }) => (
  <div className="glass-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        <p className={`mt-2 text-2xl font-black ${accent}`}>{value}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-emerald-50 p-2.5 text-sportsGreen">
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const PanelHeader = ({ title, subtitle }) => (
  <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
    <h2 className="text-base font-black text-slate-900">{title}</h2>
    <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
      statusStyles[status] || statusStyles.PENDING
    }`}
  >
    {status}
  </span>
);

const TurfListing = ({ turf, disabled, onEdit, onDelete }) => {
  const image = Array.isArray(turf.images) && turf.images.length > 0 ? turf.images[0] : null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:border-slate-300 transition-all">
      <div className="flex gap-4">
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {image ? (
            <img src={image} alt={turf.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImagePlus size={22} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black text-slate-900">{turf.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <MapPin size={12} />
            {turf.location}
          </p>
          <p className="mt-2 text-sm font-black text-sportsGreen">{currency.format(Number(turf.pricePerHour || 0))}/hr</p>
        </div>
      </div>

      {Array.isArray(turf.amenities) && turf.amenities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {turf.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 shadow-2xs">
              {amenity}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Link to={`/turfs/${turf.id}`} className="btn-glass py-2 px-3 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50">
          View
        </Link>
        <button type="button" onClick={() => onEdit(turf)} className="btn-glass py-2 px-3 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50">
          <Edit3 size={12} />
          Edit
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(turf)}
          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </article>
  );
};

const BookingRequest = ({ booking, disabled, onUpdate }) => (
  <article className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-slate-900">{booking.user?.name || 'Player'}</h3>
          <StatusBadge status={booking.bookingStatus} />
        </div>
        <p className="mt-1 text-xs text-slate-500">{booking.user?.email || 'No email'}{booking.user?.phone ? ` · ${booking.user.phone}` : ''}</p>
        <p className="mt-2 text-sm font-bold text-slate-700">{booking.turf?.name || 'Deleted turf'}</p>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 text-xs">
        <InfoPill icon={Calendar} value={formatDate(booking.bookingDate)} />
        <InfoPill icon={Clock} value={slotLabel(booking)} />
        <InfoPill icon={IndianRupee} value={currency.format(Number(booking.totalPrice || 0))} />
      </div>
    </div>

    <div className="mt-4 flex flex-wrap justify-end gap-2">
      {booking.bookingStatus === 'PENDING' && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdate(booking, 'CONFIRMED')}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={12} />
          Approve
        </button>
      )}

      {booking.bookingStatus === 'CONFIRMED' && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdate(booking, 'COMPLETED')}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-black text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={12} />
          Complete
        </button>
      )}

      {['PENDING', 'CONFIRMED'].includes(booking.bookingStatus) && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdate(booking, 'CANCELLED')}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={12} />
          Cancel
        </button>
      )}
    </div>
  </article>
);

const InfoPill = ({ icon: Icon, value }) => (
  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-700">
    <Icon size={13} className="text-sportsGreen" />
    {value}
  </span>
);

const EmptyPanel = ({ icon: Icon, title, body, action }) => (
  <div className="px-6 py-14 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sportsGreen">
      <Icon size={26} />
    </div>
    <h3 className="text-lg font-black text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{body}</p>
    {action}
  </div>
);

export default OwnerDashboard;

