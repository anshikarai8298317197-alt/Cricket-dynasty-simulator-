/**
 * WICKET DYNASTY - Persistent Role-Based Player Avatar Service
 * Deterministically assigns and permanently persists a role-appropriate circular
 * 3D-style SVG cricket portrait variant per player.id (localStorage + IndexedDB).
 */
import { Player } from '../types/player';

export type AvatarRoleArchetype =
  | 'BATTER'
  | 'PACE_BOWLER'
  | 'SPIN_BOWLER'
  | 'ALL_ROUNDER'
  | 'WICKETKEEPER';

export interface PlayerAvatarProfile {
  playerId: string;
  archetype: AvatarRoleArchetype;
  variantIndex: number; // 0..4 (5 distinct variants per role)
  skinTone: string;
  skinShadow: string;
  hairStyle: 'SHORT_CROP' | 'UNDERCUT' | 'SWEPT' | 'CAP' | 'HELMET';
  hairColor: string;
  facialHair: 'NONE' | 'STUBBLE' | 'BEARD' | 'MUSTACHE';
  accentGear: 'BAT_HELMET' | 'PACE_SWEATBAND' | 'SPIN_SUNGLASSES' | 'AR_COLLAR' | 'WK_GLOVES_VISOR';
  bgGradStart: string;
  bgGradEnd: string;
}

const STORAGE_KEY = 'wicket_dynasty_player_avatars_v1';

const SKIN_PALETTES = [
  { tone: '#D99B72', shadow: '#A86E49' },
  { tone: '#C6865B', shadow: '#945B37' },
  { tone: '#B17049', shadow: '#804A2B' },
  { tone: '#E8B898', shadow: '#B88362' },
  { tone: '#925838', shadow: '#63371F' },
];

const HAIR_COLORS = ['#18181B', '#27201B', '#111827', '#3B281E', '#0F172A'];

const ROLE_BG: Record<AvatarRoleArchetype, [string, string][]> = {
  BATTER: [
    ['#1E3A8A', '#0F172A'],
    ['#1D4ED8', '#0C1A3D'],
    ['#0F4C81', '#091529'],
    ['#2563EB', '#101D3D'],
    ['#1E40AF', '#0B132B'],
  ],
  PACE_BOWLER: [
    ['#991B1B', '#1F0B10'],
    ['#B91C1C', '#1A0B14'],
    ['#7F1D1D', '#0F172A'],
    ['#9F1239', '#190B1A'],
    ['#C2410C', '#1C0D08'],
  ],
  SPIN_BOWLER: [
    ['#065F46', '#061B1A'],
    ['#0F766E', '#081D21'],
    ['#047857', '#091B1B'],
    ['#115E59', '#0B1722'],
    ['#15803D', '#0A1A14'],
  ],
  ALL_ROUNDER: [
    ['#6D28D9', '#150C2B'],
    ['#7C3AED', '#1A0D33'],
    ['#5B21B6', '#100924'],
    ['#9333EA', '#1D0C2E'],
    ['#4338CA', '#0D1029'],
  ],
  WICKETKEEPER: [
    ['#B45309', '#1E1106'],
    ['#D97706', '#1F1207'],
    ['#92400E', '#170E07'],
    ['#CA8A04', '#1A1305'],
    ['#A16207', '#181006'],
  ],
};

function hashPlayerId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function resolveRoleArchetype(player: Player): AvatarRoleArchetype {
  const rawRole = (player.role || '').toUpperCase();
  const primary = (player.primaryRole || '').toLowerCase();

  if (player.isWicketkeeper || rawRole === 'WICKETKEEPER' || primary.includes('wicketkeeper')) {
    return 'WICKETKEEPER';
  }
  if (rawRole === 'ALL_ROUNDER' || primary.includes('all-rounder')) {
    return 'ALL_ROUNDER';
  }
  if (rawRole === 'BOWLER' || primary.includes('bowler') || primary.includes('spinner') || primary.includes('specialist')) {
    const spinScore = player.spinBowling ? Math.max(player.spinBowling.turn, player.spinBowling.control) : 0;
    const paceScore = player.paceBowling ? Math.max(player.paceBowling.speed, player.paceBowling.seam) : 0;
    const isSpin =
      primary.includes('spin') ||
      player.bowlingType?.toLowerCase().includes('spin') ||
      (spinScore > paceScore + 4 && !primary.includes('fast') && !primary.includes('pace'));
    return isSpin ? 'SPIN_BOWLER' : 'PACE_BOWLER';
  }
  return 'BATTER';
}

