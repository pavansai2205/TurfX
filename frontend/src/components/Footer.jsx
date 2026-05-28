import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield, HelpCircle, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-darkBg-deep border-t border-slate-900 pt-16 pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sportsGreen rounded-lg flex items-center justify-center text-slate-950 font-black text-sm">
                T
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-100">
                Turf<span className="text-sportsGreen">X</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's first smart ecosystem providing instant, verified booking for cricket nets, boxes, and full-size arenas. Check availability, pay securely, and hit the pitch.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-4">Discover</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse?location=Mumbai" className="text-slate-400 hover:text-sportsGreen transition-colors">
                  Mumbai Cricket Arenas
                </Link>
              </li>
              <li>
                <Link to="/browse?location=Bangalore" className="text-slate-400 hover:text-sportsGreen transition-colors">
                  Bangalore Nets & Boxes
                </Link>
              </li>
              <li>
                <Link to="/browse?location=Delhi" className="text-slate-400 hover:text-sportsGreen transition-colors">
                  Delhi Floodlight Pitches
                </Link>
              </li>
            </ul>
          </div>

          {/* Stubs for platform help */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-4">Help & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Shield size={12} className="text-sportsGreen" /> 100% Verified Listings
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle size={12} className="text-sportsGreen" /> Refund & Cancellations
              </li>
              <li className="flex items-center gap-2">
                <Info size={12} className="text-sportsGreen" /> AI Smart Match (Beta)
              </li>
            </ul>
          </div>

          {/* Support Contacts */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-4">Connect</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-sportsGreen" /> support@turfx.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-sportsGreen" /> +91 98765 43210
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="text-sportsGreen" /> Churchgate, Mumbai, India
              </li>
            </ul>
          </div>
        </div>

        {/* Lower bar */}
        <div className="border-t border-slate-900/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-semibold">
          <p>© {new Date().getFullYear()} TurfX Network. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <a href="mailto:support@turfx.com" className="hover:text-sportsGreen transition-colors">Contact Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
