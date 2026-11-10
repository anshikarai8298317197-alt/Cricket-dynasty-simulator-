/**
 * WICKET DYNASTY - Tournament Engine & Standings Calculator (Phase 04)
 * Precise NRR, Playoff Progression, Leaderboards & Standings Ranking
 */
import {
  Fixture,
  PointsTableEntry,
  TournamentLeaderboards,
  TournamentState,
  PlayerTournamentStats,
} from '../types/tournament';
import { MatchResultDetails } from '../types/match';
import { Player } from '../types/player';
import { CricketMatchEngine } from './cricketMatchEngine';
import { FRANCHISES } from '../data/franchises';

export class TournamentEngine {
  /**
   * Record completed match result and atomically update points table, NRR, and player statistics
   */
  static recordMatchResult(tournament: TournamentState, result: MatchResultDetails): TournamentState {
    const updated = JSON.parse(JSON.stringify(tournament)) as TournamentState;
    const fixture = updated.fixtures.find(f => f.fixtureId === result.fixtureId);
    if (!fixture) return tournament;

    // Prevent duplicate processing
    if (fixture.isCompleted) {
      console.warn(`Fixture ${result.fixtureId} is already marked as completed. Skipping duplicate update.`);
      return tournament;
    }

    // 1. Update Fixture
    fixture.isCompleted = true;
    fixture.homeScore = {
      runs: result.homeFranchiseId === result.innings1.battingFranchiseId ? result.innings1.totalRuns : result.innings2.totalRuns,
      wickets: result.homeFranchiseId === result.innings1.battingFranchiseId ? result.innings1.totalWickets : result.innings2.totalWickets,
      oversDisplay: result.homeFranchiseId === result.innings1.battingFranchiseId ? result.innings1.oversDisplay : result.innings2.oversDisplay,
      ballsFaced: result.homeFranchiseId === result.innings1.battingFranchiseId ? result.innings1.legalBallsFaced : result.innings2.legalBallsFaced,
    };
    fixture.awayScore = {
      runs: result.awayFranchiseId === result.innings1.battingFranchiseId ? result.innings1.totalRuns : result.innings2.totalRuns,
      wickets: result.awayFranchiseId === result.innings1.battingFranchiseId ? result.innings1.totalWickets : result.innings2.totalWickets,
      oversDisplay: result.awayFranchiseId === result.innings1.battingFranchiseId ? result.innings1.oversDisplay : result.innings2.oversDisplay,
      ballsFaced: result.awayFranchiseId === result.innings1.battingFranchiseId ? result.innings1.legalBallsFaced : result.innings2.legalBallsFaced,
    };
    fixture.winnerFranchiseId = result.winnerFranchiseId;
    fixture.resultDescription = result.marginDescription;
    fixture.playerOfTheMatchName = result.playerOfTheMatch.playerName;
    fixture.matchDetailsId = result.matchId;

    // 2. Update Points Table (Only for League matches)
    if (fixture.playoffStage === 'NONE') {
      const homeEntry = updated.pointsTable.find(e => e.franchiseId === result.homeFranchiseId);
      const awayEntry = updated.pointsTable.find(e => e.franchiseId === result.awayFranchiseId);

      if (homeEntry && awayEntry) {
        homeEntry.played += 1;
        awayEntry.played += 1;

        if (result.winnerFranchiseId === homeEntry.franchiseId) {
          homeEntry.won += 1;
          homeEntry.points += 2;
          homeEntry.form = ['W', ...(homeEntry.form || [])].slice(0, 5) as ('W' | 'L' | 'T' | 'NR')[];
          awayEntry.lost += 1;
          awayEntry.form = ['L', ...(awayEntry.form || [])].slice(0, 5) as ('W' | 'L' | 'T' | 'NR')[];
        } else if (result.winnerFranchiseId === awayEntry.franchiseId) {
          awayEntry.won += 1;
          awayEntry.points += 2;
          awayEntry.form = ['W', ...(awayEntry.form || [])].slice(0, 5) as ('W' | 'L' | 'T' | 'NR')[];
          homeEntry.lost += 1;
          homeEntry.form = ['L', ...(homeEntry.form || [])].slice(0, 5) as ('W' | 'L' | 'T' | 'NR')[];
        } else {
          // Tie / No Result
          homeEntry.tied += 1;
          awayEntry.tied += 1;
          homeEntry.points += 1;
          awayEntry.points += 1;
          homeEntry.form = ['T', ...(homeEntry.form || [])].slice(0, 5) as ('W' | 'L' | 'T' | 'NR')[];
          awayEntry.form = ['T', ...(awayEntry.form || [])].slice(0, 5) as ('W' | 'L' | 'T' | 'NR')[];
        }

        // Legal overs & NRR accumulation
        // Official T20 Playing conditions: All out is credited as full 20.0 overs (120 legal balls)
        const inn1Balls = result.innings1.isAllOut ? 120 : result.innings1.legalBallsFaced;
        const inn2Balls = result.innings2.isAllOut ? 120 : result.innings2.legalBallsFaced;

        const inn1BatEntry = result.innings1.battingFranchiseId === homeEntry.franchiseId ? homeEntry : awayEntry;
        const inn1BowlEntry = result.innings1.battingFranchiseId === homeEntry.franchiseId ? awayEntry : homeEntry;

        inn1BatEntry.runsScored += result.innings1.totalRuns;
        inn1BatEntry.legalBallsFaced += inn1Balls;
        inn1BowlEntry.runsConceded += result.innings1.totalRuns;
        inn1BowlEntry.legalBallsBowled += inn1Balls;

        const inn2BatEntry = result.innings2.battingFranchiseId === homeEntry.franchiseId ? homeEntry : awayEntry;
        const inn2BowlEntry = result.innings2.battingFranchiseId === homeEntry.franchiseId ? awayEntry : homeEntry;

        inn2BatEntry.runsScored += result.innings2.totalRuns;
        inn2BatEntry.legalBallsFaced += inn2Balls;
        inn2BowlEntry.runsConceded += result.innings2.totalRuns;
        inn2BowlEntry.legalBallsBowled += inn2Balls;

        // Recalculate NRR for both teams
        [homeEntry, awayEntry].forEach(entry => {
          const runRateScored = entry.legalBallsFaced > 0 ? entry.runsScored / (entry.legalBallsFaced / 6) : 0;
          const runRateConceded = entry.legalBallsBowled > 0 ? entry.runsConceded / (entry.legalBallsBowled / 6) : 0;
          entry.netRunRate = Number((runRateScored - runRateConceded).toFixed(3));
        });
      }

      // Sort Points Table: Points DESC -> NRR DESC -> Wins DESC
      updated.pointsTable.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.netRunRate !== a.netRunRate) return b.netRunRate - a.netRunRate;
        return b.won - a.won;
      });
    }

    // 3. Update Player Tournament Stats
    if (!updated.playerStats) updated.playerStats = {};

    // Award POTM count
    if (result.playerOfTheMatch && result.playerOfTheMatch.playerId) {
      const potmId = result.playerOfTheMatch.playerId;
      if (!updated.playerStats[potmId]) {
        updated.playerStats[potmId] = this.initPlayerStat(
          potmId,
          result.playerOfTheMatch.playerName,
          result.winnerFranchiseId || result.homeFranchiseId,
          'Player'
        );
      }
      updated.playerStats[potmId].playerOfTheMatchAwards += 1;
    }

    [result.innings1, result.innings2].forEach(inn => {
      inn.batters.forEach(b => {
        if (!updated.playerStats[b.playerId]) {
          updated.playerStats[b.playerId] = this.initPlayerStat(b.playerId, b.playerName, inn.battingFranchiseId, 'Batter');
        }
        const s = updated.playerStats[b.playerId];
        s.matches += 1;
        if (b.balls > 0 || b.isOut) {
          s.innings += 1;
          s.runs += b.runs;
          s.ballsFaced += b.balls;
          s.fours += b.fours;
          s.sixes += b.sixes;
          s.boundaries += (b.fours + b.sixes);
          if (!b.isOut) s.notOuts += 1;
          if (b.runs > s.highestScore) s.highestScore = b.runs;
          if (b.runs >= 100) s.hundreds += 1;
          else if (b.runs >= 50) s.fifties += 1;

          s.strikeRate = s.ballsFaced > 0 ? Number(((s.runs / s.ballsFaced) * 100).toFixed(1)) : 0;
          const dismissals = Math.max(1, s.innings - s.notOuts);
          s.battingAverage = Number((s.runs / dismissals).toFixed(1));
          s.mvpPoints += b.runs * 1.0 + b.fours * 0.5 + b.sixes * 1.5;
        }
      });

      inn.bowlers.forEach(bw => {
        if (!updated.playerStats[bw.playerId]) {
          updated.playerStats[bw.playerId] = this.initPlayerStat(bw.playerId, bw.playerName, inn.bowlingFranchiseId, bw.bowlingRole);
        }
        const s = updated.playerStats[bw.playerId];
        s.oversBowled += bw.overs;
        s.legalBallsBowled += bw.legalBallsBowled;
        s.maidens += bw.maidens;
        s.dotBalls += bw.dots;
        s.runsConceded += bw.runsConceded;
        s.wickets += bw.wickets;

        if (bw.wickets > s.bestBowlingWickets || (bw.wickets === s.bestBowlingWickets && bw.runsConceded < s.bestBowlingRuns)) {
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
      });
    });

    // 4. Playoff Progression Check
    this.evaluatePlayoffProgression(updated);

    return updated;
  }

  /**
   * Check and populate playoff fixtures when respective prerequisite rounds finish
   */
  private static evaluatePlayoffProgression(tournament: TournamentState) {
    const leagueCompleted = tournament.fixtures.filter(f => f.playoffStage === 'NONE').every(f => f.isCompleted);
    if (!leagueCompleted) return;

    const rank1 = tournament.pointsTable[0]?.franchiseId;
    const rank2 = tournament.pointsTable[1]?.franchiseId;
    const rank3 = tournament.pointsTable[2]?.franchiseId;
    const rank4 = tournament.pointsTable[3]?.franchiseId;

    const q1 = tournament.fixtures.find(f => f.playoffStage === 'QUALIFIER_1');
    const elim = tournament.fixtures.find(f => f.playoffStage === 'ELIMINATOR');
    const q2 = tournament.fixtures.find(f => f.playoffStage === 'QUALIFIER_2');
    const finalMatch = tournament.fixtures.find(f => f.playoffStage === 'FINAL');

    // Populate Qualifier 1 and Eliminator
    if (q1 && q1.homeFranchiseId === 'TBD_1' && rank1 && rank2) {
      q1.homeFranchiseId = rank1;
      q1.awayFranchiseId = rank2;
    }
    if (elim && elim.homeFranchiseId === 'TBD_3' && rank3 && rank4) {
      elim.homeFranchiseId = rank3;
      elim.awayFranchiseId = rank4;
    }

    // Populate Qualifier 2
    if (q1?.isCompleted && elim?.isCompleted && q2 && q2.homeFranchiseId === 'TBD_LQ1') {
      const loserQ1 = q1.winnerFranchiseId === q1.homeFranchiseId ? q1.awayFranchiseId : q1.homeFranchiseId;
      const winnerElim = elim.winnerFranchiseId!;
      q2.homeFranchiseId = loserQ1;
      q2.awayFranchiseId = winnerElim;
    }

    // Populate Final
    if (q1?.isCompleted && q2?.isCompleted && finalMatch && finalMatch.homeFranchiseId === 'TBD_WQ1') {
      const winnerQ1 = q1.winnerFranchiseId!;
      const winnerQ2 = q2.winnerFranchiseId!;
      finalMatch.homeFranchiseId = winnerQ1;
      finalMatch.awayFranchiseId = winnerQ2;
    }

    // Set Champion
    if (finalMatch?.isCompleted && finalMatch.winnerFranchiseId) {
      tournament.playoffs.championFranchiseId = finalMatch.winnerFranchiseId;
      tournament.playoffs.runnerUpFranchiseId =
        finalMatch.winnerFranchiseId === finalMatch.homeFranchiseId
          ? finalMatch.awayFranchiseId
          : finalMatch.homeFranchiseId;
    }
  }

  /**
   * Automatically simulate all intervening unplayed fixtures chronologically up to a given match number
   */
  static simulateInterveningFixtures(
    tournament: TournamentState,
    upToMatchNumber: number,
    allPlayers: Player[],
    allFranchiseSquads?: Record<string, string[]>
  ): TournamentState {
    let current = tournament;

    // Filter uncompleted fixtures strictly before upToMatchNumber, ordered by matchNumber
    const pendingFixtures = current.fixtures
      .filter(f => !f.isCompleted && f.matchNumber < upToMatchNumber)
      .sort((a, b) => a.matchNumber - b.matchNumber);

    for (const fix of pendingFixtures) {
      // Skip if teams not determined yet (e.g. unseeded playoffs)
      if (fix.homeFranchiseId.startsWith('TBD') || fix.awayFranchiseId.startsWith('TBD')) continue;

      const simResult = this.simulateAiFixture(fix, allPlayers, current, allFranchiseSquads);
      current = this.recordMatchResult(current, simResult);
    }

    return current;
  }

  /**
   * Fast simulate an AI fixture
   */
  static simulateAiFixture(
    fixture: Fixture,
    allPlayers: Player[],
    tournament: TournamentState,
    allFranchiseSquads?: Record<string, string[]>
  ): MatchResultDetails {
    // Determine playing XI for home and away
    const homeRosterIds = allFranchiseSquads?.[fixture.homeFranchiseId] || [];
    const awayRosterIds = allFranchiseSquads?.[fixture.awayFranchiseId] || [];

    const homeXi = homeRosterIds.length >= 11
      ? homeRosterIds.map(id => allPlayers.find(p => p.id === id)).filter(Boolean) as Player[]
      : allPlayers.filter(p => p.originalFranchiseId === fixture.homeFranchiseId);

    const awayXi = awayRosterIds.length >= 11
      ? awayRosterIds.map(id => allPlayers.find(p => p.id === id)).filter(Boolean) as Player[]
      : allPlayers.filter(p => p.originalFranchiseId === fixture.awayFranchiseId);

    const matchResult = CricketMatchEngine.simulateMatch({
      matchId: `mat_${fixture.fixtureId}_${Date.now()}`,
      fixtureId: fixture.fixtureId,
      homeFranchiseId: fixture.homeFranchiseId,
      awayFranchiseId: fixture.awayFranchiseId,
      homePlayingXi: homeXi.length >= 11 ? homeXi.slice(0, 11) : allPlayers.slice(0, 11),
      awayPlayingXi: awayXi.length >= 11 ? awayXi.slice(0, 11) : allPlayers.slice(11, 22),
    });

    return matchResult;
  }

  /**
   * Extract comprehensive tournament leaderboards (Orange Cap, Purple Cap, MVP, Fielding, All-Rounders, etc.)
   */
  static getLeaderboards(tournament: TournamentState): TournamentLeaderboards {
    const all = Object.values(tournament.playerStats || {});

    // Batting
    const orangeCap = [...all].sort((a, b) => b.runs - a.runs).slice(0, 10);
    const highestAverage = all
      .filter(p => p.ballsFaced >= 30)
      .sort((a, b) => b.battingAverage - a.battingAverage)
      .slice(0, 10);
    const highestStrikeRate = all
      .filter(p => p.ballsFaced >= 30)
      .sort((a, b) => b.strikeRate - a.strikeRate)
      .slice(0, 10);
    const mostSixes = [...all].sort((a, b) => b.sixes - a.sixes).slice(0, 10);
    const mostFours = [...all].sort((a, b) => b.fours - a.fours).slice(0, 10);
    const mostBoundaries = [...all].sort((a, b) => b.boundaries - a.boundaries).slice(0, 10);
    const mostFifties = [...all].sort((a, b) => b.fifties - a.fifties).slice(0, 10);
    const mostHundreds = [...all].sort((a, b) => b.hundreds - a.hundreds).slice(0, 10);
    const highestScore = [...all].sort((a, b) => b.highestScore - a.highestScore).slice(0, 10);
    const mostNotOuts = [...all].sort((a, b) => b.notOuts - a.notOuts).slice(0, 10);

    // Bowling
    const purpleCap = [...all]
      .sort((a, b) => (b.wickets !== a.wickets ? b.wickets - a.wickets : a.economy - b.economy))
      .slice(0, 10);
    const bestEconomy = all
      .filter(p => p.oversBowled >= 6)
      .sort((a, b) => a.economy - b.economy)
      .slice(0, 10);
    const bestBowlingAverage = all
      .filter(p => p.wickets >= 3)
      .sort((a, b) => a.bowlingAverage - b.bowlingAverage)
      .slice(0, 10);
    const bestBowlingStrikeRate = all
      .filter(p => p.wickets >= 3)
      .sort((a, b) => a.bowlingStrikeRate - b.bowlingStrikeRate)
      .slice(0, 10);
    const mostDotBalls = [...all].sort((a, b) => b.dotBalls - a.dotBalls).slice(0, 10);
    const mostMaidens = [...all].sort((a, b) => b.maidens - a.maidens).slice(0, 10);
    const bestFigures = [...all]
      .sort((a, b) => (b.bestBowlingWickets !== a.bestBowlingWickets ? b.bestBowlingWickets - a.bestBowlingWickets : a.bestBowlingRuns - b.bestBowlingRuns))
      .slice(0, 10);
    const mostThreeWicketHauls = [...all].sort((a, b) => b.threeWicketHauls - a.threeWicketHauls).slice(0, 10);
    const mostFourWicketHauls = [...all].sort((a, b) => b.fourWicketHauls - a.fourWicketHauls).slice(0, 10);
    const mostFiveWicketHauls = [...all].sort((a, b) => b.fiveWicketHauls - a.fiveWicketHauls).slice(0, 10);

    // Fielding
    const mostCatches = [...all].sort((a, b) => b.catches - a.catches).slice(0, 10);
    const mostRunOuts = [...all].sort((a, b) => b.runOuts - a.runOuts).slice(0, 10);
    const mostStumpings = [...all].sort((a, b) => b.stumpings - a.stumpings).slice(0, 10);
    const mostDismissals = [...all].sort((a, b) => b.totalDismissals - a.totalDismissals).slice(0, 10);

    // Awards
    const mvpRace = [...all].sort((a, b) => b.mvpPoints - a.mvpPoints).slice(0, 10);
    const playerOfTheMatchRace = [...all].sort((a, b) => b.playerOfTheMatchAwards - a.playerOfTheMatchAwards).slice(0, 10);
    const bestAllRounder = all
      .filter(p => p.runs >= 40 || p.wickets >= 2)
      .sort((a, b) => (b.runs * 1.0 + b.wickets * 25) - (a.runs * 1.0 + a.wickets * 25))
      .slice(0, 10);
    const emergingPlayer = all
      .filter(p => p.isEmergingPlayer)
      .sort((a, b) => b.mvpPoints - a.mvpPoints)
      .slice(0, 10);
    const mostConsistent = all
      .filter(p => p.matches >= 3)
      .sort((a, b) => b.battingAverage - a.battingAverage)
      .slice(0, 10);

    return {
      orangeCap,
      highestAverage,
      highestStrikeRate,
      mostSixes,
      mostFours,
      mostBoundaries,
      mostFifties,
      mostHundreds,
      highestScore,
      mostNotOuts,
      purpleCap,
      bestEconomy,
      bestBowlingAverage,
      bestBowlingStrikeRate,
      mostDotBalls,
      mostMaidens,
      bestFigures,
      mostThreeWicketHauls,
      mostFourWicketHauls,
      mostFiveWicketHauls,
      mostCatches,
      mostRunOuts,
      mostStumpings,
      mostDismissals,
      mvpRace,
      playerOfTheMatchRace,
      bestAllRounder,
      emergingPlayer,
      mostConsistent,
    };
  }

  private static initPlayerStat(
    playerId: string,
    playerName: string,
    franchiseId: string,
    role: string
  ): PlayerTournamentStats {
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
}
