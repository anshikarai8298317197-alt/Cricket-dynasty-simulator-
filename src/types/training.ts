/**
 * WICKET DYNASTY - Training & Development Types (Phase 03)
 */
import { Player, PlayerRole } from './player';

export type TrainingCategory =
  | 'BATTING'
  | 'PACE_BOWLING'
  | 'SPIN_BOWLING'
  | 'WICKETKEEPING'
  | 'FIELDING'
  | 'FITNESS'
  | 'MENTAL';

export type TrainingIntensity = 'Light' | 'Normal' | 'Intensive';

export interface TrainingProgramme {
  id: string;
  name: string;
  category: TrainingCategory;
  description: string;
  targetAttributes: string[];
  compatibleRoles: string[]; // e.g. ['Batter', 'Opener', 'Finisher'] or 'ALL'
  baseFatigueCost: number; // 5 to 25
  baseInjuryRiskPercent: number; // 1% to 15%
}

export interface IndividualTrainingAssignment {
  playerId: string;
  programmeId: string;
  intensity: TrainingIntensity;
  coachId: string;
  assignedDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  sessionsRemaining: number;
}

export interface TeamTrainingSession {
  id: string;
  unitName:
    | 'Batting Unit'
    | 'Pace Bowling Unit'
    | 'Spin Bowling Unit'
    | 'Fielding Unit'
    | 'Wicketkeeping Unit'
    | 'Fitness & Conditioning'
    | 'Team Bonding'
    | 'Mental Preparation';
  category: TrainingCategory;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  intensity: TrainingIntensity;
  coachId: string;
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  activityType: 'TRAINING' | 'TEAM_UNIT' | 'RECOVERY' | 'REST';
  teamSession?: TeamTrainingSession;
  individualAssignments: IndividualTrainingAssignment[];
  notes?: string;
}

export interface WeeklySchedule {
  weekNumber: number;
  days: Record<string, DaySchedule>;
}

export type CoachRole =
  | 'Head Coach'
  | 'Batting Coach'
  | 'Pace Bowling Coach'
  | 'Spin Bowling Coach'
  | 'Fielding Coach'
  | 'Fitness Coach'
  | 'Mental Conditioning Coach'
  | 'Wicketkeeping Coach';

export interface Coach {
  id: string;
  name: string;
  role: CoachRole;
  experienceYears: number;
  qualityRating: number; // 1-100
  specialisation: string;
  salaryPerSeasonCr: number;
  contractYears: number;
  coachingStyle: 'Disciplined' | 'Analytical' | 'Supportive' | 'Aggressive';
  developmentBonusPercent: number; // e.g. +6% Batting
}

export interface TrainingFacility {
  id: string;
  name: string;
  level: number; // 1-5
  category: TrainingCategory;
  description: string;
  currentBonusText: string;
  upgradeCostCr: number;
  upgradeDurationWeeks: number;
  isUpgrading: boolean;
}

export interface DevelopmentLogEntry {
  id: string;
  playerId: string;
  playerName: string;
  dateStr: string;
  programmeName: string;
  attributeChanges: Record<string, number>; // e.g. { timing: +1, power: +1 }
  fatigueDelta: number;
  notes: string;
  status: 'IMPROVED' | 'STAGNATED' | 'FATIGUED' | 'INJURED';
}

export interface PlayerWorkloadState {
  playerId: string;
  fatigue: number; // 0-100
  fitness: number; // 0-100%
  injuryRiskScore: number; // 0-100%
  isInjured: boolean;
  injuryDetails?: {
    type: string; // e.g. 'Hamstring Strain', 'Side Strain'
    severity: 'Minor' | 'Moderate' | 'Severe';
    recoveryDaysRemaining: number;
    description: string;
  };
}
