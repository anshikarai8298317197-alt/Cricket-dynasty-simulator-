# WICKET DYNASTY – DATA MODELS & SCHEMA SPECIFICATION
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Schema Standard**: TypeScript Strict Data Contracts  
**Target Roster Capacity**: 320 Players (Prepared for Future Phase Population)  

---

## 1. Player Data Schema

```typescript
/**
 * Core Cricketer Roles
 */
export type PlayerRole = 
  | 'BATTER' 
  | 'PACE_BOWLER' 
  | 'SPIN_BOWLER' 
  | 'ALL_ROUNDER_PACE' 
  | 'ALL_ROUNDER_SPIN' 
  | 'WICKET_KEEPER';

export type BattingHand = 'RIGHT_HAND' | 'LEFT_HAND';

export type BowlingType = 
  | 'RIGHT_ARM_FAST'
  | 'RIGHT_ARM_FAST_MEDIUM'
  | 'LEFT_ARM_FAST'
  | 'LEFT_ARM_FAST_MEDIUM'
  | 'RIGHT_ARM_OFF_SPIN'
  | 'RIGHT_ARM_LEG_SPIN'
  | 'LEFT_ARM_ORTHODOX'
  | 'LEFT_ARM_CHINAMAN'
  | 'NONE';

/**
 * Role-Specific Skill Matrix (All ratings scaled 1-99)
 */
export interface BattingSkills {
  timing: number;          // Crispness of contact, boundary clearance
  power: number;           // Raw boundary distance, six-hitting ability
  technique: number;       // Defensive solidity, survival against good balls
  paceHandling: number;    // Competency against 140kmh+ pace, short balls
  spinHandling: number;    // Footwork against turn, reading flight
  finishing: number;       // Composure and strike-rate in death overs (16-20)
  runningBetweenWickets: number; // Speed, calling, turning ability
}

export interface PaceBowlingSkills {
  speed: number;           // Raw delivery velocity (e.g. 130-155 km/h)
  swing: number;           // New-ball aerial movement (conventional & reverse)
  seam: number;            // Deviation off the deck
  control: number;         // Line and length discipline, limiting extras
  variations: number;      // Slower balls, knuckleballs, cutters
  deathBowling: number;    // Yorkers, wide yorkers under pressure
}

export interface SpinBowlingSkills {
  turn: number;            // Revolutions and sharp deviation off pitch
  flight: number;          // Deception in the air, drift, drop
  control: number;         // Pitching in demanding channel
  accuracy: number;        // Dot-ball pressure capability
  hasSpecialVariation: boolean; // Googly (leg spin), Doosra (off spin), Arm ball
  variationMastery: number; // Disguise and execution of variation
}

export interface FieldingSkills {
  catching: number;        // Reflexes in slips, outfield reliability
  throwing: number;        // Arm strength and direct-hit accuracy
  agility: number;         // Ground fielding speed, boundary diving
}

export interface MentalSkills {
  consistency: number;     // Ability to reproduce high ratings match-to-match
  pressureHandling: number;// Performance in playoffs, tight chases, final overs
  temperament: number;     // Resistance to frustration after dot balls or boundaries
  leadership: number;      // Boosts team morale when appointed Captain
}

export interface PhysicalSkills {
  stamina: number;         // Workload endurance across long tournaments
  recovery: number;        // Speed of fitness regeneration between matches
  injuryResistance: number;// Resistance to breakdown (hamstrings, shoulder, back)
}

/**
 * Career Statistics Record
 */
export interface CareerStats {
  matches: number;
  inningsBatted: number;
  runs: number;
  highestScore: number;
  fifties: number;
  hundreds: number;
  ballsFaced: number;
  strikeRate: number;
  battingAverage: number;
  notOuts: number;
  fours: number;
  sixes: number;
  
  inningsBowled: number;
  ballsBowled: number;
  runsConceded: number;
  wickets: number;
  bestBowlingFigures: string; // e.g., "4/18"
  economyRate: number;
  bowlingAverage: number;
  threeWicketHauls: number;
  fiveWicketHauls: number;
  
  catchesTaken: number;
  runOutsInflicted: number;
  stumpings: number;
  playerOfTheMatchAwards: number;
}

/**
 * Contract & Status Schema
 */
export interface PlayerContract {
  currentFranchiseId: string | null; // null if in auction pool or free agent
  salaryPerSeasonCr: number;         // in Crores (e.g. 12.50)
  contractLengthYears: number;       // remaining years
  isRetained: boolean;
  hasRtmUsed: boolean;
}

/**
 * Master Player Interface (320 Players Supported)
 */
export interface Player {
  id: string;                        // Unique GUID (e.g. "ply_001")
  name: string;                      // Full player name
  shortName: string;                 // Display name (e.g., "V. Kohli")
  age: number;                       // Current age (17 to 42)
  nationality: string;               // Country code (e.g., "IND", "AUS", "ENG")
  isOverseas: boolean;               // True if non-domestic
  isRealPlayer: boolean;             // True if historical reference, false if fictional
  isCapped: boolean;                 // International cap flag
  primaryRole: PlayerRole;
  battingHand: BattingHand;
  bowlingType: BowlingType;
  
  overallRating: number;             // Weighted 1-99 based on role
  potentialRating: number;           // Ceiling 1-99 for development
  
  // Dynamic Condition States
  form: number;                      // 1-100 (fluctuates based on recent match performances)
  fitness: number;                   // 1-100% (fatigue reduces this)
  morale: number;                    // 1-10 (influences clutch performance)
  fatigue: number;                   // 0-100 (accumulates from training & matches)
  isInjured: boolean;
  injuryDetails?: {
    type: string;                    // e.g. "Side Strain", "Hamstring Pull"
    daysRemaining: number;
  };
  
  // Specific Skill Categorizations
  batting: BattingSkills;
  paceBowling?: PaceBowlingSkills;   // Populated for Pace Bowlers & Pace All-Rounders
  spinBowling?: SpinBowlingSkills;   // Populated for Spin Bowlers & Spin All-Rounders
  fielding: FieldingSkills;
  mental: MentalSkills;
  fitnessSkills: PhysicalSkills;
  
  // Financial & Career
  auctionBasePriceCr: number;        // e.g. 0.50, 1.00, 1.50, 2.00
  marketValueCr: number;             // Algorithmic valuation
  contract: PlayerContract;
  
  // Longevity & Retirement
  isRetired: boolean;
  retirementAge: number;             // Default 40
  veteranExtensionsUsed: number;     // Max 2 extensions allowed (up to age 42)
  
  // Historical Records
  careerStats: CareerStats;
  currentSeasonStats: CareerStats;
}
```

