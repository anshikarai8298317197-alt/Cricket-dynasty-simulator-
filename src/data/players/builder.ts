/**
 * WICKET DYNASTY - Player Data Builder Utility
 * Guarantees role-specific attribute matrices and calculated ratings
 */
import {
  Player,
  PlayerRole,
  BattingHand,
  BowlingType,
  BowlingArm,
  BowlingSpeedClass,
  RatingTier,
} from '../../types/player';

export interface PlayerInput {
  id: string;
  name: string;
  shortName: string;
  age: number;
  nationality: string;
  isOverseas: boolean;
  isReal: boolean;
  isCapped: boolean;
  originalFranchiseId: string | null;
  primaryRole: PlayerRole;
  secondaryRole?: string;
  battingHand: BattingHand;
  bowlingType: BowlingType;
  bowlingArm: BowlingArm;
  bowlingSpeedClass: BowlingSpeedClass;
  isWicketkeeper: boolean;
  overallRating: number;
  potentialRating: number;
  baseAuctionPriceCr: number;
  salaryExpectationCr: number;
  
  // Custom skill hints (1-99)
  battingSkill: number;
  powerSkill: number;
  bowlingSkill?: number;
  fieldingSkill: number;
  experience: number;
  
  // Specific stats
  stats: {
    matches: number;
    runs: number;
    highestScore: number;
    battingAverage: number;
    strikeRate: number;
    wickets: number;
    bestBowling: string;
    economy: number;
  };
}

