/**
 * WICKET DYNASTY - Club Management, Finances, Stadium & Multi-Season Types (Phase 06)
 */
import { Player } from './player';

export interface StadiumFacility {
  id: string;
  name: string;
  level: number; // 1 to 5
  description: string;
  upgradeCostCr: number;
  maintenancePerSeasonCr: number;
  benefitText: string;
}

export interface YouthProspect extends Player {
  academyIntakeYear: number;
  readinessPercentage: number; // 0 to 100
  scoutedPotentialBadge: 'Exceptional' | 'High' | 'Solid' | 'Raw';
}

export interface Scout {
  id: string;
  name: string;
  qualityRating: number; // 70 to 95
  specialisation: 'Domestic Talents' | 'Overseas Gems' | 'Youth Prodigies' | 'Death Specialists';
  salaryPerSeasonCr: number;
  activeAssignment?: {
    region: 'North India' | 'South India' | 'West India' | 'East India' | 'Australia & NZ' | 'England & SA' | 'Caribbean & Global';
    daysRemaining: number;
    targetRole: string;
  };
}

export interface ScoutingReport {
  id: string;
  player: Player;
  scoutedBy: string;
  accuracyConfidence: number; // 60 to 95%
  keyNotes: string;
  recommendedMaxAuctionCr: number;
  dateGenerated: string;
}

export interface FinancialTransaction {
  id: string;
  careerId: string;
  seasonNumber: number;
  type: 'INCOME' | 'EXPENSE';
  category:
    | 'PRIZE_MONEY'
    | 'SPONSORSHIP'
    | 'TICKET_SALES'
    | 'MERCHANDISE'
    | 'PLAYER_SALARIES'
    | 'STAFF_SALARIES'
    | 'STADIUM_UPGRADE'
    | 'FACILITY_MAINTENANCE'
    | 'ACADEMY_EXPENSE'
    | 'SCOUTING_COST'
    | 'MEDICAL_TREATMENT'
    | 'AUCTION_ACQUISITION';
  amountCr: number;
  timestamp: number;
  dateStr: string;
  description: string;
}

export interface SponsorContract {
  id: string;
  sponsorName: string;
  category: 'Main Jersey' | 'Kit Partner' | 'Stadium Naming' | 'Training Partner' | 'Digital Partner';
  annualPayoutCr: number;
  contractYearsRemaining: number;
  minReputationRequired: number;
  bonusCondition?: string;
  bonusPayoutCr?: number;
}

export interface ClubObjective {
  id: string;
  title: string;
  description: string;
  targetType: 'TOURNAMENT_WIN' | 'REACH_PLAYOFFS' | 'FINANCIAL_PROFIT' | 'DEVELOP_YOUTH' | 'STADIUM_CAPACITY';
  targetValue: number;
  currentValue: number;
  rewardCr: number;
  isCompleted: boolean;
}

export interface RetiredPlayerRecord {
  playerId: string;
  name: string;
  franchiseId: string;
  role: string;
  retirementAge: number;
  retiredSeason: number;
  careerMatches: number;
  careerRuns: number;
  careerWickets: number;
  highestScore: number;
  bestBowling: string;
  trophiesWon: number;
  orangeCaps: number;
  purpleCaps: number;
  extensionsUsed: number; // 0, 1, or 2 (Max age 42)
}

export interface SeasonHistoryEntry {
  seasonNumber: number;
  year: number;
  championFranchiseId: string;
  runnerUpFranchiseId: string;
  userFinishPosition: number;
  userMatchesWon: number;
  userMatchesLost: number;
  orangeCapWinner: { name: string; runs: number; franchiseId: string };
  purpleCapWinner: { name: string; wickets: number; franchiseId: string };
  mvpWinner: { name: string; points: number; franchiseId: string };
  seasonNetProfitCr: number;
}

export interface ClubProfile {
  clubLevel: number; // 1 to 10
  reputation: number; // 0 to 100
  fanBaseMillions: number;
  brandValueCr: number;
  stadiumCapacity: number;
  stadiumName: string;
  stadiumLevel: number;
  pitchQuality: 'Batting Friendly' | 'Bowling Greentop' | 'Spin Dustbowl' | 'Balanced Surface';
  stadiumFacilities: StadiumFacility[];
  academyLevel: number;
  youthProspects: YouthProspect[];
  scouts: Scout[];
  scoutingReports: ScoutingReport[];
  activeSponsors: SponsorContract[];
  objectives: ClubObjective[];
  financialLedger: FinancialTransaction[];
  retiredArchive: RetiredPlayerRecord[];
  seasonHistory: SeasonHistoryEntry[];
}
