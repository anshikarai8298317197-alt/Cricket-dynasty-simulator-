/**
 * WICKET DYNASTY - Authoritative 320-Player Master Database
 * Ingested from WICKET_DYNASTY_320_PLAYERS.json
 */
import rawDatabase from './masterDatabase.json';
import { Player, PlayerRole, RatingTier, BattingHand, BowlingType, BowlingArm, BowlingSpeedClass } from '../../types/player';
import { AuctionLot, AuctionSetCategory } from '../../types/auction';

export interface RawPlayerAttributes {
  [key: string]: number;
  batting: number;
  bowling: number;
  fielding: number;
  power: number;
  timing: number;
  technique: number;
  pace: number;
  swing: number;
  seam: number;
  accuracy: number;
  yorker: number;
  bouncer: number;
  slowerBall: number;
  deathBowling: number;
  spinTurn: number;
  flight: number;
  spinControl: number;
  variation: number;
  catching: number;
  throwing: number;
  agility: number;
  reflexes: number;
  keeping: number;
  stamina: number;
  fitness: number;
  temperament: number;
  consistency: number;
  potential: number;
}

export interface RawPlayer {
  id: string;
  name: string;
  country: string | null;
  role: 'BAT' | 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKETKEEPER';
  franchise2026: string | null;
  rosterStatus: string;
  isFictional: boolean;
  sourceStatus: string;
  tier: 'PLATINUM' | 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE';
  overallRating: number;
  age: number | null;
  battingHand: string | null;
  bowlingStyle: string | null;
  attributes: RawPlayerAttributes;
  careerStats: {
    matches: number | null;
    runs: number | null;
    wickets: number | null;
    strikeRate: number | null;
    economy: number | null;
  };
  auctionLotId: string;
}

export interface RawAuctionLot {
  lotId: string;
  playerId: string;
  tier: 'PLATINUM' | 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE';
  category: string;
  basePriceCr: number;
  status: string;
  soldTo: string | null;
  soldPriceCr: number | null;
}

function toRatingTier(tier: string): RatingTier {
  switch (tier.toUpperCase()) {
    case 'PLATINUM': return 'Platinum';
    case 'DIAMOND': return 'Diamond';
    case 'GOLD': return 'Gold';
    case 'SILVER': return 'Silver';
    case 'BRONZE': return 'Bronze';
    default: return 'Silver';
  }
}

function deriveShortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function mapRoleToPrimaryRole(rawRole: string, attr: RawPlayerAttributes): PlayerRole {
  if (rawRole === 'WICKETKEEPER') {
    return 'Wicketkeeper Batter';
  }
  if (rawRole === 'BAT' || rawRole === 'BATTER') {
    return attr.power >= 88 ? 'Opening Batter' : 'Top-order Batter';
  }
  if (rawRole === 'ALL_ROUNDER') {
    return attr.pace > attr.spinTurn ? 'Pace All-rounder' : 'Spin All-rounder';
  }
  // BOWLER
  if (attr.pace > attr.spinTurn) {
    if (attr.pace >= 90) return 'Express Fast Bowler';
    if (attr.deathBowling >= 88) return 'Death-over Specialist';
    return 'Fast Bowler';
  } else {
    return attr.variation >= 85 ? 'Wrist Spinner' : 'Off Spinner';
  }
}

function getBasePrice(tier: string): number {
  switch (tier.toUpperCase()) {
    case 'PLATINUM': return 2.0;
    case 'DIAMOND': return 1.5;
    case 'GOLD': return 1.0;
    case 'SILVER': return 0.5;
    case 'BRONZE': return 0.3;
    default: return 0.5;
  }
}

