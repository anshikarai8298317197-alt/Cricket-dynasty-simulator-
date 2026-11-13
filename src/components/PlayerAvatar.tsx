/**
 * WICKET DYNASTY - Circular 3D-Style SVG Cricket Player Avatar
 * Renders a shaded, high-contrast circular portrait matched to the player's role
 * and permanently bound to player.id via PlayerAvatarService.
 */
import React, { useMemo } from 'react';
import { Player } from '../types/player';
import { PlayerAvatarService } from '../services/playerAvatarService';

interface PlayerAvatarProps {
  player: Player;
  size?: number;
  className?: string;
  jerseyColor?: string;
  showRoleBadge?: boolean;
  badgeText?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 44,
  className = '',
  jerseyColor,
  showRoleBadge = false,
  badgeText,
}) => {
  const profile = useMemo(() => PlayerAvatarService.getOrCreateAvatar(player), [player]);

  const roleShort =
    profile.archetype === 'WICKETKEEPER'
      ? 'WK'
      : profile.archetype === 'ALL_ROUNDER'
      ? 'AR'
      : profile.archetype === 'SPIN_BOWLER'
      ? 'SPN'
      : profile.archetype === 'PACE_BOWLER'
      ? 'PAC'
      : 'BAT';

  const roleColor =
    profile.archetype === 'WICKETKEEPER'
      ? '#F59E0B'
      : profile.archetype === 'ALL_ROUNDER'
      ? '#A855F7'
      : profile.archetype === 'SPIN_BOWLER'
      ? '#10B981'
      : profile.archetype === 'PACE_BOWLER'
      ? '#EF4444'
      : '#3B82F6';

  const shirtColor = jerseyColor || roleColor;
  const uid = `av_${player.id.replace(/[^a-zA-Z0-9]/g, '')}_${profile.variantIndex}`;

  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center rounded-full select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      title={`${player.name} (${player.primaryRole})`}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="rounded-full overflow-hidden block shadow-md"
      >
        <defs>
          <radialGradient id={`${uid}_bg`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={profile.bgGradStart} />
            <stop offset="100%" stopColor={profile.bgGradEnd} />
          </radialGradient>
          <linearGradient id={`${uid}_skin`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={profile.skinTone} />
            <stop offset="100%" stopColor={profile.skinShadow} />
          </linearGradient>
          <linearGradient id={`${uid}_jersey`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={shirtColor} />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <clipPath id={`${uid}_clip`}>
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${uid}_clip)`}>
          {/* 3D radial stadium aura background */}
          <circle cx="50" cy="50" r="49" fill={`url(#${uid}_bg)`} />
          <ellipse cx="32" cy="24" rx="28" ry="18" fill="#FFFFFF" opacity="0.08" />

          {/* Subtle role-specific stadium watermark */}
          {profile.archetype === 'BATTER' && (
            <rect x="74" y="20" width="6" height="36" rx="2" transform="rotate(18 77 38)" fill="#FDE047" opacity="0.16" />
          )}
          {profile.archetype === 'PACE_BOWLER' && (
            <circle cx="76" cy="30" r="9" fill="#EF4444" opacity="0.22" />
          )}
          {profile.archetype === 'SPIN_BOWLER' && (
            <path d="M18 32 Q28 20 38 30" stroke="#34D399" strokeWidth="2.5" fill="none" opacity="0.3" />
          )}

          {/* Shoulders & Jersey */}
          <path d="M16 98 Q22 72 50 72 Q78 72 84 98 Z" fill={`url(#${uid}_jersey)`} />
          <path d="M36 74 L50 86 L64 74" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.45" />

          {/* Neck shadow */}
          <rect x="43" y="61" width="14" height="15" rx="5" fill={profile.skinShadow} />

          {/* Ears */}
          <ellipse cx="31" cy="50" rx="3.5" ry="5.5" fill={profile.skinShadow} />
          <ellipse cx="69" cy="50" rx="3.5" ry="5.5" fill={profile.skinShadow} />

          {/* 3D shaded head */}
          <path
            d="M32 45 C32 28, 68 28, 68 45 C68 60, 61 68, 50 68 C39 68, 32 60, 32 45 Z"
            fill={`url(#${uid}_skin)`}
          />

          {/* Facial highlight */}
          <ellipse cx="44" cy="43" rx="6" ry="8" fill="#FFFFFF" opacity="0.08" />

          {/* Facial Hair variants */}
          {profile.facialHair === 'BEARD' && (
            <path
              d="M34 51 C34 62, 41 68, 50 68 C59 68, 66 62, 66 51 C63 56, 56 58, 50 58 C44 58, 37 56, 34 51 Z"
              fill={profile.hairColor}
              opacity="0.88"
            />
          )}
          {profile.facialHair === 'STUBBLE' && (
            <path
              d="M36 53 C37 62, 43 66, 50 66 C57 66, 63 62, 64 53 C60 58, 55 59, 50 59 C45 59, 40 58, 36 53 Z"
              fill={profile.hairColor}
              opacity="0.32"
            />
          )}
          {profile.facialHair === 'MUSTACHE' && (
            <path d="M43 56 Q50 53 57 56 Q50 58 43 56 Z" fill={profile.hairColor} opacity="0.85" />
          )}

          {/* Eyes & Brows */}
          <path d="M38 43 Q42 40.5 46 42.5" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M54 42.5 Q58 40.5 62 43" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {profile.accentGear === 'SPIN_SUNGLASSES' && profile.variantIndex % 2 === 0 ? (
            <g>
              <rect x="36.5" y="44" width="11.5" height="6.5" rx="2.5" fill="#0F172A" stroke="#34D399" strokeWidth="1.2" />
              <rect x="52" y="44" width="11.5" height="6.5" rx="2.5" fill="#0F172A" stroke="#34D399" strokeWidth="1.2" />
              <line x1="48" y1="46.5" x2="52" y2="46.5" stroke="#34D399" strokeWidth="1.3" />
            </g>
          ) : (
            <g>
              <circle cx="42" cy="47" r="2.2" fill="#111827" />
              <circle cx="58" cy="47" r="2.2" fill="#111827" />
              <circle cx="42.7" cy="46.3" r="0.7" fill="#FFFFFF" />
              <circle cx="58.7" cy="46.3" r="0.7" fill="#FFFFFF" />
            </g>
          )}

          {/* Mouth */}
          <path d="M45 60 Q50 62.5 55 60" stroke="#7C2D12" strokeWidth="1.6" strokeLinecap="round" fill="none" />

          {/* Headgear / Hair */}
          {profile.hairStyle === 'HELMET' ? (
            <g>
              <path d="M29 44 C29 22, 71 22, 71 44 L67 42 C65 32, 35 32, 33 42 Z" fill={shirtColor} stroke="#F59E0B" strokeWidth="1.8" />
              <path d="M31 38 L69 38" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
              {profile.archetype === 'BATTER' && (
                <path d="M34 49 L34 61 Q50 66 66 61 L66 49" fill="none" stroke="#94A3B8" strokeWidth="1.3" opacity="0.65" />
              )}
            </g>
          ) : profile.hairStyle === 'CAP' ? (
            <g>
              <path d="M31 40 C31 24, 69 24, 69 40 Z" fill={shirtColor} />
              <path d="M29 38 Q50 32 75 40 Q52 38 29 38 Z" fill="#F59E0B" />
            </g>
          ) : profile.hairStyle === 'SWEPT' ? (
            <path
              d="M31 44 C29 26, 46 21, 56 23 C67 24, 71 33, 68 44 C64 34, 52 30, 38 35 C34 37, 32 40, 31 44 Z"
              fill={profile.hairColor}
            />
          ) : profile.hairStyle === 'UNDERCUT' ? (
            <path
              d="M32 41 C32 24, 68 23, 68 41 C63 32, 54 30, 44 31 C38 32, 34 36, 32 41 Z"
              fill={profile.hairColor}
            />
          ) : (
            <path
              d="M32 42 C32 25, 68 25, 68 42 C62 33, 38 33, 32 42 Z"
              fill={profile.hairColor}
            />
          )}

          {/* Pace Bowler Sweatband */}
          {profile.accentGear === 'PACE_SWEATBAND' && profile.hairStyle !== 'HELMET' && (
            <path d="M33 36 Q50 33 67 36" stroke="#F8FAFC" strokeWidth="2.5" fill="none" opacity="0.85" />
          )}
        </g>

        {/* Outer metallic ring */}
        <circle cx="50" cy="50" r="47.5" fill="none" stroke={roleColor} strokeWidth="3" opacity="0.85" />
      </svg>

      {(badgeText || showRoleBadge) && (
        <span
          className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#080E1A] border text-[8px] font-black uppercase tracking-tight shadow-md"
          style={{
            borderColor: badgeText ? '#F59E0B' : roleColor,
            color: badgeText ? '#FCD34D' : '#F8FAFC',
          }}
        >
          {badgeText || roleShort}
        </span>
      )}
    </div>
  );
};
