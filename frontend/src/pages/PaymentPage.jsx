import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { paymentAPI, getErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CreditCard, ShieldCheck, CheckCircle2, User, Clock, Calendar, Download 
} from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  // API states
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await paymentAPI.getReceipt(bookingId);
        setBooking(res.data);
        if (res.data.payment?.status === 'PAID') {
          setPaymentCompleted(true);
          setReceiptData(res.data);
        }
      } catch (error) {
        toast.error('Failed to locate booking transaction details.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate]);

  const handlePayWithRazorpay = async () => {
    setPaying(true);

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 1. Create order on backend
      const res = await paymentAPI.createOrder({ bookingId });
      const orderData = res.data;

      // 2. Open Razorpay options
      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency || 'INR',
        name: 'TurfX Arena',
        description: `Booking for ${booking.item.turfName}`,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2384cc16"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Cpath d="M8 12a4 4 0 0 1 8 0" stroke="white" stroke-width="2" fill="none"/%3E%3C/svg%3E',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setPaying(true);
            const verifyRes = await paymentAPI.verifyPayment({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success('Payment verified! Slot confirmed.');
              
              // Get receipt
              const receiptRes = await paymentAPI.getReceipt(bookingId);
              setReceiptData(receiptRes.data);
              setPaymentCompleted(true);
            } else {
              toast.error('Cryptographic signature verification failed.');
            }
          } catch (error) {
            toast.error(getErrorMessage(error));
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: booking.customer?.name || '',
          email: booking.customer?.email || '',
          contact: booking.customer?.phone || '',
        },
        theme: {
          color: '#84cc16', // sportsGreen
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            toast.error('Payment checkout closed.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg-deep flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-400 font-bold animate-pulse">
            Loading transaction details... Please wait.
          </p>
        </div>
      </div>
    );
  }

  // SUCCESS COMPLETED RECEIPT SCREEN
  if (paymentCompleted && receiptData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-8 animate-fadeIn printable-area">
        
        {/* Animated Check */}
        <div className="w-20 h-20 bg-sportsGreen/10 border border-sportsGreen/30 rounded-full flex items-center justify-center mx-auto shadow-neon-green pulse-cricket">
          <CheckCircle2 size={44} className="text-sportsGreen" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Booking Confirmed!</h1>
          <p className="text-xs text-slate-400">
            Invoice: <span className="font-bold text-slate-300">{receiptData.receiptId}</span>
          </p>
        </div>

        {/* Printable Ticket receipt */}
        <div className="glass-card text-left p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-sportsGreen/5 rounded-full filter blur-xl"></div>
          
          <h3 className="text-xs font-black uppercase text-sportsGreen tracking-widest border-b border-slate-900 pb-3">
            🏟️ Official Match Ticket
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            {/* Turf */}
            <div className="flex items-start gap-2.5">
              <span className="text-slate-500">Arena:</span>
              <div className="text-slate-200">
                <p className="font-extrabold">{receiptData.item.turfName}</p>
                <p className="text-[10px] text-slate-400 leading-normal">{receiptData.item.address}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2.5">
              <Calendar size={14} className="text-sportsGreen" />
              <span className="text-slate-500">Date:</span>
              <span className="text-slate-200 font-extrabold">{receiptData.bookingDate}</span>
            </div>

            {/* Timings */}
            <div className="flex items-center gap-2.5">
              <Clock size={14} className="text-sportsGreen" />
              <span className="text-slate-500">Timing Slot:</span>
              <span className="text-slate-200 font-extrabold">{receiptData.item.timings}</span>
            </div>

            {/* Captain */}
            <div className="flex items-center gap-2.5">
              <User size={14} className="text-sportsGreen" />
              <span className="text-slate-500">Captain:</span>
              <span className="text-slate-200 font-extrabold">{receiptData.customer.name}</span>
            </div>

            {/* Cost */}
            <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
              <span className="text-slate-500">Gross Price Paid:</span>
              <span className="text-sportsGreen text-sm font-black">₹{receiptData.payment.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 no-print">
          <button 
            onClick={handlePrint}
            className="btn-glass py-2.5 text-xs font-bold flex items-center gap-2"
          >
            <Download size={14} /> Print Receipt
          </button>
          
          <Link to="/dashboard" className="btn-neon-green py-2.5 text-xs font-black">
            Go To My Bookings
          </Link>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-sportsGreen/10 border border-sportsGreen/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sportsGreen shadow-neon-green">
          <CreditCard size={24} />
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Secure Payment Checkout</h1>
        <p className="text-xs text-slate-400">Securely finalize your cricket slot reservation</p>
      </div>

      {/* Ground Booking Summary Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Pitch overlay decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-sportsGreen/5 rounded-full filter blur-xl"></div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-sportsGreen tracking-widest border-b border-slate-900 pb-2.5">
            Booking Details
          </h3>

          <div className="space-y-3.5 text-xs font-semibold">
            {/* Arena Name */}
            <div>
              <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">Arena / Pitch</span>
              <span className="text-slate-200 text-sm font-extrabold">{booking?.item.turfName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
              {/* Date */}
              <div>
                <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">Match Date</span>
                <span className="text-slate-200 font-extrabold">{booking?.bookingDate}</span>
              </div>

              {/* Timing */}
              <div>
                <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">Timing Slot</span>
                <span className="text-slate-200 font-extrabold">{booking?.item.timings}</span>
              </div>
            </div>

            {/* Address */}
            <div className="border-t border-slate-900 pt-3">
              <span className="text-slate-500 uppercase tracking-widest text-[9px] block mb-0.5">Location Address</span>
              <span className="text-slate-350 text-[11px] font-bold leading-normal block">
                {booking?.item.address}, {booking?.item.location}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>Ground Rental fee</span>
            <span>₹{booking?.payment.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>GST / Platform tax</span>
            <span className="text-sportsGreen font-extrabold">FREE</span>
          </div>
          <div className="h-px bg-slate-850 my-1"></div>
          <div className="flex items-center justify-between font-black">
            <span className="text-slate-200">Total Amount Due</span>
            <span className="text-sportsGreen text-base">₹{booking?.payment.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Secure Trust badges */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-bold">
          <span className="flex items-center gap-1">🔒 256-bit SSL</span>
          <span className="flex items-center gap-1">🛡️ Razorpay Secured</span>
          <span className="flex items-center gap-1">⚡ Instant Ticket</span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handlePayWithRazorpay}
          disabled={paying}
          className="w-full btn-neon-green py-3.5 text-xs font-black shadow-neon-green uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <ShieldCheck size={15} />
          {paying ? 'Processing Payment...' : `Pay Securely via Razorpay · ₹${booking?.payment.totalPrice}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
