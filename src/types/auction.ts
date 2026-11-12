/**
 * WICKET DYNASTY - Auction Data Types & Interfaces
 * Phase 02 Architecture
 */
import { Player, PlayerRole, RatingTier } from './player';

export type AuctionSetCategory =
  | 'Elite Top-order Batters'
  | 'Aggressive Openers'
  | 'Middle-order Batters'
  | 'Finishers'
  | 'Uncapped Batting Prospects'
  | 'Elite Wicketkeepers'
  | 'Batting Wicketkeepers'
  | 'Uncapped Wicketkeepers'
  | 'Batting All-rounders'
  | 'Bowling All-rounders'
  | 'Pace All-rounders'
  | 'Spin All-rounders'
  | 'Express Fast Bowlers'
  | 'Fast Bowlers'
  | 'Fast-Medium Bowlers'
  | 'Swing Specialists'
  | 'Death-over Specialists'
  | 'Leg Spinners'
  | 'Off Spinners'
  | 'Left-arm Orthodox Spinners'
  | 'Wrist Spinners'
  | 'Uncapped Spin Prospects'
  | 'Platinum Marquee Pool'
  | 'BAT'
  | 'BOWLER'
  | 'ALL_ROUNDER'
  | 'WICKETKEEPER'
  | 'Accelerated Unsold Pool';

export type LotStatus = 'PENDING' | 'ACTIVE' | 'SOLD' | 'UNSOLD';

export interface BidRecord {
  franchiseId: string;
  amountCr: number;
  timestamp: number;
  isRtm?: boolean;
}

export interface AuctionLot {
  lotNumber: number;
  player: Player;
  category: AuctionSetCategory;
  tier: RatingTier;
  basePriceCr: number;
  currentBidCr: number;
  currentHighestBidderId: string | null;
  status: LotStatus;
  bidHistory: BidRecord[];
}

export interface AuctionTransaction {
  id: string;
  playerId: string;
  playerName: string;
  playerRole: PlayerRole;
  isOverseas: boolean;
  franchiseId: string;
  amountCr: number;
  timestamp: number;
  type: 'RETENTION' | 'AUCTION_BID' | 'RTM_MATCH' | 'ACCELERATED_DRAFT';
}

export interface FranchiseAuctionState {
  franchiseId: string;
  purseRemainingCr: number;
  rosterPlayerIds: string[];
  retainedPlayerIds: string[];
  rtmCardsRemaining: number;
  totalSpentCr: number;
  aiPersona: {
    aggression: number; // 1-10
    youthBias: number; // 1-10
    overseasTarget: number; // max 8
    targetRoles: Record<string, number>;
  };
}

export interface AuctionState {
  isCompleted: boolean;
  currentLotIndex: number;
  activeRound: number; // 1 = Main Sets, 2 = Accelerated Round, 3 = Final Pool
  lots: AuctionLot[];
  timerSeconds: number;
  isTimerPaused: boolean;
  unsoldPlayerIds: string[];
  transactions: AuctionTransaction[];
  franchiseStates: Record<string, FranchiseAuctionState>;
  recentSales: {
    playerName: string;
    franchiseId: string;
    amountCr: number;
    rating: number;
  }[];
}
