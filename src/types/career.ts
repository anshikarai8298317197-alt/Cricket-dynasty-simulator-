/**
 * WICKET DYNASTY - Career State & Storage Definitions
 */

export type SquadMode = 'Auction Mode' | 'Real Squads Mode' | 'Own Club Mode';
export type DifficultyLevel = 'Easy' | 'Normal' | 'Hard' | 'Expert';

export interface CareerRules {
  allowRtmCards: boolean;
  overseasLimitInXI: number; // 4
  squadSizeMin: number; // 18
  squadSizeMax: number; // 25
  salaryCapCr: number; // 100.0 Cr
  tradeWindowEnabled: boolean;
  injuryFrequency: 'Low' | 'Realistic' | 'High';
}

export interface CareerSave {
  id: string; // e.g., "career_17123456789"
  name: string;
  slotIndex: number; // 1 to 5
  createdAt: number;
  lastPlayedAt: number;
  version: string;
  
  // Settings
  tournamentName: string;
  difficulty: DifficultyLevel;
  squadMode: SquadMode;
  rules: CareerRules;
  
  // Selected Franchise
  franchiseId: string;
  
  // Progression
  currentSeason: number; // 1 to 30
  seasonPhase: 'Pre-Season' | 'Retentions' | 'Auction' | 'Squad Setup' | 'SEASON_ACTIVE' | 'Playoffs' | 'Season End';
  purseBalanceCr: number;
  
  // Squad roster IDs
  squadPlayerIds: string[];
  playingXiIds: string[];
  captainId: string | null;
  viceCaptainId: string | null;
  wicketKeeperId: string | null;
  
  // Multi-franchise state across all 10 teams
  allFranchiseSquads?: Record<string, string[]>;
  allFranchisePurses?: Record<string, number>;
  
  // Auction & Tournament State
  retentionTransactions?: any[];
  auctionTransactions?: any[];
  auctionState?: any;
  tournament?: any;
  
  // Phase 03 Training & Player Workload States
  playerWorkloads?: Record<string, any>;
  careerPlayerOverrides?: Record<string, any>;
  coaches?: any[];
  facilities?: any[];
  weeklySchedule?: any;
  developmentReports?: any[];
  
  // Phase 03 Tactical Configuration & Match Preparation
  tactics?: {
    batting: any;
    bowling: any;
    fielding: any;
  };
  matchPreparationPlan?: any;
  
  // Phase 06 Club Headquarters, Stadium, Finances & Multi-Season
  clubProfile?: any;
  
  // History summary
  statsSummary: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    trophies: number;
  };

  // In-Game Career Calendar & Daily Activity
  currentCareerDate?: number; // timestamp, e.g. Date.parse('2026-03-27')
  activeDailyFocus?: 'Batting' | 'Bowling' | 'Fielding' | 'Fitness' | 'Mental';
  activeDailyIntensity?: 'Light' | 'Medium' | 'Hard' | 'REST';
  unreadNotificationsCount?: number;
  notifications?: {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type?: 'INFO' | 'MATCH' | 'AUCTION' | 'INJURY' | 'ACHIEVEMENT';
  }[];
}

export interface DatabaseAuditReport {
  totalPlayers: number;
  indianCapped: number;
  indianUncapped: number;
  overseasCapped: number;
  overseasUncapped: number;
  realCount: number;
  fictionalCount: number;
  uniqueIdsValid: boolean;
  ratingsValid: boolean;
  roleAttributesValid: boolean;
  franchiseDistribution: Record<string, number>;
  unassignedCount: number;
  verificationPassed: boolean;
  errors: string[];
}
