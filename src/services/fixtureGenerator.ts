/**
 * WICKET DYNASTY - Official Fixture & Tournament Schedule Generator (Phase 04)
 * Official IPL 10-Team Format:
 * - 2 Groups of 5
 * - 4 Intra-group matches + 10 Cross-group matches (Home & Away) = 14 matches per team
 * - 70 League Matches across 14 Rounds (5 matches per round)
 * - 4 Playoff Matches (Qualifier 1, Eliminator, Qualifier 2, Final)
 * - 74 Total Matches
 */
import { FRANCHISES } from '../data/franchises';
import { Fixture, PointsTableEntry, TournamentState } from '../types/tournament';

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class FixtureGenerator {
  /**
   * Generate official 74-match T20 schedule (70 League + 4 Playoffs)
   */
  static generateSchedule(seasonYear: number = 2026): TournamentState {
    const franchises = FRANCHISES;
    const fixtures: Fixture[] = [];

    // Group A (5 teams) and Group B (5 teams)
    const groupA = franchises.slice(0, 5); // CSK, MI, KKR, RR, DC
    const groupB = franchises.slice(5, 10); // RCB/BLR, GT, LSG, PBKS, SRH

    interface Edge {
      homeId: string;
      awayId: string;
    }

    const allLeagueEdges: Edge[] = [];

    // 1. Intra-group matches for Group A (10 matches: each pair plays once)
    for (let i = 0; i < groupA.length; i++) {
      for (let j = i + 1; j < groupA.length; j++) {
        const isEven = (i + j) % 2 === 0;
        allLeagueEdges.push({
          homeId: isEven ? groupA[i].id : groupA[j].id,
          awayId: isEven ? groupA[j].id : groupA[i].id,
        });
      }
    }

    // 2. Intra-group matches for Group B (10 matches: each pair plays once)
    for (let i = 0; i < groupB.length; i++) {
      for (let j = i + 1; j < groupB.length; j++) {
        const isEven = (i + j) % 2 === 0;
        allLeagueEdges.push({
          homeId: isEven ? groupB[i].id : groupB[j].id,
          awayId: isEven ? groupB[j].id : groupB[i].id,
        });
      }
    }

    // 3. Cross-group matches (50 matches: each Group A team plays each Group B team twice, Home & Away)
    for (const teamA of groupA) {
      for (const teamB of groupB) {
        allLeagueEdges.push({ homeId: teamA.id, awayId: teamB.id });
        allLeagueEdges.push({ homeId: teamB.id, awayId: teamA.id });
      }
    }

    // Organize 70 matches into 14 rounds of 5 matches each
    const rounds: Edge[][] = Array.from({ length: 14 }, () => []);
    const remainingEdges = [...allLeagueEdges];

    for (let r = 0; r < 14; r++) {
      const usedInRound = new Set<string>();
      let attempts = 0;

      while (rounds[r].length < 5 && attempts < remainingEdges.length) {
        const edgeIdx = remainingEdges.findIndex(
          e => !usedInRound.has(e.homeId) && !usedInRound.has(e.awayId)
        );

        if (edgeIdx !== -1) {
          const [edge] = remainingEdges.splice(edgeIdx, 1);
          rounds[r].push(edge);
          usedInRound.add(edge.homeId);
          usedInRound.add(edge.awayId);
        } else {
          break;
        }
        attempts++;
      }
    }

    while (remainingEdges.length > 0) {
      const edge = remainingEdges.pop()!;
      let targetRound = rounds.findIndex(r => r.length < 5);
      if (targetRound === -1) targetRound = remainingEdges.length % 14;
      rounds[targetRound].push(edge);
    }

    // Baseline calendar start: March 28
    const baseDate = new Date(seasonYear, 2, 28);
    let matchNumber = 1;

    for (let r = 0; r < 14; r++) {
      const roundMatches = rounds[r];
      for (let m = 0; m < roundMatches.length; m++) {
        const edge = roundMatches[m];
        const homeTeam = franchises.find(f => f.id === edge.homeId)!;
        const awayTeam = franchises.find(f => f.id === edge.awayId)!;

        const matchDate = new Date(baseDate);
        matchDate.setDate(baseDate.getDate() + r * 4 + Math.floor(m / 2));
        const dateStr = matchDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        });

        fixtures.push({
          fixtureId: `fix_${matchNumber}`,
          competitionId: 'IPL',
          matchNumber: matchNumber++,
          roundNumber: r + 1,
          playoffStage: 'NONE',
          dateStr,
          matchDateIso: toIsoDate(matchDate),
          venue: homeTeam.homeStadium,
          homeFranchiseId: homeTeam.id,
          awayFranchiseId: awayTeam.id,
          isCompleted: false,
        });
      }
    }

    // 4. Playoffs (Matches 71, 72, 73, 74)
    const playoffBaseDate = new Date(baseDate);
    playoffBaseDate.setDate(baseDate.getDate() + 58); // Late May

    // Match 71: Qualifier 1 (Rank 1 vs Rank 2)
    const q1Date = new Date(playoffBaseDate);
    fixtures.push({
      fixtureId: `fix_71`,
      competitionId: 'IPL',
      matchNumber: 71,
      roundNumber: 15,
      playoffStage: 'QUALIFIER_1',
      dateStr: q1Date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      matchDateIso: toIsoDate(q1Date),
      venue: 'Narendra Modi Stadium, Ahmedabad',
      homeFranchiseId: 'TBD_1',
      awayFranchiseId: 'TBD_2',
      isCompleted: false,
    });

    // Match 72: Eliminator (Rank 3 vs Rank 4)
    const elimDate = new Date(playoffBaseDate);
    elimDate.setDate(playoffBaseDate.getDate() + 1);
    fixtures.push({
      fixtureId: `fix_72`,
      competitionId: 'IPL',
      matchNumber: 72,
      roundNumber: 15,
      playoffStage: 'ELIMINATOR',
      dateStr: elimDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      matchDateIso: toIsoDate(elimDate),
      venue: 'Narendra Modi Stadium, Ahmedabad',
      homeFranchiseId: 'TBD_3',
      awayFranchiseId: 'TBD_4',
      isCompleted: false,
    });

    // Match 73: Qualifier 2 (Loser Q1 vs Winner Elim)
    const q2Date = new Date(playoffBaseDate);
    q2Date.setDate(playoffBaseDate.getDate() + 3);
    fixtures.push({
      fixtureId: `fix_73`,
      competitionId: 'IPL',
      matchNumber: 73,
      roundNumber: 15,
      playoffStage: 'QUALIFIER_2',
      dateStr: q2Date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      matchDateIso: toIsoDate(q2Date),
      venue: 'M. A. Chidambaram Stadium, Chennai',
      homeFranchiseId: 'TBD_LQ1',
      awayFranchiseId: 'TBD_WELIM',
      isCompleted: false,
    });

    // Match 74: Final (Winner Q1 vs Winner Q2)
    const finalDate = new Date(playoffBaseDate);
    finalDate.setDate(playoffBaseDate.getDate() + 5);
    fixtures.push({
      fixtureId: `fix_74`,
      competitionId: 'IPL',
      matchNumber: 74,
      roundNumber: 15,
      playoffStage: 'FINAL',
      dateStr: finalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      matchDateIso: toIsoDate(finalDate),
      venue: 'M. A. Chidambaram Stadium, Chennai',
      homeFranchiseId: 'TBD_WQ1',
      awayFranchiseId: 'TBD_WQ2',
      isCompleted: false,
    });

    // Initial Points Table for all 10 teams
    const pointsTable: PointsTableEntry[] = franchises.map(f => ({
      franchiseId: f.id,
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      points: 0,
      netRunRate: 0.0,
      runsScored: 0,
      legalBallsFaced: 0,
      runsConceded: 0,
      legalBallsBowled: 0,
      form: [],
    }));

    return {
      tournamentId: `trn_IPL_${seasonYear}`,
      leagueId: 'IPL',
      name: 'Indian Premier League',
      country: 'India',
      seasonYear,
      startDateIso: toIsoDate(baseDate),
      endDateIso: toIsoDate(finalDate),
      currentRound: 1,
      totalLeagueMatches: 70,
      totalPlayoffMatches: 4,
      fixtures,
      currentFixtureIndex: 0,
      pointsTable,
      playerStats: {},
      playoffs: {
        qualifier1FixtureId: 'fix_71',
        eliminatorFixtureId: 'fix_72',
        qualifier2FixtureId: 'fix_73',
        finalFixtureId: 'fix_74',
      },
    };
  }
}
