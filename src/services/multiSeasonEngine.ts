/**
 * WICKET DYNASTY - Multi-Season Progression Engine (Phase 06)
 * Season Transitions, Financial Consolidation, Trophy Awards & Hall of Fame
 */
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import { TournamentState } from '../types/tournament';
import { ClubEngine } from './clubEngine';
import { FixtureGenerator } from './fixtureGenerator';
import { TournamentEngine } from './tournamentEngine';
import { SeasonHistoryEntry } from '../types/club';

export class MultiSeasonEngine {
  /**
   * Finalizes the current completed season and transitions to the next season
   */
  static advanceToNextSeason(
    career: CareerSave,
    tournament: TournamentState,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    retiredPlayers: Player[];
    seasonSummary: SeasonHistoryEntry;
  } {
    const currentSeasonNum = career.currentSeason;
    const seasonYear = tournament.seasonYear || 2026;
    const leaderboards = TournamentEngine.getLeaderboards(tournament);

    const championId = tournament.playoffs?.championFranchiseId || tournament.pointsTable[0]?.franchiseId || 'CSK';
    const runnerUpId = tournament.playoffs?.runnerUpFranchiseId || tournament.pointsTable[1]?.franchiseId || 'MI';

    const userEntry = tournament.pointsTable.find(p => p.franchiseId === career.franchiseId);
    const userRank = tournament.pointsTable.findIndex(p => p.franchiseId === career.franchiseId) + 1;
    const isUserChampion = championId === career.franchiseId;

    // 1. Process Season Finances
    const { updatedCareer: careerWithFinances, netProfitCr } = ClubEngine.processSeasonFinances(
      career,
      isUserChampion ? 1 : userRank
    );

    // 2. Age Players & Process Retirements
    const { updatedCareer: careerWithAging, retiredPlayers } = ClubEngine.agePlayersAndCheckRetirement(
      careerWithFinances,
      allPlayers
    );

    // 3. Compile Season History Record
    const seasonSummary: SeasonHistoryEntry = {
      seasonNumber: currentSeasonNum,
      year: seasonYear,
      championFranchiseId: championId,
      runnerUpFranchiseId: runnerUpId,
      userFinishPosition: isUserChampion ? 1 : userRank,
      userMatchesWon: userEntry?.won || 0,
      userMatchesLost: userEntry?.lost || 0,
      orangeCapWinner: {
        name: leaderboards.orangeCap[0]?.playerName || 'Virat Kohli',
        runs: leaderboards.orangeCap[0]?.runs || 740,
        franchiseId: leaderboards.orangeCap[0]?.franchiseId || 'RCB',
      },
      purpleCapWinner: {
        name: leaderboards.purpleCap[0]?.playerName || 'Jasprit Bumrah',
        wickets: leaderboards.purpleCap[0]?.wickets || 26,
        franchiseId: leaderboards.purpleCap[0]?.franchiseId || 'MI',
      },
      mvpWinner: {
        name: leaderboards.mvpRace[0]?.playerName || 'Hardik Pandya',
        points: Math.round(leaderboards.mvpRace[0]?.mvpPoints || 450),
        franchiseId: leaderboards.mvpRace[0]?.franchiseId || 'MI',
      },
      seasonNetProfitCr: netProfitCr,
    };

    // 4. Generate Fresh Tournament for Next Season
    const nextSeasonYear = seasonYear + 1;
    const nextTournament = FixtureGenerator.generateSchedule(nextSeasonYear);

    // 5. Refresh Youth Prospects in Academy
    const currentProfile = careerWithAging.clubProfile;
    const newProspects = [
      ClubEngine.generateYouthProspect(currentProfile.academyLevel, nextSeasonYear, undefined, career.franchiseId),
      ClubEngine.generateYouthProspect(currentProfile.academyLevel, nextSeasonYear, undefined, career.franchiseId),
    ];

    const updatedProfile = {
      ...currentProfile,
      seasonHistory: [seasonSummary, ...(currentProfile.seasonHistory || [])],
      youthProspects: [...currentProfile.youthProspects, ...newProspects].slice(0, 8),
    };

    // 6. Update Stats Summary only if not already live-tracked via recordedMatchIds
    const hasLiveTracking = Boolean(career.recordedMatchIds && career.recordedMatchIds.length > 0);
    const updatedStats = hasLiveTracking
      ? {
          ...career.statsSummary,
          trophies: Math.max(
            career.statsSummary.trophies,
            (career.trophiesCollected || []).length
          ),
        }
      : {
          ...career.statsSummary,
          matchesPlayed: career.statsSummary.matchesPlayed + (userEntry?.played || 14),
          matchesWon: career.statsSummary.matchesWon + (userEntry?.won || 7),
          matchesLost: career.statsSummary.matchesLost + (userEntry?.lost || 7),
          trophies: career.statsSummary.trophies + (isUserChampion ? 1 : 0),
        };

    const finalCareer: CareerSave = {
      ...careerWithAging,
      currentSeason: currentSeasonNum + 1,
      currentGameYear: nextSeasonYear,
      seasonPhase: career.squadMode === 'Auction Mode' ? 'Retentions' : 'SEASON_ACTIVE',
      tournament: nextTournament,
      clubProfile: updatedProfile,
      statsSummary: updatedStats,
      trophiesCollected: career.trophiesCollected || [],
      unlockedAchievementIds: career.unlockedAchievementIds || [],
      matchHistory: career.matchHistory || [],
      recordedMatchIds: career.recordedMatchIds || [],
      lastPlayedAt: Date.now(),
    };

    return {
      updatedCareer: finalCareer,
      retiredPlayers,
      seasonSummary,
    };
  }
}
