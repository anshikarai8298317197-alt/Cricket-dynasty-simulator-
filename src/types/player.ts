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

export type RatingTier = 'Diamond' | 'Gold' | 'Silver' | 'Bronze';

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
  matches: number;
  runs: number;
  highestScore: number;
  battingAverage: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  fours: number;
  sixes: number;
  wickets: number;
  bestBowling: string;
  bowlingAverage: number;
  economy: number;
  catches: number;
  stumpings: number;
}

export interface PlayerContract {
  currentFranchiseId: string | null;
  baseAuctionPriceCr: number;
  salaryExpectationCr: number;
  contractStatus: 'Contracted' | 'Auction Pool' | 'Free Agent';
  seasonsPlayed: number;
}

export interface Player {
  id: string; // e.g., "REAL_0001" or "FICTIONAL_0001"
  name: string;
  shortName: string;
  age: number;
  nationality: string;
  isOverseas: boolean;
  isReal: boolean;
  isCapped: boolean;
  originalFranchiseId: string | null; // e.g. "RCB", "MI", "CSK" or null
  verificationStatus: 'Official 2026 IPL Pool' | 'Verified Domestic / Global' | 'Fictional Original';
  
  // Cricket profile
  primaryRole: PlayerRole;
  secondaryRole?: string;
  battingHand: BattingHand;
  bowlingType: BowlingType;
  bowlingArm: BowlingArm;
  bowlingSpeedClass: BowlingSpeedClass;
  isWicketkeeper: boolean;
  
  // Ratings
  overallRating: number;
  potentialRating: number;
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
  
  // Career & Financial
  contract: PlayerContract;
  careerStats: CareerStats;
  isRetired: boolean;
}
