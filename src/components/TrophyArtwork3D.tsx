/**
 * WICKET DYNASTY - 3D-Style Custom Metallic Trophy SVG Artwork
 * Renders bespoke silverware visuals for Domestic League Cups, Global Champions League Crown, and Locked silhouettes.
 */
import React from 'react';

export type TrophyVariant = 'GCL_CUP' | 'IPL_CUP' | 'DOMESTIC_CUP' | 'SEASON_CROWN';

interface TrophyArtwork3DProps {
  variant?: TrophyVariant;
  size?: number;
  locked?: boolean;
  yearLabel?: string | number;
  className?: string;
}

export const TrophyArtwork3D: React.FC<TrophyArtwork3DProps> = ({
  variant = 'DOMESTIC_CUP',
  size = 84,
  locked = false,
  yearLabel,
  className = '',
}) => {
  const uid = `${variant}_${locked ? 'lk' : 'un'}_${size}`;

  const primaryStops = locked
    ? ['#334155', '#1E293B', '#0F172A']
    : variant === 'GCL_CUP'
    ? ['#E0F2FE', '#38BDF8', '#0284C7']
    : variant === 'IPL_CUP'
    ? ['#FEF08A', '#FBBF24', '#B45309']
    : variant === 'SEASON_CROWN'
    ? ['#FDE68A', '#F59E0B', '#92400E']
    : ['#E2E8F0', '#94A3B8', '#475569'];

  const rimColor = locked ? '#475569' : variant === 'GCL_CUP' ? '#7DD3FC' : '#FDE047';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%" className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]">
        <defs>
          <linearGradient id={`cup_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryStops[0]} />
            <stop offset="48%" stopColor={primaryStops[1]} />
            <stop offset="100%" stopColor={primaryStops[2]} />
          </linearGradient>
          <linearGradient id={`base_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#090E1A" />
          </linearGradient>
        </defs>

        {/* Radial Glow Halo behind Trophy */}
        {!locked && (
          <circle
            cx="60"
            cy="46"
            r="38"
            fill={variant === 'GCL_CUP' ? '#38BDF8' : '#FBBF24'}
            opacity="0.12"
          />
        )}

        {/* Handles */}
        <path
          d="M36 28 C16 26, 16 54, 38 56"
          fill="none"
          stroke={`url(#cup_${uid})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M84 28 C104 26, 104 54, 82 56"
          fill="none"
          stroke={`url(#cup_${uid})`}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Cup Body */}
        {variant === 'GCL_CUP' ? (
          <>
            {/* Globe Sphere Crown */}
            <circle cx="60" cy="30" r="18" fill={`url(#cup_${uid})`} stroke={rimColor} strokeWidth="2" />
            <ellipse cx="60" cy="30" rx="8" ry="18" fill="none" stroke="#0C1425" strokeWidth="1.5" opacity="0.45" />
            <line x1="42" y1="30" x2="78" y2="30" stroke="#0C1425" strokeWidth="1.5" opacity="0.45" />
            {/* Pedestal Pillars */}
            <path d="M44 46 L52 72 L68 72 L76 46 Z" fill={`url(#cup_${uid})`} stroke={rimColor} strokeWidth="1.5" />
          </>
        ) : (
          <>
            <path
              d="M34 20 L86 20 L81 50 Q78 68 60 72 Q42 68 39 50 Z"
              fill={`url(#cup_${uid})`}
              stroke={rimColor}
              strokeWidth="2"
            />
            {/* Metallic Specular Highlight */}
            <path
              d="M42 25 L50 25 L48 56 Q44 50 42 25 Z"
              fill="#FFFFFF"
              opacity={locked ? 0.08 : 0.35}
            />
            {/* Rim Lip */}
            <ellipse cx="60" cy="20" rx="26" ry="4.5" fill={rimColor} opacity={locked ? 0.4 : 0.9} />
          </>
        )}

        {/* Stem */}
        <rect x="55" y="70" width="10" height="16" rx="2" fill={`url(#cup_${uid})`} />
        <ellipse cx="60" cy="86" rx="16" ry="4" fill={rimColor} opacity={locked ? 0.35 : 0.85} />

        {/* Engraved Pedestal */}
        <path d="M36 88 L84 88 L90 108 L30 108 Z" fill={`url(#base_${uid})`} stroke={rimColor} strokeWidth="1.5" />
        <rect x="40" y="93" width="40" height="10" rx="2" fill={locked ? '#1E293B' : '#F59E0B'} opacity={locked ? 0.5 : 0.22} />
        <text
          x="60"
          y="101"
          textAnchor="middle"
          fill={locked ? '#64748B' : '#FDE047'}
          fontWeight="900"
          fontSize="7.5"
          fontFamily="monospace"
        >
          {yearLabel ? String(yearLabel) : variant === 'GCL_CUP' ? 'WORLD' : 'CHAMP'}
        </text>
      </svg>
    </div>
  );
};