// Convert all 320 raw players into runtime Player objects
export const MASTER_PLAYERS_LIST: Player[] = (rawDatabase.players as RawPlayer[]).map(p => {
  const ratingTier = toRatingTier(p.tier);
  const basePriceCr = getBasePrice(p.tier);
  const isWicketkeeper = p.role === 'WICKETKEEPER';
  const primaryRole = mapRoleToPrimaryRole(p.role, p.attributes);

  const isBowlerOrAllRounder = p.role === 'BOWLER' || p.role === 'ALL_ROUNDER';
  const isPaceDominant = p.attributes.pace > p.attributes.spinTurn;

  const bowlingType: BowlingType = isBowlerOrAllRounder
    ? (isPaceDominant ? 'Fast' : 'Off Spin')
    : 'None';

  const bowlingArm: BowlingArm = 'Right Arm';

  const bowlingSpeedClass: BowlingSpeedClass = isBowlerOrAllRounder
    ? (p.attributes.pace >= 90
        ? 'Express (145+ km/h)'
        : p.attributes.pace >= 80
        ? 'Fast (138-144 km/h)'
        : 'Medium (120-129 km/h)')
    : 'Non-Bowler';

  const battingHand: BattingHand | null = p.battingHand
    ? (p.battingHand.includes('Left') ? 'Left Hand' : 'Right Hand')
    : null;

  return {
    id: p.id,
    name: p.name,
    shortName: deriveShortName(p.name),
    age: p.age,
    country: p.country,
    nationality: p.country || 'IND',
    isOverseas: false,
    isReal: !p.isFictional,
    isFictional: !!p.isFictional,
    isCapped: p.rosterStatus === 'CURRENT_2026_SQUAD' || p.tier === 'PLATINUM' || p.tier === 'DIAMOND' || p.tier === 'GOLD',
    originalFranchiseId: p.franchise2026 || null,
    franchise2026: p.franchise2026 || null,
    rosterStatus: p.rosterStatus,
    sourceStatus: p.sourceStatus,
    verificationStatus: p.isFictional
      ? 'Fictional Original'
      : p.rosterStatus === 'CURRENT_2026_SQUAD'
      ? 'Official 2026 IPL Pool'
      : 'Verified Domestic / Global',
    
    role: p.role,
    primaryRole,
    secondaryRole: p.role === 'ALL_ROUNDER' ? 'Finisher' : undefined,
    battingHand,
    bowlingStyle: p.bowlingStyle,
    bowlingType,
    bowlingArm,
    bowlingSpeedClass,
    isWicketkeeper,
    
    overallRating: p.overallRating,
    potentialRating: p.attributes.potential,
    tier: p.tier,
    ratingTier,
    currentForm: 80,
    fitness: Math.min(100, Math.max(70, p.attributes.fitness || 85)),
    experience: Math.min(100, Math.max(50, p.overallRating)),
    
    batting: {
      timing: p.attributes.timing,
      power: p.attributes.power,
      technique: p.attributes.technique,
      paceHandling: p.attributes.technique,
      spinHandling: p.attributes.timing,
      finishing: p.attributes.power,
      runningBetweenWickets: p.attributes.agility,
    },
    paceBowling: {
      speed: p.attributes.pace,
      swing: p.attributes.swing,
      seam: p.attributes.seam,
      control: p.attributes.accuracy,
      variations: p.attributes.slowerBall,
      deathBowling: p.attributes.deathBowling,
    },
    spinBowling: {
      turn: p.attributes.spinTurn,
      flight: p.attributes.flight,
      control: p.attributes.spinControl,
      accuracy: p.attributes.accuracy,
      hasSpecialVariation: p.attributes.variation >= 75,
      variationType: p.attributes.variation >= 75 ? 'Googly' : 'None',
    },
    fielding: {
      catching: p.attributes.catching,
      throwing: p.attributes.throwing,
      agility: p.attributes.agility,
      wicketkeeping: p.attributes.keeping,
    },
    mental: {
      consistency: p.attributes.consistency,
      pressureHandling: p.attributes.temperament,
      temperament: p.attributes.temperament,
      leadership: Math.round((p.attributes.temperament + p.overallRating) / 2),
    },
    fitnessAttributes: {
      stamina: p.attributes.stamina,
      recovery: p.attributes.fitness,
      injuryResistance: p.attributes.fitness,
    },
    attributes: p.attributes,
    
    contract: {
      currentFranchiseId: p.franchise2026 || null,
      baseAuctionPriceCr: basePriceCr,
      salaryExpectationCr: Number((basePriceCr * 1.5).toFixed(2)),
      contractStatus: p.franchise2026 ? 'Contracted' : 'Auction Pool',
      seasonsPlayed: 1,
    },
    careerStats: {
      matches: p.careerStats.matches,
      runs: p.careerStats.runs,
      highestScore: null,
      battingAverage: null,
      strikeRate: p.careerStats.strikeRate,
      fifties: null,
      hundreds: null,
      fours: null,
      sixes: null,
      wickets: p.careerStats.wickets,
      bestBowling: null,
      bowlingAverage: null,
      economy: p.careerStats.economy,
      catches: null,
      stumpings: null,
    },
    isRetired: false,
    auctionLotId: p.auctionLotId,
  };
});

