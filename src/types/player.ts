/**
 * WICKET DYNASTY - Player & Franchise TypeScript Definitions
 * Phase 01 Architecture
 */

export type PlayerRole =
  | 'Opening Batter'
  | 'Top-order Batter'
  | 'Middle-order Batter'
  | 'Finisher'
  | 'Wicketkeeper Batter'
  | 'Batting All-rounder'
  | 'Bowling All-rounder'
  | 'Pace All-rounder'
  | 'Spin All-rounder'
  | 'Express Fast Bowler'
  | 'Fast Bowler'
  | 'Fast-Medium Bowler'
  | 'Swing Bowler'
  | 'Death-over Specialist'
  | 'Leg Spinner'
  | 'Off Spinner'
  | 'Left-arm Orthodox Spinner'
  | 'Wrist Spinner';

export type BattingHand = 'Right Hand' | 'Left Hand';

export type BowlingArm = 'Right Arm' | 'Left Arm' | 'None';

export type BowlingType =
  | 'Fast'
  | 'Fast-Medium'
  | 'Medium'
  | 'Off Spin'
  | 'Leg Spin'
  | 'Left-arm Orthodox'
  | 'Left-arm Chinaman / Wrist Spin'
  | 'None';

export type BowlingSpeedClass =
  | 'Express (145+ km/h)'
  | 'Fast (138-144 km/h)'
  | 'Fast-Medium (130-137 km/h)'
  | 'Medium (120-129 km/h)'
  | 'Slow / Spin (80-105 km/h)'
  | 'Non-Bowler';

export type RatingTier = 'Platinum' | 'Diamond' | 'Gold' | 'Silver' | 'Bronze';

export interface BattingAttributes {
  timing: number;
  power: number;
  technique: number;
  paceHandling: number;
  spinHandling: number;
  finishing: number;
  runningBetweenWickets: number;
}

export interface PaceBowlingAttributes {
  speed: number;
  swing: number;
  seam: number;
  control: number;
  variations: number;
  deathBowling: number;
}

export interface SpinBowlingAttributes {
  turn: number;
  flight: number;
  control: number;
  accuracy: number;
  hasSpecialVariation: boolean;
  variationType?: 'Googly' | 'Doosra' | 'Arm Ball' | 'Flipper' | 'Carrom Ball' | 'None';
}

export interface FieldingAttributes {
  catching: number;
  throwing: number;
  agility: number;
  wicketkeeping?: number;
}

export interface MentalAttributes {
  consistency: number;
  pressureHandling: number;
  temperament: number;
  leadership: number;
}

export interface FitnessAttributes {
  stamina: number;
  recovery: number;
  injuryResistance: number;
}

export interface CareerStats {
  matches: number | null;
  runs: number | null;
  highestScore?: number | null;
  battingAverage?: number | null;
  strikeRate: number | null;
  fifties?: number | null;
  hundreds?: number | null;
  fours?: number | null;
  sixes?: number | null;
  wickets: number | null;
  bestBowling?: string | null;
  bowlingAverage?: number | null;
  economy: number | null;
  catches?: number | null;
  stumpings?: number | null;
}

export interface PlayerContract {
  currentFranchiseId: string | null;
  baseAuctionPriceCr: number;
  salaryExpectationCr: number;
  contractStatus: 'Contracted' | 'Auction Pool' | 'Free Agent';
  seasonsPlayed: number;
}

export interface Player {
  id: string; // e.g., "WD001", "REAL_0001" or "FICTIONAL_0001"
  name: string;
  shortName: string;
  age: number | null;
  country?: string | null;
  nationality: string;
  isOverseas: boolean;
  isReal: boolean;
  isCapped: boolean;
  isFictional?: boolean;
  originalFranchiseId: string | null; // e.g. "RCB", "MI", "CSK" or null
  franchise2026?: string | null;
  rosterStatus?: string;
  sourceStatus?: string;
  verificationStatus: 'Official 2026 IPL Pool' | 'Verified Domestic / Global' | 'Fictional Original';
  
  // Cricket profile
  role?: string;
  primaryRole: PlayerRole;
  secondaryRole?: string;
  battingHand: BattingHand | null;
  bowlingStyle?: string | null;
  bowlingType: BowlingType | null;
  bowlingArm: BowlingArm | null;
  bowlingSpeedClass: BowlingSpeedClass | null;
  isWicketkeeper: boolean;
  
  // Ratings
  overallRating: number;
  potentialRating: number;
  tier?: 'PLATINUM' | 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE';
  ratingTier: RatingTier;
  currentForm: number; // 0-100
  fitness: number; // 0-100%
  experience: number; // 0-100
  
  // Role-specific attribute matrices
  batting: BattingAttributes;
  paceBowling?: PaceBowlingAttributes;
  spinBowling?: SpinBowlingAttributes;
  fielding: FieldingAttributes;
  mental: MentalAttributes;
  fitnessAttributes: FitnessAttributes;
  attributes?: Record<string, number>;
  
  // Career & Financial
  contract: PlayerContract;
  careerStats: CareerStats;
  isRetired: boolean;
  auctionLotId?: string;
}
