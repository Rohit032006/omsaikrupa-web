import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark' }) => {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  const iconSizes = { sm: 36, md: 48, lg: 64 };
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const subtextColor = variant === 'light' ? 'text-orange-200' : 'text-orange-600';

  return (
    <div className="flex items-center gap-3">
      <div 
        className="relative group transition-all duration-300 hover:scale-105" 
        style={{ width: iconSizes[size], height: iconSizes[size] }}
      >
        <svg 
          viewBox="0 0 64 64" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full drop-shadow-lg"
        >
          <defs>
            <linearGradient id="oskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="oskShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Premium Crest Shield Container */}
          <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#oskGrad)" />
          <rect x="5.5" y="5.5" width="53" height="53" rx="14.5" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />

          {/* Aerodynamic Speed Lines */}
          <path d="M12 18H28L24 21H12V18Z" fill="white" fillOpacity="0.25" />
          <path d="M9 24H22L18 27H9V24Z" fill="white" fillOpacity="0.18" />

          {/* Sleek Aerodynamic Cabin / Windshield */}
          <path
            d="M19 35L26 23H38L45 35H19Z"
            fill="url(#oskShine)"
          />
          {/* Glass Tint / Window Pillars */}
          <path d="M26.5 25L22 34H30.5V25H26.5Z" fill="#0f172a" fillOpacity="0.8" />
          <path d="M32.5 25V34H42L37.5 25H32.5Z" fill="#0f172a" fillOpacity="0.8" />

          {/* Executive Car Body Shell */}
          <path
            d="M13 35C13 33.5 14.5 32 16.5 32H47.5C49.5 32 51 33.5 51 35L52.5 40.5C52.5 41.5 51.5 42.5 50 42.5H14C12.5 42.5 11.5 41.5 11.5 40.5L13 35Z"
            fill="#ffffff"
          />

          {/* Dynamic Xenon Headlights */}
          <ellipse cx="49" cy="37" rx="2.5" ry="1.5" fill="#38bdf8" />
          <path d="M50 37L59 34V40L50 37Z" fill="url(#accentGlow)" fillOpacity="0.6" />

          {/* Tail Light Strip */}
          <rect x="12" y="36" width="2" height="3" rx="1" fill="#ef4444" />

          {/* Chrome Alloy Wheels */}
          <circle cx="21" cy="43" r="5.5" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1.5" />
          <circle cx="21" cy="43" r="2" fill="#ea580c" />
          
          <circle cx="43" cy="43" r="5.5" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1.5" />
          <circle cx="43" cy="43" r="2" fill="#ea580c" />

          {/* Gold Horizon Line */}
          <path d="M8 50H56" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeDasharray="32 8" />
        </svg>
      </div>
      <div>
        <div className={`${sizes[size]} font-extrabold tracking-tight ${textColor} leading-none`}>
          Om Sai Krupa
        </div>
        {size !== 'sm' && (
          <div className={`text-[10px] sm:text-xs font-bold ${subtextColor} uppercase tracking-[0.18em] mt-1 flex items-center gap-1.5`}>
            <span>Vehicle Booking</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        )}
      </div>
    </div>
  );
};