// Build map for quick lookups
export const MASTER_PLAYERS_MAP: Record<string, Player> = MASTER_PLAYERS_LIST.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {}
);

/**
 * Build 320 Auction Lots strictly organized by:
 * 1. Platinum (mixed roles)
 * 2. Diamond (BAT, BWL, AR, WK)
 * 3. Gold (BAT, BWL, AR, WK)
 * 4. Silver (BAT, BWL, AR, WK)
 * 5. Bronze (BAT, BWL, AR, WK)
 */
function getRoleRank(cat: string): number {
  if (cat === 'BAT' || cat === 'BATTER') return 1;
  if (cat === 'BOWLER' || cat === 'BWL') return 2;
  if (cat === 'ALL_ROUNDER' || cat === 'AR') return 3;
  if (cat === 'WICKETKEEPER' || cat === 'WK') return 4;
  return 5;
}

function getCategoryDisplayName(cat: string, tier: string): AuctionSetCategory {
  if (tier === 'PLATINUM') return 'Platinum Marquee Pool';
  if (cat === 'BAT' || cat === 'BATTER') return 'Elite Top-order Batters';
  if (cat === 'BOWLER' || cat === 'BWL') return 'Fast Bowlers';
  if (cat === 'ALL_ROUNDER' || cat === 'AR') return 'Batting All-rounders';
  if (cat === 'WICKETKEEPER' || cat === 'WK') return 'Elite Wicketkeepers';
  return 'Middle-order Batters';
}

export function buildAuthoritativeAuctionSchedule(playersPool: Player[] = MASTER_PLAYERS_LIST): AuctionLot[] {
  const poolIds = new Set(playersPool.map(p => p.id));
  const rawLots = (rawDatabase.auctionLots as RawAuctionLot[]).filter(l => poolIds.has(l.playerId));

  const tiers: ('PLATINUM' | 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE')[] = [
    'PLATINUM',
    'DIAMOND',
    'GOLD',
    'SILVER',
    'BRONZE',
  ];

  const orderedLots: AuctionLot[] = [];
  let lotCounter = 1;

  for (const t of tiers) {
    const tierLots = rawLots.filter(l => l.tier === t);
    let sortedTierLots = [...tierLots];

    if (t !== 'PLATINUM') {
      // Sort Diamond, Gold, Silver, Bronze by:
      // 1. Role: BAT (1), BWL (2), AR (3), WK (4)
      // 2. Player OVR descending
      sortedTierLots.sort((a, b) => {
        const rankA = getRoleRank(a.category);
        const rankB = getRoleRank(b.category);
        if (rankA !== rankB) return rankA - rankB;
        const pA = MASTER_PLAYERS_MAP[a.playerId];
        const pB = MASTER_PLAYERS_MAP[b.playerId];
        return (pB ? pB.overallRating : 0) - (pA ? pA.overallRating : 0);
      });
    }

    for (const lot of sortedTierLots) {
      const player = MASTER_PLAYERS_MAP[lot.playerId];
      if (!player) continue;

      orderedLots.push({
        lotNumber: lotCounter++,
        player,
        category: getCategoryDisplayName(lot.category, t),
        tier: toRatingTier(t),
        basePriceCr: lot.basePriceCr,
        currentBidCr: lot.basePriceCr,
        currentHighestBidderId: null,
        status: 'PENDING',
        bidHistory: [],
      });
    }
  }

  return orderedLots;
}

export const MASTER_AUCTION_LOTS: AuctionLot[] = buildAuthoritativeAuctionSchedule(MASTER_PLAYERS_LIST);