---

## 2. Franchise Data Schema

```typescript
export interface Franchise {
  id: string;                        // e.g., "FRN_BLR"
  name: string;                      // e.g., "Bangalore Royals"
  shortName: string;                 // e.g., "BLR"
  city: string;                      // e.g., "Bengaluru"
  homeStadiumName: string;           // e.g., "Chinnaswamy Arena"
  primaryColor: string;              // Hex code, e.g. "#E11D48"
  secondaryColor: string;            // Hex code, e.g. "#F59E0B"
  accentColor: string;               // Hex code, e.g. "#0F172A"
  logoIcon: string;                  // Asset badge key
  
  purseBalanceCr: number;            // Current cash balance (₹100.0 Cr start)
  totalBudgetCr: number;             // Season cap
  retainedPlayerIds: string[];       // Pre-auction retentions
  rtmCardsRemaining: number;         // Right-To-Match quota
  
  rosterPlayerIds: string[];         // Active 18-25 man squad
  playingXiIds: string[];            // Selected 11 players
  captainId: string | null;          // Captain
  wicketKeeperId: string | null;     // Designated Keeper
  twelfthManId: string | null;       // Substitute
  
  // AI Persona for NPC franchises
  aiManagerPersona: {
    aggression: number;              // Propensity to enter bidding wars (1-10)
    youthFocus: number;              // Bias towards uncapped youth (1-10)
    starPowerFocus: number;          // Willingness to break bank for Marquee (1-10)
    preferredPlaystyle: 'AGGRESSIVE' | 'BALANCED' | 'DEFENSIVE';
  };
  
  championshipsWon: number;          // Historical trophies
}
```

