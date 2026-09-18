import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

const TurfCard = ({ turf }) => {
  const { id, name, images, location, pricePerHour, rating, amenities } = turf;

  const displayImage = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1540747737956-37872ce3f862?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="glass-card rounded-2xl overflow-hidden glass-card-hover flex flex-col h-full group">
      {/* Visual Header */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 shrink-0">
        <img 
          src={displayImage} 
          alt={name} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#deded5] flex items-center gap-1 shadow-sm">
          <Star size={12} className="text-sportsOrange fill-sportsOrange" />
          <span className="text-[10px] font-extrabold text-slate-100">{Number(rating) > 0 ? Number(rating).toFixed(1) : 'New'}</span>
        </div>
      </div>

      {/* Detail Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location tag */}
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-sportsGreen uppercase tracking-wider mb-1.5">
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
                className="bg-[#f3f4ee] text-slate-500 border border-[#e2e3dc] px-2 py-0.5 rounded-md text-[9px] font-bold"
              >
                {item}
              </span>
            ))}
            {amenities && amenities.length > 3 && (
              <span className="bg-[#f3f4ee] text-slate-500 border border-[#e2e3dc] px-2 py-0.5 rounded-md text-[9px] font-black">
                +{amenities.length - 3} More
              </span>
            )}
          </div>
        </div>

        {/* Action footer */}
        <div className="border-t border-[#e2e3dc] pt-4 flex items-center justify-between gap-4 mt-auto">
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
