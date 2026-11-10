/**
 * WICKET DYNASTY - Tactical Management & Integration Contracts (Phase 03)
 */

export type BattingAggressionLevel =
  | 'Very Defensive'
  | 'Defensive'
  | 'Balanced'
  | 'Aggressive'
  | 'Very Aggressive';

export type BattingStrategyType =
  | 'Build an innings'
  | 'Rotate strike'
  | 'Attack powerplay'
  | 'Target specific bowlers'
  | 'Accelerate in middle overs'
  | 'Maximize death overs';

export type BowlingAggressionLevel =
  | 'Containment / Defensive'
  | 'Balanced Line & Length'
  | 'Attacking Stumps & Slips'
  | 'Enforce Short-Ball Barrage';

export type FieldingPresetType =
  | 'Attacking Slips & Ring'
  | 'Balanced Standard T20'
  | 'Defensive Boundary Patrol'
  | 'Powerplay Ring (Max 2 Outside)'
  | 'Death-over Pocket Prevent';

export interface BattingTacticsConfig {
  battingOrderIds: string[]; // 1 to 11
  macroAggression: BattingAggressionLevel;
  strategy: BattingStrategyType;
  powerplayApproach: 'High Risk Boundaries' | 'Cautious Consolidation' | 'Balanced Rotation';
  middleOversApproach: 'Strike Rotation' | 'Target Weaker Bowlers' | 'Conserve Wickets';
  deathOversApproach: 'All-Out Boundary Hitting' | 'Calculated Acceleration' | 'Run Hard';
  situationalInstructions: {
    requiredRunRateThreshold: number; // e.g. 10.0+ triggers higher aggression
    wicketsRemainingDefenseThreshold: number; // e.g. < 4 wickets triggers anchor mode
  };
}

export interface BowlingTacticsConfig {
  openingBowlerIds: string[]; // 2 bowlers
  firstChangeBowlerId: string;
  middleOversBowlerIds: string[];
  deathOversSpecialistIds: string[];
  macroAggression: BowlingAggressionLevel;
  paceVsSpinPreference: 'Favor Pace' | 'Favor Spin' | 'Balanced Conditions';
  deathOversPlan: 'Wide Yorkers & Cutters' | 'Direct Yorkers' | 'Bouncers & Slower Balls';
  enforceFourOverLimit: boolean; // strict T20 rule
}

export interface FieldingTacticsConfig {
  preset: FieldingPresetType;
  slipCount: number; // 0 to 3
  innerRingDensity: number; // 4 to 8
  deepBoundaryPatrolCount: number; // 2 to 5 depending on powerplay
  wicketkeeperStance: 'Up to the Stumps' | 'Back for Pace';
}

export interface MatchupDossier {
  batterId: string;
  batterName: string;
  vsPaceRating: number; // 1-100
  vsSpinRating: number; // 1-100
  vsLeftArmRating: number; // 1-100
  vsRightArmRating: number; // 1-100
  recommendedBowlerType: string;
  historicalSampleMatches: number;
}

export interface MatchPreparationPlan {
  fixtureId: string;
  opponentFranchiseId: string;
  opponentStrengths: string[];
  opponentWeaknesses: string[];
  confirmedPlayingXiIds: string[];
  captainId: string;
  viceCaptainId: string;
  wicketKeeperId: string;
  battingTactics: BattingTacticsConfig;
  bowlingTactics: BowlingTacticsConfig;
  fieldingTactics: FieldingTacticsConfig;
  pitchCondition: 'Batting Friendly' | 'Bowling Greentop' | 'Spin Dustbowl' | 'Balanced Surface';
  weatherCondition: 'Clear 28°C' | 'Overcast 24°C' | 'Humid & Dew' | 'Breezy Night';
  tossChoice: 'Bat First' | 'Bowl First' | 'Auto';
  isPlanConfirmed: boolean;
  confirmedAtTimestamp?: number;
}