---

## 3. Auction Data Schema

```typescript
export type AuctionTier = 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE';

export type AuctionSetCategory = 
  | 'MARQUEE'
  | 'BATTERS'
  | 'PACE_BOWLERS'
  | 'SPIN_BOWLERS'
  | 'ALL_ROUNDERS'
  | 'WICKET_KEEPERS'
  | 'ACCELERATED_POOL';

export interface AuctionLot {
  lotNumber: number;
  playerId: string;
  tier: AuctionTier;
  category: AuctionSetCategory;
  basePriceCr: number;
  currentBidCr: number;
  highestBidderFranchiseId: string | null;
  status: 'PENDING' | 'ACTIVE' | 'SOLD' | 'UNSOLD';
  bidHistory: Array<{
    franchiseId: string;
    amountCr: number;
    timestamp: number;
  }>;
}

export interface AuctionState {
  isCompleted: boolean;
  currentLotIndex: number;
  activeRound: number;               // Round 1, Round 2 (Accelerated)
  lots: AuctionLot[];
  unsoldPlayerIds: string[];
  totalSpendingCr: Record<string, number>;
}
```

---

## 4. Tactics Data Schema

```typescript
export type MacroStrategy = 'ATTACK' | 'BALANCED' | 'DEFEND';

export type BattingApproach = 
  | 'CONSERVATIVE_ANCHOR' 
  | 'CONTROLLED_ROTATION' 
  | 'AGGRESSIVE_WITH_FREEDOM' 
  | 'MAXIMUM_ALL_OUT_ATTACK';

export type BowlingPlan = 
  | 'TIGHT_CONTAINMENT' 
  | 'ATTACK_THE_STUMPS' 
  | 'MIX_WITH_DEATH_OVERS_FOCUS' 
  | 'SHORT_BALL_BARRAGE';

export type FieldingPreset = 
  | 'STANDARD_T20' 
  | 'ATTACKING_SLIPS_RING' 
  | 'BOUNDARY_PROTECTION_DEEP' 
  | 'DEATH_OVERS_POCKET_PREVENT';

export interface TacticalMatrix {
  macroStrategy: MacroStrategy;
  battingApproach: BattingApproach;
  bowlingPlan: BowlingPlan;
  fieldingPreset: FieldingPreset;
  powerplayAdvantageFocus: boolean;
  middleOversControlFocus: boolean;
  deathOversExecutionFocus: boolean;
  intentModifiers: {
    runRateTargetMultiplier: number; // e.g. 1.15x for attack
    riskTolerance: number;           // probability of dismissal vs boundary
    strikeRotationPriority: number;  // 1-10
  };
}
```

---

## 5. Match Simulation & Ball Event Schema

```typescript
export type DismissalType = 
  | 'BOWLED'
  | 'CAUGHT_OUTFIELD'
  | 'CAUGHT_WICKETKEEPER'
  | 'CAUGHT_SLIP'
  | 'LBW'
  | 'RUN_OUT_STRIKER'
  | 'RUN_OUT_NON_STRIKER'
  | 'STUMPED'
  | 'HIT_WICKET';

export interface BallEvent {
  ballId: string;                    // e.g. "INN1_OVR8_B4"
  inningsNumber: 1 | 2;
  overIndex: number;                 // 0 to 19 (Over 1 is index 0)
  ballIndex: number;                 // 0 to 5 (or higher if extras bowled)
  isLegalDelivery: boolean;          // False for wide / no-ball
  
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  
  runsScoredByBatter: number;        // 0, 1, 2, 3, 4, 6
  extrasRuns: number;                // 1 for wide/no-ball, etc.
  extraType?: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'NONE';
  isFreeHit: boolean;
  
  isWicket: boolean;
  dismissal?: {
    type: DismissalType;
    dismissedPlayerId: string;
    fielderId?: string;
  };
  
  // 2D Vector Trajectory Data (For MatchPresentationRenderer)
  trajectory: {
    shotAngleDegrees: number;        // 0-360 degrees on pitch oval
    distanceMeters: number;          // Ground or aerial distance
    isBoundary: boolean;
    isSix: boolean;
    fielderInterceptCoordinate?: { x: number; y: number };
  };
  
  commentaryText: string;            // Text commentary ticker string
  timestampMs: number;
}
```

