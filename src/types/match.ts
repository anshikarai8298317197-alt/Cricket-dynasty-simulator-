/**
 * WICKET DYNASTY - Cricket Match Engine Data Contracts (Phase 04)
 */

export type DeliveryOutcomeType =
  | 'DOT'
  | 'SINGLE'
  | 'TWO'
  | 'THREE'
  | 'FOUR'
  | 'SIX'
  | 'WICKET'
  | 'WIDE'
  | 'NO_BALL'
  | 'BYE'
  | 'LEG_BYE';

export type DismissalKind =
  | 'BOWLED'
  | 'CAUGHT'
  | 'LBW'
  | 'RUN_OUT'
  | 'STUMPED'
  | 'HIT_WICKET'
  | 'CAUGHT_AND_BOWLED';

export interface BallEvent {
  overNumber: number; // 0 to 19 (e.g., over 0 = Over 1)
  ballInOver: number; // 1 to 6 (legal ball count)
  ballDisplay: string; // e.g. "0.1", "19.6"
  isLegalBall: boolean;
  
  bowlerId: string;
  bowlerName: string;
  bowlerStyle?: string; // e.g. "RMF", "RFM", "SLA", "Leg Spin"
  bowlerStamina?: number; // e.g. 95%
  bowlerOversDisplay?: string; // e.g. "0.2"
  bowlerMaidens?: number;
  bowlerRunsConceded?: number;
  bowlerWickets?: number;
  bowlerEconomy?: number;
  
  strikerId: string;
  strikerName: string;
  strikerNumber?: number;
  strikerHand?: string | null;
  strikerRuns: number; // Instantaneous runs of striker at this delivery
  strikerBalls: number; // Instantaneous balls of striker at this delivery
  strikerFours?: number;
  strikerSixes?: number;
  
  nonStrikerId: string;
  nonStrikerName: string;
  nonStrikerNumber?: number;
  nonStrikerHand?: string | null;
  nonStrikerRuns: number; // Instantaneous runs of non-striker at this delivery
  nonStrikerBalls: number;
  nonStrikerFours?: number;
  nonStrikerSixes?: number;
  
  runsBat: number;
  extrasType?: 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE';
  extrasRuns: number;
  totalRuns: number;
  
  isWicket: boolean;
  dismissal?: {
    kind: DismissalKind;
    dismissedPlayerId: string;
    dismissedPlayerName: string;
    assistPlayerId?: string; // Catcher, Run-out fielder, Keeper
    assistPlayerName?: string;
    description: string;
  };
  
  commentary: string;
  
  // Cumulative state after ball
  teamRuns: number;
  teamWickets: number;

  // Trajectory & Fielder Action
  trajectory?: {
    shotType: string;
    angleDeg: number;
    distancePct: number;
    isLofted: boolean;
    targetX: number;
    targetY: number;
    bounceCount?: number;
    bouncePoints?: { x: number; y: number }[];
    apexHeight?: number;
  };
  fieldingAction?: {
    fielderName: string;
    positionLabel: string;
    startX: number;
    startY: number;
    interceptX: number;
    interceptY: number;
    outcome: 'CATCH' | 'GROUND_PICKUP' | 'BOUNDARY_FOUR' | 'BOUNDARY_SIX' | 'DIVING_SAVE';
  };
  drsReview?: {
    pitching: 'IN_LINE' | 'OUTSIDE_OFF' | 'OUTSIDE_LEG';
    impact: 'IN_LINE' | 'OUTSIDE_OFF' | 'UMPIRE_CALL';
    wickets: 'HITTING' | 'UMPIRES_CALL' | 'MISSING';
    reviewSuccessPct: number;
    overturnOnReview: boolean;
    originalDecision: 'OUT_LBW';
    resolvedOutcome?: 'UPHELD' | 'OVERTURNED_NOT_OUT';
  };
}

export interface BatterInningsRecord {
  playerId: string;
  playerName: string;
  battingPosition: number; // 1 to 11
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalSummary?: string;
  bowlerName?: string;
  fielderName?: string;
}

export interface BowlerInningsRecord {
  playerId: string;
  playerName: string;
  bowlingRole: string;
  overs: number; // Full completed overs
  ballsRemainder: number; // 0 to 5 balls
  oversDisplay: string; // e.g. "4.0", "3.4"
  legalBallsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  dots: number;
  wides: number;
  noBalls: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  oversDisplay: string;
  playerDismissedName: string;
}

export interface OverSummary {
  overNumber: number;
  bowlerName: string;
  runsInOver: number;
  wicketsInOver: number;
  balls: BallEvent[];
  teamScoreAtEnd: number;
  teamWicketsAtEnd: number;
}

export interface InningsScorecard {
  inningsNumber: 1 | 2;
  battingFranchiseId: string;
  bowlingFranchiseId: string;
  totalRuns: number;
  totalWickets: number;
  legalBallsFaced: number;
  oversDisplay: string;
  isCompleted: boolean;
  isAllOut: boolean;
  target?: number; // Only for 2nd innings
  
  batters: BatterInningsRecord[];
  bowlers: BowlerInningsRecord[];
  fallOfWickets: FallOfWicket[];
  overSummaries: OverSummary[];
  allBalls: BallEvent[];
  
  extras: {
    total: number;
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
}

export interface MatchResultDetails {
  matchId: string;
  fixtureId: string;
  homeFranchiseId: string;
  awayFranchiseId: string;
  
  winnerFranchiseId: string;
  loserFranchiseId: string;
  isTie: boolean;
  isSuperOver: boolean;
  marginDescription: string; // e.g. "BLR won by 14 runs", "CSK won by 6 wickets"
  
  playerOfTheMatch: {
    playerId: string;
    playerName: string;
    franchiseId: string;
    performanceSummary: string; // e.g. "84 (46) & 2 catches"
    impactScore: number;
  };
  
  innings1: InningsScorecard;
  innings2: InningsScorecard;
  superOverInnings1?: InningsScorecard;
  superOverInnings2?: InningsScorecard;
  
  conditions: {
    pitchCondition: string;
    weatherCondition: string;
    venue: string;
    tossWinnerId: string;
    tossDecision: 'Bat First' | 'Bowl First';
  };
  
  randomSeed: number;
  completedAt: number;
}
