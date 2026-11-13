/**
 * WICKET DYNASTY - Shared Match Simulation & Leaderboard Accumulation Helpers
 * Keeps GlobalSeasonEngine decoupled and avoids circular imports.
 */
import { getGlobalTeamSquad } from '../data/globalLeagues';
import { CareerSave } from '../types/career';
import { MatchResultDetails } from '../types/match';
import { Player } from '../types/player';
import { Fixture, PlayerTournamentStats, TournamentState } from '../types/tournament';
import { CricketMatchEngine } from './cricketMatchEngine';
import { PlayerMilestoneEvent } from './milestoneService';
import { TournamentEngine } from './tournamentEngine';

export interface MilestoneEventResult {
  updatedCareer: CareerSave;
  newlyUnlockedMilestones: PlayerMilestoneEvent[];
}

let helperSimCounter = 0;

function initStat(playerId: string, playerName: string, franchiseId: string, role: string): PlayerTournamentStats {
  return {
    playerId,
    playerName,
    franchiseId,
    role,
    isEmergingPlayer: false,
    matches: 0,
    innings: 0,
    runs: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    boundaries: 0,
    fifties: 0,
    hundreds: 0,
    highestScore: 0,
    notOuts: 0,
    battingAverage: 0,
    strikeRate: 0,
    oversBowled: 0,
    legalBallsBowled: 0,
    maidens: 0,
    dotBalls: 0,
    runsConceded: 0,
    wickets: 0,
    bestBowlingRuns: 999,
    bestBowlingWickets: 0,
    bestBowlingText: '0/0',
    bowlingAverage: 0,
    bowlingStrikeRate: 0,
    economy: 0,
    threeWicketHauls: 0,
    fourWicketHauls: 0,
    fiveWicketHauls: 0,
    catches: 0,
    runOuts: 0,
    stumpings: 0,
    totalDismissals: 0,
    playerOfTheMatchAwards: 0,
    mvpPoints: 0,
  };
}

export const processGlobalMatchResultHelpers = {
  simulateFixture(fixture: Fixture, allPlayers: Player[], career?: CareerSave | null): MatchResultDetails {
    const homeXi = getGlobalTeamSquad(fixture.homeFranchiseId, allPlayers, career);
    const awayXi = getGlobalTeamSquad(fixture.awayFranchiseId, allPlayers, career);

    helperSimCounter += 1;
    return CricketMatchEngine.simulateMatch({
      matchId: `mat_${fixture.fixtureId}_${Date.now()}_${helperSimCounter}`,
      fixtureId: fixture.fixtureId,
      homeFranchiseId: fixture.homeFranchiseId,
      awayFranchiseId: fixture.awayFranchiseId,
      homePlayingXi: homeXi.length >= 11 ? homeXi.slice(0, 11) : allPlayers.slice(0, 11),
      awayPlayingXi: awayXi.length >= 11 ? awayXi.slice(0, 11) : allPlayers.slice(11, 22),
    });
  },

  recordTournamentResult(tournament: TournamentState, result: MatchResultDetails): TournamentState {
    return TournamentEngine.recordMatchResult(tournament, result);
  },

  mergePlayerStats(
    existing: Record<string, PlayerTournamentStats>,
    result: MatchResultDetails
  ): Record<string, PlayerTournamentStats> {
    const stats = { ...existing };

    if (result.playerOfTheMatch?.playerId) {
      const pid = result.playerOfTheMatch.playerId;
      if (!stats[pid]) {
        stats[pid] = initStat(
          pid,
          result.playerOfTheMatch.playerName,
          result.winnerFranchiseId || result.homeFranchiseId,
          'Player'
        );
      } else {
        stats[pid] = { ...stats[pid] };
      }
      stats[pid].playerOfTheMatchAwards += 1;
    }

    [result.innings1, result.innings2].forEach(inn => {
      inn.batters.forEach(b => {
        const s = stats[b.playerId]
          ? { ...stats[b.playerId] }
          : initStat(b.playerId, b.playerName, inn.battingFranchiseId, 'Batter');
        s.matches += 1;
        if (b.balls > 0 || b.isOut) {
          s.innings += 1;
          s.runs += b.runs;
          s.ballsFaced += b.balls;
          s.fours += b.fours;
          s.sixes += b.sixes;
          s.boundaries += b.fours + b.sixes;
          if (!b.isOut) s.notOuts += 1;
          if (b.runs > s.highestScore) s.highestScore = b.runs;
          if (b.runs >= 100) s.hundreds += 1;
          else if (b.runs >= 50) s.fifties += 1;

          s.strikeRate = s.ballsFaced > 0 ? Number(((s.runs / s.ballsFaced) * 100).toFixed(1)) : 0;
          const dismissals = Math.max(1, s.innings - s.notOuts);
          s.battingAverage = Number((s.runs / dismissals).toFixed(1));
          s.mvpPoints += b.runs + b.fours * 0.5 + b.sixes * 1.5;
        }
        stats[b.playerId] = s;
      });

      inn.bowlers.forEach(bw => {
        const s = stats[bw.playerId]
          ? { ...stats[bw.playerId] }
          : initStat(bw.playerId, bw.playerName, inn.bowlingFranchiseId, bw.bowlingRole);
        s.oversBowled += bw.overs;
        s.legalBallsBowled += bw.legalBallsBowled;
        s.maidens += bw.maidens;
        s.dotBalls += bw.dots;
        s.runsConceded += bw.runsConceded;
        s.wickets += bw.wickets;

        if (
          bw.wickets > s.bestBowlingWickets ||
          (bw.wickets === s.bestBowlingWickets && bw.runsConceded < s.bestBowlingRuns)
        ) {
          s.bestBowlingWickets = bw.wickets;
          s.bestBowlingRuns = bw.runsConceded;
          s.bestBowlingText = `${bw.wickets}/${bw.runsConceded}`;
        }

        if (bw.wickets === 3) s.threeWicketHauls += 1;
        if (bw.wickets === 4) s.fourWicketHauls += 1;
        if (bw.wickets >= 5) s.fiveWicketHauls += 1;

        s.economy = s.legalBallsBowled > 0 ? Number((s.runsConceded / (s.legalBallsBowled / 6)).toFixed(2)) : 0;
        s.bowlingAverage = s.wickets > 0 ? Number((s.runsConceded / s.wickets).toFixed(1)) : 0;
        s.bowlingStrikeRate = s.wickets > 0 ? Number((s.legalBallsBowled / s.wickets).toFixed(1)) : 0;
        s.mvpPoints += bw.wickets * 25 + bw.maidens * 10 + bw.dots * 0.5;
        stats[bw.playerId] = s;
      });
    });

    return stats;
  },
};
