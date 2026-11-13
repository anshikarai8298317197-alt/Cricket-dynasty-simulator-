/**
 * WICKET DYNASTY - Tournament & Fixture Data Types (Phases 04 & 05)
 * Official IPL 10-Team 14-Match League Format (74 Matches Total)
 */

export type PlayoffStage =
  | 'NONE'
  | 'GROUP_STAGE'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'QUALIFIER_1'
  | 'ELIMINATOR'
  | 'QUALIFIER_2'
  | 'FINAL';

export interface Fixture {
  fixtureId: string;
  competitionId?: string;
  groupName?: string;
  matchNumber: number; // 1 to N
  roundNumber: number; // 1 to 14 for league, 15 for Playoffs
  playoffStage: PlayoffStage;
  dateStr: string;
  matchDateIso?: string;
  venue: string;
  
  homeFranchiseId: string;
  awayFranchiseId: string;
  
  isCompleted: boolean;
  isLive?: boolean;
  
  // Results populated after match
  homeScore?: { runs: number; wickets: number; oversDisplay: string; ballsFaced: number };
  awayScore?: { runs: number; wickets: number; oversDisplay: string; ballsFaced: number };
  winnerFranchiseId?: string;
  resultDescription?: string;
  playerOfTheMatchName?: string;
  matchDetailsId?: string;
}

export interface PointsTableEntry {
  franchiseId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: number; // Calculated dynamically from legal balls & runs
  
  // Stored legal totals to prevent decimal drift
  runsScored: number;
  legalBallsFaced: number; // 120 per 20 ov (or 120 if all out)
  runsConceded: number;
  legalBallsBowled: number;
  
  form: ('W' | 'L' | 'T' | 'NR')[]; // Last 5 matches
}

export interface PlayerTournamentStats {
  playerId: string;
  playerName: string;
  franchiseId: string;
  role: string;
  isEmergingPlayer?: boolean;
  
  // Batting
  matches: number;
  innings: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  boundaries: number;
  fifties: number;
  hundreds: number;
  highestScore: number;
  notOuts: number;
  battingAverage: number;
  strikeRate: number;
  
  // Bowling
  oversBowled: number;
  legalBallsBowled: number;
  maidens: number;
  dotBalls: number;
  runsConceded: number;
  wickets: number;
  bestBowlingRuns: number;
  bestBowlingWickets: number;
  bestBowlingText: string; // e.g. "4/18"
  bowlingAverage: number;
  bowlingStrikeRate: number;
  economy: number;
  threeWicketHauls: number;
  fourWicketHauls: number;
  fiveWicketHauls: number;
  
  // Fielding
  catches: number;
  runOuts: number;
  stumpings: number;
  totalDismissals: number;
  
  // Awards & Recognition
  playerOfTheMatchAwards: number;
  mvpPoints: number;
}

export interface TournamentLeaderboards {
  // Batting Leaderboards
  orangeCap: PlayerTournamentStats[]; // Most Runs
  highestAverage: PlayerTournamentStats[]; // Min 40 balls
  highestStrikeRate: PlayerTournamentStats[]; // Min 40 balls
  mostSixes: PlayerTournamentStats[];
  mostFours: PlayerTournamentStats[];
  mostBoundaries: PlayerTournamentStats[];
  mostFifties: PlayerTournamentStats[];
  mostHundreds: PlayerTournamentStats[];
  highestScore: PlayerTournamentStats[];
  mostNotOuts: PlayerTournamentStats[];

  // Bowling Leaderboards
  purpleCap: PlayerTournamentStats[]; // Most Wickets
  bestEconomy: PlayerTournamentStats[]; // Min 8 overs
  bestBowlingAverage: PlayerTournamentStats[]; // Min 3 wickets
  bestBowlingStrikeRate: PlayerTournamentStats[]; // Min 3 wickets
  mostDotBalls: PlayerTournamentStats[];
  mostMaidens: PlayerTournamentStats[];
  bestFigures: PlayerTournamentStats[];
  mostThreeWicketHauls: PlayerTournamentStats[];
  mostFourWicketHauls: PlayerTournamentStats[];
  mostFiveWicketHauls: PlayerTournamentStats[];

  // Fielding Leaderboards
  mostCatches: PlayerTournamentStats[];
  mostRunOuts: PlayerTournamentStats[];
  mostStumpings: PlayerTournamentStats[];
  mostDismissals: PlayerTournamentStats[];

  // Special Awards & MVP
  mvpRace: PlayerTournamentStats[];
  playerOfTheMatchRace: PlayerTournamentStats[];
  bestAllRounder: PlayerTournamentStats[];
  emergingPlayer: PlayerTournamentStats[];
  mostConsistent: PlayerTournamentStats[];
}

export interface TournamentState {
  tournamentId: string;
  leagueId?: string;
  name: string;
  country?: string;
  seasonYear: number;
  startDateIso?: string;
  endDateIso?: string;
  currentRound: number; // 1 to 15
  totalLeagueMatches: number;
  totalPlayoffMatches: number;
  fixtures: Fixture[];
  currentFixtureIndex: number;
  pointsTable: PointsTableEntry[];
  playerStats: Record<string, PlayerTournamentStats>;
  
  // Playoff Seeds
  playoffs: {
    qualifier1FixtureId?: string;
    eliminatorFixtureId?: string;
    qualifier2FixtureId?: string;
    finalFixtureId?: string;
    championFranchiseId?: string;
    runnerUpFranchiseId?: string;
  };
}
