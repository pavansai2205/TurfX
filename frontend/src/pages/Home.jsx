import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import TurfCard from '../components/TurfCard';
import { CardSkeleton } from '../components/LoadingSpinner';
import { turfAPI, aiAPI } from '../services/api';
import { Sparkles, ArrowRight, MessageSquare, Send, Award, Zap, Smile } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [topTurfs, setTopTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! Tell me your city, budget, or match time and I will help you find a turf.", isAi: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchTopTurfs = async () => {
      try {
        const res = await turfAPI.getAll({ limit: 3 });
        setTopTurfs(res.data.turfs);
      } catch (error) {
        console.error('Failed to load featured turfs:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopTurfs();
  }, []);

  const handleSearchSubmit = ({ search, location }) => {
    let url = '/browse';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (location) params.push(`location=${encodeURIComponent(location)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    navigate(url);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { text: userMsg, isAi: false }]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await aiAPI.chatbot(userMsg);
      setMessages(prev => [...prev, { text: res.data.reply, isAi: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "I'm having trouble matching that request. Feel free to explore our browse page directly!", isAi: true }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20 relative">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden min-h-[76vh] flex flex-col items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-green-50 via-white to-slate-50">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-green-100 text-sportsGreen px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles size={12} /> Easy cricket turf booking
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-slate-100">
            Book a cricket turf <br />
            <span className="text-sportsGreen font-black">without the hassle</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Find nearby grounds, check available slots, pay securely, and keep all your bookings in one simple dashboard.
          </p>

          {/* Search bar inside container */}
          <div className="pt-4">
            <SearchBar onSearch={handleSearchSubmit} />
          </div>

          {/* Core CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/browse" className="btn-neon-green">
              Book a Turf <ArrowRight size={16} />
            </Link>
            <button 
              onClick={() => setChatOpen(true)}
              className="btn-glass hover:text-sportsGreen"
            >
              <MessageSquare size={16} /> Need Help?
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS & FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 bg-sportsGreen/10 rounded-2xl flex items-center justify-center text-sportsGreen shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Quick Slot Booking</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Pick a date and hour, confirm your slot, and see it instantly in your booking list.
              </p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 bg-sportsGreen/10 rounded-2xl flex items-center justify-center text-sportsGreen shrink-0">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Student-Friendly Prices</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Compare turfs by city, price, rating, and facilities before you book.
              </p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 bg-sportsGreen/10 rounded-2xl flex items-center justify-center text-sportsGreen shrink-0">
              <Smile size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-1">Simple Receipts</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Pay online, view your receipt, and manage cancellations from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED TURFS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
              Popular <span className="text-sportsGreen">Turfs</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Good picks for college matches, practice sessions, and weekend games.
            </p>
          </div>
          <Link to="/browse" className="text-sportsGreen hover:text-sportsGreen-light text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            View All Turfs <ArrowRight size={12} />
          </Link>
        </div>

        {/* Dynamic List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(null).map((_, idx) => <CardSkeleton key={idx} />)
          ) : topTurfs.length > 0 ? (
            topTurfs.map((turf) => (
              <TurfCard key={turf.id} turf={turf} />
            ))
          ) : (
            <div className="col-span-full glass-card p-12 text-center rounded-3xl border border-slate-800">
              <p className="text-slate-400 font-bold mb-3">No turf listings currently seeded in database.</p>
              <Link to="/register" className="btn-neon-green inline-block py-2 px-6">
                Register as Owner & List Turf
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. REAL-TIME AI FLOATING CHATBOX */}
      {chatOpen ? (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 w-[90vw] sm:w-[380px] h-[450px] glass-card border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="bg-darkBg-accent px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-sportsGreen rounded-full pulse-cricket"></div>
              <div>
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest">TurfX AI Assistant</h4>
                <p className="text-[10px] text-slate-400">Online & ready to recommend</p>
              </div>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-xs font-bold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl"
            >
              Close
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 darkScrollbar bg-darkBg-deep/40">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.isAi 
                    ? 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none font-medium' 
                    : 'bg-sportsGreen text-slate-950 font-bold rounded-tr-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-850 text-slate-550 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs animate-pulse">
                  AI is typing...
                </div>
              </div>
            )}
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSendMessage} className="p-3 bg-darkBg-accent border-t border-slate-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask about price, pitches, rules..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sportsGreen focus:ring-0 placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              className="bg-sportsGreen hover:bg-sportsGreen-light text-slate-950 p-2.5 rounded-xl transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setChatOpen(true)}
          className="hidden sm:flex fixed bottom-6 right-6 w-14 h-14 bg-sportsGreen hover:bg-sportsGreen-dark text-white rounded-2xl items-center justify-center shadow-xl hover:scale-105 transition-all z-50"
          title="Open AI Chatbot"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default Home;