export class PlayerAvatarService {
  private static cache: Record<string, PlayerAvatarProfile> | null = null;
  private static persistCallback: ((profile: PlayerAvatarProfile) => void) | null = null;

  static registerPersistHook(cb: (profile: PlayerAvatarProfile) => void) {
    this.persistCallback = cb;
  }

  static hydrateCache(records: PlayerAvatarProfile[]) {
    const map = this.loadCache();
    let changed = false;
    for (const r of records) {
      if (r && r.playerId && !map[r.playerId]) {
        map[r.playerId] = r;
        changed = true;
      }
    }
    if (changed) {
      this.saveCache(map);
    }
  }

  private static loadCache(): Record<string, PlayerAvatarProfile> {
    if (this.cache) return this.cache;
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.cache = JSON.parse(raw);
          return this.cache!;
        }
      }
    } catch {
      // Fallback to in-memory cache
    }
    this.cache = {};
    return this.cache;
  }

  private static saveCache(map: Record<string, PlayerAvatarProfile>) {
    this.cache = map;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      }
    } catch {
      // Ignore quota errors cleanly
    }
  }

  static getOrCreateAvatar(player: Player): PlayerAvatarProfile {
    const map = this.loadCache();
    const existing = map[player.id];
    const archetype = resolveRoleArchetype(player);

    if (existing && existing.archetype === archetype) {
      return existing;
    }

    const h = hashPlayerId(`${player.id}_${player.name}`);
    const variantIndex = h % 5;
    const skin = SKIN_PALETTES[(h >>> 3) % SKIN_PALETTES.length];
    const hairColor = HAIR_COLORS[(h >>> 6) % HAIR_COLORS.length];
    const bgPair = ROLE_BG[archetype][variantIndex];

    const hairPool: PlayerAvatarProfile['hairStyle'][] =
      archetype === 'BATTER'
        ? ['HELMET', 'SHORT_CROP', 'SWEPT', 'UNDERCUT', 'CAP']
        : archetype === 'WICKETKEEPER'
        ? ['HELMET', 'CAP', 'SHORT_CROP', 'UNDERCUT', 'SWEPT']
        : archetype === 'SPIN_BOWLER'
        ? ['CAP', 'SWEPT', 'SHORT_CROP', 'UNDERCUT', 'CAP']
        : ['UNDERCUT', 'SHORT_CROP', 'SWEPT', 'CAP', 'SHORT_CROP'];

    const facialPool: PlayerAvatarProfile['facialHair'][] = ['STUBBLE', 'BEARD', 'NONE', 'MUSTACHE', 'STUBBLE'];

    const accentGear: PlayerAvatarProfile['accentGear'] =
      archetype === 'BATTER'
        ? 'BAT_HELMET'
        : archetype === 'PACE_BOWLER'
        ? 'PACE_SWEATBAND'
        : archetype === 'SPIN_BOWLER'
        ? 'SPIN_SUNGLASSES'
        : archetype === 'ALL_ROUNDER'
        ? 'AR_COLLAR'
        : 'WK_GLOVES_VISOR';

    const profile: PlayerAvatarProfile = {
      playerId: player.id,
      archetype,
      variantIndex,
      skinTone: skin.tone,
      skinShadow: skin.shadow,
      hairStyle: hairPool[variantIndex],
      hairColor,
      facialHair: facialPool[(h >>> 9) % facialPool.length],
      accentGear,
      bgGradStart: bgPair[0],
      bgGradEnd: bgPair[1],
    };

    map[player.id] = profile;
    this.saveCache(map);
    if (this.persistCallback) {
      this.persistCallback(profile);
    }

    return profile;
  }

  static getAllCached(): Record<string, PlayerAvatarProfile> {
    return { ...this.loadCache() };
  }
}
