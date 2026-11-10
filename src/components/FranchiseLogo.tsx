/**
 * WICKET DYNASTY - Centralized Franchise Logo & Crest System
 * Renders authentic, high-definition scalable SVG insignia for all 10 franchises
 * with strict size constraints, responsive containment, and zero layout overflow.
 */
import React from 'react';
import { FRANCHISES } from '../data/franchises';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number | string;

interface FranchiseLogoProps {
  franchiseId: string;
  size?: LogoSize;
  className?: string;
  showBorder?: boolean;
  showBackground?: boolean;
}

// Convert named size or numeric size into strict, bounded pixel dimensions
const parseSizeToPixels = (size: LogoSize): number => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'xs':
      return 20;
    case 'sm':
      return 28;
    case 'md':
      return 36;
    case 'lg':
      return 48;
    case 'xl':
      return 64;
    case '2xl':
      return 84;
    default: {
      const parsed = parseInt(size, 10);
      return !isNaN(parsed) && parsed > 0 ? parsed : 36;
    }
  }
};

export const FranchiseLogo: React.FC<FranchiseLogoProps> = ({
  franchiseId,
  size = 36,
  className = '',
  showBorder = true,
  showBackground = true,
}) => {
  const normId = (franchiseId || '').toUpperCase().trim();
  const franchise = FRANCHISES.find(f => f.id === normId || f.shortName === normId) || FRANCHISES[0];
  const primary = franchise.primaryColor || '#F59E0B';

  const px = parseSizeToPixels(size);

  const renderCrestSvg = () => {
    switch (normId) {
      case 'CSK':
        // Chennai Super Kings - Roaring Lion Crest with Whistle Podu crown & stars
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <defs>
              <linearGradient id="cskGrad_v2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <path d="M50 6 L86 22 L86 58 Q86 84 50 95 Q14 84 14 58 L14 22 Z" fill="#0A1838" stroke="#F59E0B" strokeWidth="3" />
            <path d="M50 18 Q62 26 66 40 Q62 48 56 46 Q58 54 50 56 Q42 54 44 46 Q38 48 34 40 Q38 26 50 18 Z" fill="url(#cskGrad_v2)" />
            <path d="M42 36 L48 42 L42 45 Z" fill="#0A1838" />
            <path d="M58 36 L52 42 L58 45 Z" fill="#0A1838" />
            <circle cx="50" cy="18" r="4" fill="#FDE047" />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="18" fontFamily="sans-serif" letterSpacing="1">
              CSK
            </text>
          </svg>
        );

      case 'MI':
        // Mumbai Indians - Sudarshan Razor Chakra Turbine
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <defs>
              <linearGradient id="miGrad_v2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="#081A38" stroke="#F59E0B" strokeWidth="3" />
            <g fill="#F59E0B">
              <path d="M50 18 Q57 34 50 50 Q43 34 50 18 Z" />
              <path d="M50 82 Q57 66 50 50 Q43 66 50 82 Z" />
              <path d="M18 50 Q34 57 50 50 Q34 43 18 50 Z" />
              <path d="M82 50 Q66 57 50 50 Q66 43 82 50 Z" />
              <circle cx="50" cy="50" r="11" fill="url(#miGrad_v2)" stroke="#FFFFFF" strokeWidth="2" />
            </g>
            <text x="50" y="82" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="16" fontFamily="sans-serif">
              MI
            </text>
          </svg>
        );

      case 'RCB':
      case 'BLR':
        // Royal Challengers Bengaluru - Rampant Red & Gold Lion
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <defs>
              <linearGradient id="rcbGold_v2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <path d="M50 6 L86 22 L86 60 Q86 86 50 95 Q14 86 14 60 L14 22 Z" fill="#991B1B" stroke="#F59E0B" strokeWidth="3" />
            <path d="M50 18 Q60 22 64 34 Q58 38 60 48 Q52 46 50 56 Q48 46 40 48 Q42 38 36 34 Q40 22 50 18 Z" fill="url(#rcbGold_v2)" />
            <circle cx="50" cy="18" r="3" fill="#FFFFFF" />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="18" fontFamily="sans-serif" letterSpacing="0.5">
              RCB
            </text>
          </svg>
        );

      case 'KKR':
        // Kolkata Knight Riders - Golden Knight Helmet & Purple Blazon
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <path d="M50 6 L86 22 L86 62 Q86 88 50 95 Q14 88 14 62 L14 22 Z" fill="#3B0764" stroke="#F59E0B" strokeWidth="3" />
            <path d="M40 28 L60 28 L56 46 L44 46 Z" fill="#F59E0B" />
            <path d="M50 16 L53 28 L47 28 Z" fill="#FDE047" />
            <line x1="44" y1="36" x2="56" y2="36" stroke="#3B0764" strokeWidth="2" />
            <text x="50" y="78" textAnchor="middle" fill="#FDE047" fontWeight="900" fontSize="18" fontFamily="sans-serif">
              KKR
            </text>
          </svg>
        );

      case 'DC':
        // Delhi Capitals - Twin Red Tigers & Blue Shield
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <path d="M50 6 L86 22 L86 62 Q86 88 50 95 Q14 88 14 62 L14 22 Z" fill="#1E3A8A" stroke="#EF4444" strokeWidth="3" />
            <path d="M50 20 L66 42 L56 42 L50 32 L44 42 L34 42 Z" fill="#EF4444" />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="20" fontFamily="sans-serif">
              DC
            </text>
          </svg>
        );

      case 'GT':
        // Gujarat Titans - Lightning Bolt & Obsidian Blue Shield
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <path d="M50 6 L86 22 L86 62 Q86 88 50 95 Q14 88 14 62 L14 22 Z" fill="#0F172A" stroke="#D97706" strokeWidth="3" />
            <polygon points="54,18 42,42 52,42 46,62 60,36 50,36" fill="#F59E0B" />
            <text x="50" y="82" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="18" fontFamily="sans-serif">
              GT
            </text>
          </svg>
        );

      case 'LSG':
        // Lucknow Super Giants - Eagle Wings & Azure Shield
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <path d="M50 6 L86 22 L86 62 Q86 88 50 95 Q14 88 14 62 L14 22 Z" fill="#0284C7" stroke="#F97316" strokeWidth="3" />
            <path d="M50 32 Q65 18 78 28 Q64 36 50 48 Q36 36 22 28 Q35 18 50 32 Z" fill="#F97316" />
            <circle cx="50" cy="38" r="4" fill="#FFFFFF" />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="18" fontFamily="sans-serif">
              LSG
            </text>
          </svg>
        );

      case 'PBKS':
      case 'PUN':
        // Punjab Kings - Crimson Shield & Golden Crown
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <path d="M50 6 L86 22 L86 62 Q86 88 50 95 Q14 88 14 62 L14 22 Z" fill="#991B1B" stroke="#F59E0B" strokeWidth="3" />
            <polygon points="34,36 42,24 50,34 58,24 66,36" fill="#F59E0B" />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="16" fontFamily="sans-serif">
              PBKS
            </text>
          </svg>
        );

      case 'RR':
        // Rajasthan Royals - Royal Pink Shield & Sabres Crown
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <path d="M50 6 L86 22 L86 62 Q86 88 50 95 Q14 88 14 62 L14 22 Z" fill="#DB2777" stroke="#F59E0B" strokeWidth="3" />
            <polygon points="36,36 44,26 50,34 56,26 64,36" fill="#FDE047" />
            <line x1="30" y1="52" x2="70" y2="52" stroke="#FFFFFF" strokeWidth="3" />
            <text x="50" y="78" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="20" fontFamily="sans-serif">
              RR
            </text>
          </svg>
        );

      case 'SRH':
        // Sunrisers Hyderabad - Rising Sun Phoenix
        return (
          <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block max-w-full max-h-full">
            <path d="M50 6 L86 22 L86 62 Q86 88 50 95 Q14 88 14 62 L14 22 Z" fill="#EA580C" stroke="#000000" strokeWidth="3" />
            <path d="M50 48 Q64 30 74 38 Q62 48 50 52 Q38 48 26 38 Q36 30 50 48 Z" fill="#FDE047" />
            <circle cx="50" cy="34" r="8" fill="#000000" />
            <text x="50" y="78" textAnchor="middle" fill="#000000" fontWeight="900" fontSize="18" fontFamily="sans-serif">
              SRH
            </text>
          </svg>
        );

      default:
        return (
          <div
            className="w-full h-full flex items-center justify-center font-black text-white text-xs select-none"
            style={{ backgroundColor: primary }}
          >
            {franchise.shortName}
          </div>
        );
    }
  };

  return (
    <div
      className={`shrink-0 inline-flex items-center justify-center overflow-hidden rounded-xl ${
        showBorder ? 'shadow-md border border-white/20' : ''
      } ${className}`}
      style={{
        width: `${px}px`,
        height: `${px}px`,
        minWidth: `${px}px`,
        minHeight: `${px}px`,
        maxWidth: `${px}px`,
        maxHeight: `${px}px`,
        backgroundColor: showBackground ? `${primary}18` : 'transparent',
      }}
      title={franchise.name}
    >
      {renderCrestSvg()}
    </div>
  );
};
