import React from 'react';

interface VehicleIconProps {
  type: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const VehicleIcon: React.FC<VehicleIconProps> = ({ 
  type, 
  className = '', 
  size = 'md' 
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const normalized = type.toLowerCase();

  // Sedan (5 Seater)
  if (normalized.includes('sedan') || normalized.includes('5')) {
    return (
      <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="sedanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <path d="M16 38L24 24H42L50 38H16Z" fill="url(#glassGrad)" />
          <path d="M26 26L22 36H31V26H26Z" fill="#1e293b" />
          <path d="M33 26V36H44L40 26H33Z" fill="#1e293b" />
          <path d="M8 38C8 35 11 34 14 34H52C55 34 58 35 58 38L60 45C60 47 58 48 56 48H10C8 48 6 47 6 45L8 38Z" fill="url(#sedanGrad)" />
          <ellipse cx="56" cy="40" rx="3" ry="2" fill="#fed7aa" />
          <rect x="7" y="39" width="3" height="3" rx="1" fill="#ef4444" />
          <circle cx="18" cy="48" r="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="18" cy="48" r="2.5" fill="#f97316" />
          <circle cx="48" cy="48" r="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="48" cy="48" r="2.5" fill="#f97316" />
        </svg>
      </div>
    );
  }

  // SUV (6 Seater)
  if (normalized.includes('suv') || normalized.includes('6')) {
    return (
      <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="suvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="suvGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
          <path d="M12 22H46L54 36H8L12 22Z" fill="url(#suvGlass)" />
          <path d="M15 24H26V34H11L15 24Z" fill="#1e293b" />
          <path d="M28 24H39V34H28V24Z" fill="#1e293b" />
          <path d="M41 24H45L51 34H41V24Z" fill="#1e293b" />
          {/* Roof rack */}
          <line x1="16" y1="20" x2="44" y2="20" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 36C7 33 10 32 13 32H54C57 32 60 33 60 36L61 45C61 47 59 48 57 48H9C7 48 5 47 5 45L7 36Z" fill="url(#suvGrad)" />
          <ellipse cx="58" cy="38" rx="2.5" ry="2" fill="#fef08a" />
          <rect x="6" y="37" width="3" height="4" rx="1" fill="#ef4444" />
          <circle cx="17" cy="48" r="6.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="17" cy="48" r="2.5" fill="#0284c7" />
          <circle cx="49" cy="48" r="6.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="49" cy="48" r="2.5" fill="#0284c7" />
        </svg>
      </div>
    );
  }

  // Traveller (14 & 17 Seater)
  if (normalized.includes('traveller') || normalized.includes('14') || normalized.includes('17')) {
    return (
      <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="vanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <linearGradient id="vanGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <path d="M10 20H48L56 34H6L10 20Z" fill="url(#vanGlass)" />
          {/* Windows */}
          <rect x="10" y="22" width="7" height="10" rx="1" fill="#1e293b" />
          <rect x="19" y="22" width="7" height="10" rx="1" fill="#1e293b" />
          <rect x="28" y="22" width="7" height="10" rx="1" fill="#1e293b" />
          <rect x="37" y="22" width="7" height="10" rx="1" fill="#1e293b" />
          <path d="M46 22H48L53 32H46V22Z" fill="#1e293b" />
          <path d="M6 34H56C58.5 34 61 35.5 61 38L61 46C61 48 59 49 57 49H7C5 49 4 48 4 46L5 38C5 35.5 5 34 6 34Z" fill="url(#vanGrad)" />
          <ellipse cx="58" cy="38" rx="2.5" ry="2" fill="#fef08a" />
          <circle cx="16" cy="49" r="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="16" cy="49" r="2.5" fill="#8b5cf6" />
          <circle cx="48" cy="49" r="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="48" cy="49" r="2.5" fill="#8b5cf6" />
        </svg>
      </div>
    );
  }

  // Mini Bus (20 Seater)
  return (
    <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <rect x="6" y="18" width="52" height="16" rx="3" fill="#cbd5e1" />
        {/* Coach Windows */}
        <rect x="8" y="20" width="7" height="10" rx="1" fill="#1e293b" />
        <rect x="17" y="20" width="7" height="10" rx="1" fill="#1e293b" />
        <rect x="26" y="20" width="7" height="10" rx="1" fill="#1e293b" />
        <rect x="35" y="20" width="7" height="10" rx="1" fill="#1e293b" />
        <rect x="44" y="20" width="10" height="10" rx="1" fill="#1e293b" />
        <path d="M5 34H59C60.5 34 61 35 61 37L61 46C61 48 59 49 57 49H7C5 49 4 48 4 46L4 37C4 35 4.5 34 5 34Z" fill="url(#busGrad)" />
        <ellipse cx="58" cy="38" rx="2" ry="2" fill="#fef08a" />
        <rect x="5" y="37" width="2" height="4" rx="1" fill="#ef4444" />
        <circle cx="16" cy="49" r="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="16" cy="49" r="2" fill="#10b981" />
        <circle cx="48" cy="49" r="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="48" cy="49" r="2" fill="#10b981" />
      </svg>
    </div>
  );
};
