/**
 * WICKET DYNASTY - Year-Round Global Season, Domestic Leagues & Champions League Types
 */
import { Franchise } from './franchise';
import { Fixture, PlayerTournamentStats, PointsTableEntry, TournamentState } from './tournament';

export type DomesticLeagueId =
  | 'IPL'
  | 'BBL'
  | 'PSL'
  | 'SA20'
  | 'CPL'
  | 'BPL'
  | 'ILT20'
  | 'THE_HUNDRED';

export type CompetitionId = DomesticLeagueId | 'GCL_T20';

export interface GlobalTeam extends Franchise {
  leagueId: DomesticLeagueId;
  country: string;
  countryCode: string;
  rating: number;
  previousTrophies: string[];
  tournamentHistory: {
    appearances: number;
    titles: number;
    bestFinish: string;
  };
}

export interface LeagueDefinition {
  id: DomesticLeagueId;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  trophyName: string;
  teamCount: number;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  defaultGclSlots: number;
  formatLabel: string;
  accentColor: string;
}

export type GCLQualificationSlotConfig = Record<DomesticLeagueId, number>;

export interface GCLQualifiedParticipant {
  teamId: string;
  qualifiedFromLeagueId: DomesticLeagueId;
  qualificationReason: string;
  leaguePosition: number;
  seedRank: number;
}

export interface GCLGroup {
  groupName: 'Group A' | 'Group B' | 'Group C' | 'Group D';
  teamIds: string[];
  standings: PointsTableEntry[];
}

export interface GCLState {
  tournamentId: string;
  name: string;
  seasonYear: number;
  startDateIso: string;
  endDateIso: string;
  status: 'PENDING' | 'GROUP_STAGE' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'FINAL' | 'COMPLETED';
  qualifiedParticipants: GCLQualifiedParticipant[];
  groups: GCLGroup[];
  fixtures: Fixture[];
  playerStats: Record<string, PlayerTournamentStats>;
  championFranchiseId?: string;
  runnerUpFranchiseId?: string;
}

export interface CareerTrophy {
  id: string;
  competitionId: CompetitionId | 'SEASON_CHAMPION';
  trophyName: string;
  competitionName: string;
  seasonYear: number;
  seasonNumber: number;
  winningTeamId: string;
  winningTeamName: string;
  runnerUpTeamId?: string;
  finalMargin?: string;
  tier: 'GOLD' | 'PLATINUM' | 'DIAMOND';
  awardedAt: number;
}

export interface MatchHistoryEntry {
  id: string;
  fixtureId: string;
  competitionId: CompetitionId;
  competitionName: string;
  seasonYear: number;
  seasonNumber: number;
  dateStr: string;
  stageLabel: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScoreText: string;
  awayScoreText: string;
  winnerTeamId: string;
  resultDescription: string;
  playerOfTheMatchName: string;
  isUserMatch: boolean;
}

export interface WorldSeasonState {
  currentGameYear: number;
  currentDateIso: string; // YYYY-MM-DD
  domesticLeagues: Record<DomesticLeagueId, TournamentState>;
  championsLeague: GCLState | null;
  gclSlotConfig: GCLQualificationSlotConfig;
}