export function createPlayer(input: PlayerInput): Player {
  const isPace = input.bowlingType.includes('Fast') || input.bowlingType.includes('Medium');
  const isSpin = input.bowlingType.includes('Spin') || input.bowlingType.includes('Orthodox');
  const isBowlerOrAllRounder = input.primaryRole.includes('Bowler') || input.primaryRole.includes('All-rounder') || input.primaryRole.includes('Specialist');
  
  // Determine rating tier
  let ratingTier: RatingTier = 'Bronze';
  if (input.overallRating >= 90) ratingTier = 'Diamond';
  else if (input.overallRating >= 82) ratingTier = 'Gold';
  else if (input.overallRating >= 74) ratingTier = 'Silver';

  // Batting attributes
  const b = input.battingSkill;
  const p = input.powerSkill;
  const batting = {
    timing: Math.min(99, Math.max(40, b + Math.floor((p - b) * 0.2))),
    power: Math.min(99, Math.max(35, p)),
    technique: Math.min(99, Math.max(40, b + (input.isCapped ? 4 : 0))),
    paceHandling: Math.min(99, Math.max(38, b + (p > b ? 2 : -2))),
    spinHandling: Math.min(99, Math.max(38, b + (input.nationality === 'IND' ? 5 : -2))),
    finishing: input.primaryRole.includes('Finisher') ? Math.min(99, p + 6) : Math.min(99, Math.max(35, Math.floor((b + p) / 2))),
    runningBetweenWickets: Math.min(99, Math.max(50, 95 - Math.max(0, input.age - 26) * 2)),
  };

  // Pace Bowling attributes
  const bowlVal = input.bowlingSkill ?? (isBowlerOrAllRounder ? Math.max(65, input.overallRating - 5) : 35);
  let paceBowling = undefined;
  if (isPace && isBowlerOrAllRounder) {
    paceBowling = {
      speed: input.bowlingSpeedClass.includes('Express') ? Math.min(99, Math.max(88, bowlVal + 4)) : Math.min(92, Math.max(60, bowlVal - 2)),
      swing: Math.min(99, Math.max(55, bowlVal + (input.primaryRole.includes('Swing') ? 8 : 0))),
      seam: Math.min(99, Math.max(55, bowlVal)),
      control: Math.min(99, Math.max(50, bowlVal - (input.isCapped ? 0 : 5))),
      variations: Math.min(99, Math.max(50, bowlVal + (input.primaryRole.includes('Death') ? 7 : 0))),
      deathBowling: Math.min(99, Math.max(45, bowlVal + (input.primaryRole.includes('Death') ? 10 : -4))),
    };
  }

  // Spin Bowling attributes
  let spinBowling = undefined;
  if (isSpin && isBowlerOrAllRounder) {
    const isWrist = input.bowlingType.includes('Leg') || input.bowlingType.includes('Wrist');
    spinBowling = {
      turn: Math.min(99, Math.max(55, bowlVal + (isWrist ? 6 : 0))),
      flight: Math.min(99, Math.max(50, bowlVal + 2)),
      control: Math.min(99, Math.max(50, bowlVal + (isWrist ? -3 : 4))),
      accuracy: Math.min(99, Math.max(50, bowlVal + (input.isCapped ? 3 : -3))),
      hasSpecialVariation: isWrist || bowlVal > 78,
      variationType: (isWrist ? 'Googly' : (bowlVal > 80 ? 'Carrom Ball' : 'Arm Ball')) as 'Googly' | 'Carrom Ball' | 'Arm Ball',
    };
  }

  // Fielding attributes
  const f = input.fieldingSkill;
  const fielding = {
    catching: Math.min(99, Math.max(45, f)),
    throwing: Math.min(99, Math.max(45, f + 2)),
    agility: Math.min(99, Math.max(45, f - Math.max(0, input.age - 30) * 2)),
    wicketkeeping: input.isWicketkeeper ? Math.min(99, Math.max(75, f + 8)) : undefined,
  };

  // Mental attributes
  const mental = {
    consistency: Math.min(99, Math.max(45, input.overallRating - (input.isCapped ? 2 : 10))),
    pressureHandling: Math.min(99, Math.max(40, input.overallRating - (input.age < 22 ? 8 : 0))),
    temperament: Math.min(99, Math.max(50, 75 + (input.isCapped ? 10 : 0))),
    leadership: Math.min(99, Math.max(40, Math.floor(input.experience * 0.8) + (input.age > 30 ? 15 : 0))),
  };

  // Fitness attributes
  const fitnessAttributes = {
    stamina: Math.min(99, Math.max(60, 95 - Math.max(0, input.age - 28) * 2)),
    recovery: Math.min(99, Math.max(55, 92 - Math.max(0, input.age - 27) * 2)),
    injuryResistance: Math.min(99, Math.max(50, 88 - (input.bowlingSpeedClass.includes('Express') ? 8 : 0))),
  };

  return {
    id: input.id,
    name: input.name,
    shortName: input.shortName,
    age: input.age,
    nationality: input.nationality,
    isOverseas: input.isOverseas,
    isReal: input.isReal,
    isCapped: input.isCapped,
    originalFranchiseId: input.originalFranchiseId,
    verificationStatus: input.isReal ? 'Official 2026 IPL Pool' : 'Fictional Original',
    primaryRole: input.primaryRole,
    secondaryRole: input.secondaryRole,
    battingHand: input.battingHand,
    bowlingType: input.bowlingType,
    bowlingArm: input.bowlingArm,
    bowlingSpeedClass: input.bowlingSpeedClass,
    isWicketkeeper: input.isWicketkeeper,
    overallRating: input.overallRating,
    potentialRating: input.potentialRating,
    ratingTier,
    currentForm: Math.floor(75 + (input.overallRating % 15)),
    fitness: 100,
    experience: input.experience,
    batting,
    paceBowling,
    spinBowling,
    fielding,
    mental,
    fitnessAttributes,
    contract: {
      currentFranchiseId: input.originalFranchiseId,
      baseAuctionPriceCr: input.baseAuctionPriceCr,
      salaryExpectationCr: input.salaryExpectationCr,
      contractStatus: input.originalFranchiseId ? 'Contracted' : 'Auction Pool',
      seasonsPlayed: Math.max(1, input.age - 19),
    },
    careerStats: {
      matches: input.stats.matches,
      runs: input.stats.runs,
      highestScore: input.stats.highestScore,
      battingAverage: input.stats.battingAverage,
      strikeRate: input.stats.strikeRate,
      fifties: Math.floor(input.stats.runs / 380),
      hundreds: Math.floor(input.stats.runs / 1800),
      fours: Math.floor(input.stats.runs * 0.1),
      sixes: Math.floor(input.stats.runs * 0.04),
      wickets: input.stats.wickets,
      bestBowling: input.stats.bestBowling,
      bowlingAverage: input.stats.wickets > 0 ? 24.5 : 0,
      economy: input.stats.economy,
      catches: Math.floor(input.stats.matches * 0.4),
      stumpings: input.isWicketkeeper ? Math.floor(input.stats.matches * 0.12) : 0,
    },
    isRetired: false,
  };
}
