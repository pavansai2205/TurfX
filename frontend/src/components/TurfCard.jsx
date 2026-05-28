import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

const TurfCard = ({ turf }) => {
  const { id, name, images, location, pricePerHour, rating, amenities } = turf;

  const displayImage = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1540747737956-37872ce3f862?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="glass-card rounded-2xl overflow-hidden glass-card-hover border border-slate-800 flex flex-col h-full shadow-sm group">
      {/* Visual Header */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 shrink-0">
        <img 
          src={displayImage} 
          alt={name} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1 shadow-sm">
          <Star size={12} className="text-sportsGreen fill-sportsGreen" />
          <span className="text-[10px] font-extrabold text-slate-100">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
        </div>
      </div>

      {/* Detail Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location tag */}
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-sportsGreen uppercase tracking-widest mb-1.5">
            <MapPin size={10} /> {location}
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-100 leading-tight mb-2 group-hover:text-sportsGreen transition-colors">
            {name}
          </h3>

          {/* Amenities sublist */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities && amenities.slice(0, 3).map((item, idx) => (
              <span 
                key={idx} 
                className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-bold"
              >
                {item}
              </span>
            ))}
            {amenities && amenities.length > 3 && (
              <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-black">
                +{amenities.length - 3} More
              </span>
            )}
          </div>
        </div>

        {/* Action footer */}
        <div className="border-t border-slate-900/60 pt-4 flex items-center justify-between gap-4 mt-auto">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Price per hour</p>
            <p className="text-base font-black text-slate-100">
              ₹{pricePerHour}
            </p>
          </div>

          <Link
            to={`/turfs/${id}`} 
            className="btn-neon-green py-2 px-4 rounded-xl text-xs font-extrabold hover:shadow-none"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TurfCard;