---

## 6. Club Facilities & Staff Schema

```typescript
export interface FacilityNode {
  level: number;                     // 1 to 5
  name: string;
  description: string;
  currentBonusText: string;
  nextUpgradeCostCr: number;
  isUpgrading: boolean;
  daysRemainingInUpgrade: number;
}

export interface ClubFacilities {
  stadium: FacilityNode;
  academy: FacilityNode;
  medicalCentre: FacilityNode;
  analyticsLab: FacilityNode;
  trainingNets: FacilityNode;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'HEAD_COACH' | 'BATTING_COACH' | 'BOWLING_COACH' | 'FIELDING_COACH' | 'HEAD_PHYSIO' | 'LEAD_ANALYST';
  tier: 1 | 2 | 3 | 4 | 5;
  salaryPerSeasonCr: number;
  buffDescription: string;
  buffPercentage: number;            // e.g., +6% Batting
}
```

---

## 7. Master Career State Schema (Authoritative Store)

```typescript
export interface CareerState {
  version: string;                   // "1.0.0"
  saveSlotId: number;                // 1 to 5
  careerName: string;
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT';
  createdAtTimestamp: number;
  lastSavedTimestamp: number;
  
  // Calendar & Progression
  currentSeasonNumber: number;       // 1 to 30
  seasonPhase: 
    | 'NEW_CAREER'
    | 'FRANCHISE_SELECTED'
    | 'AUCTION'
    | 'SQUAD_FINALIZED'
    | 'SEASON_ACTIVE'
    | 'MATCH'
    | 'MATCH_RESULT'
    | 'SEASON_COMPLETE'
    | 'NEXT_SEASON';
    
  userFranchiseId: string;
  
  // Master Repositories
  franchises: Record<string, Franchise>;
  players: Record<string, Player>;
  
  // Active Tournament
  currentTournament: {
    id: string;
    name: string;
    seasonYear: number;
    pointsTable: Array<{
      franchiseId: string;
      played: number;
      won: number;
      lost: number;
      tied: number;
      points: number;
      runsScored: number;
      oversFaced: number;
      runsConceded: number;
      oversBowled: number;
      netRunRate: number;
    }>;
    fixtures: Array<{
      fixtureId: string;
      matchNumber: number;
      homeFranchiseId: string;
      awayFranchiseId: string;
      venue: string;
      isCompleted: boolean;
      winnerFranchiseId?: string;
      resultDescription?: string;
      matchSummaryId?: string;
    }>;
    currentFixtureIndex: number;
  };
  
  // Club Operations
  facilities: ClubFacilities;
  staff: StaffMember[];
  tactics: TacticalMatrix;
  
  // Finances
  finances: {
    cashBalanceCr: number;
    seasonProjectedRevenueCr: number;
    ytdRevenueCr: number;
    ytdExpensesCr: number;
    ledgerEntries: Array<{
      id: string;
      category: 'TICKET_SALES' | 'BROADCAST' | 'SPONSORSHIP' | 'SALARIES' | 'FACILITY_UPKEEP' | 'AUCTION';
      amountCr: number;
      date: string;
      description: string;
    }>;
  };
  
  // Historical Dynasty Records
  history: {
    seasonsCompleted: number;
    trophiesWon: number;
    hallOfFamePlayerIds: string[];
    recordBook: {
      highestIndividualScore: { playerId: string; runs: number; matchId: string };
      bestBowlingSpell: { playerId: string; figures: string; matchId: string };
      highestTeamTotal: { franchiseId: string; runs: number; wickets: number };
      mostCareerRuns: { playerId: string; runs: number };
      mostCareerWickets: { playerId: string; wickets: number };
    };
  };
}
```

---
*Data Models and Schema Complete — Fully typed for future 320 player scaling and state serialization.*
