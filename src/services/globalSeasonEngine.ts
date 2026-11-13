/**
 * WICKET DYNASTY - Global Year-Round Season, Multi-League & Champions League Engine
 * Manages all 8 domestic T20 leagues, Page Playoffs, Global Champions League T20,
 * full-year calendar progression, trophy awards, match history & save integrity.
 */
import {
  DEFAULT_GCL_SLOTS,
  DOMESTIC_LEAGUES,
  getGlobalTeamById,
  getLeagueDefinition,
  getTeamsByLeague,
} from '../data/globalLeagues';
import { CareerSave } from '../types/career';
import {
  CareerTrophy,
  CompetitionId,
  DomesticLeagueId,
  GCLGroup,
  GCLQualificationSlotConfig,
  GCLQualifiedParticipant,
  GCLState,
  MatchHistoryEntry,
  WorldSeasonState,
} from '../types/globalSeason';
import { MatchResultDetails } from '../types/match';
import { Player } from '../types/player';
import { Fixture, PointsTableEntry, TournamentState } from '../types/tournament';
import { DbPersistence } from './dbPersistence';
import { FixtureGenerator } from './fixtureGenerator';
import { MilestoneEventResult, processGlobalMatchResultHelpers } from './globalSeasonHelpers';
import { MilestoneService, PlayerMilestoneEvent } from './milestoneService';
import { MultiSeasonEngine } from './multiSeasonEngine';
import { evaluateCareerAchievements } from './careerAchievements';

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  return toIsoDate(dt);
}

export function formatShortDateFromIso(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
}

export function daysBetweenIso(startIso: string, endIso: string): number {
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const s = new Date(sy, sm - 1, sd).getTime();
  const e = new Date(ey, em - 1, ed).getTime();
  return Math.max(0, Math.round((e - s) / 86400000));
}

function makeEmptyPointsEntry(franchiseId: string): PointsTableEntry {
  return {
    franchiseId,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    noResult: 0,
    points: 0,
    netRunRate: 0,
    runsScored: 0,
    legalBallsFaced: 0,
    runsConceded: 0,
    legalBallsBowled: 0,
    form: [],
  };
}

export type CareerPhaseKey =
  | 'EMPTY_SQUAD'
  | 'USER_MATCH_READY'
  | 'WAITING_IPL_AI_LEAGUE'
  | 'WAITING_IPL_PLAYOFFS'
  | 'IPL_COMPLETE_READY_FOR_GCL'
  | 'WAITING_GCL_AI'
  | 'SEASON_COMPLETE';

export interface CareerPhaseProgress {
  phaseKey: CareerPhaseKey;
  competitionId: CompetitionId;
  stageBadge: string;
  headline: string;
  subtext: string;
  userFixture?: Fixture;
  nextAiFixture?: Fixture;
  daysUntilUserMatch: number;
  userIplRank: number;
  iplCompletedMatches: number;
  iplTotalLeagueMatches: number;
  iplChampionId?: string;
  gclChampionId?: string;
}

export class GlobalSeasonEngine {
  /**
   * Returns active in-progress fixture ID that must NEVER be auto-simulated
   */
  static getActiveProtectedFixtureId(): string | null {
    const active = DbPersistence.getActiveLiveMatch();
    if (!active || active.status === 'COMPLETED') return null;
    return active.fixtureId || null;
  }

  /**
   * Generate full fixture schedule + Page Playoffs for any of the 8 domestic T20 leagues
   */
  static generateDomesticLeagueSchedule(leagueId: DomesticLeagueId, seasonYear: number): TournamentState {
    if (leagueId === 'IPL') {
      return FixtureGenerator.generateSchedule(seasonYear);
    }

    const def = getLeagueDefinition(leagueId);
    const teams = getTeamsByLeague(leagueId);
    const startIso = toIsoDate(new Date(seasonYear, def.startMonth - 1, def.startDay));
    const endIso = toIsoDate(new Date(seasonYear, def.endMonth - 1, def.endDay));
    const totalDays = Math.max(18, daysBetweenIso(startIso, endIso));
    const leagueSpanDays = Math.max(12, totalDays - 7);

    // Circle-method round-robin scheduling
    const teamIds = teams.map(t => t.id);
    const n = teamIds.length;
    const rounds: { homeId: string; awayId: string }[][] = [];

    const working = [...teamIds];
    const numSingleRounds = n - 1;
    const legs = n <= 6 ? 2 : 1; // 6-team leagues play double RR (30 matches); 8-team leagues play single RR (28 matches)

    for (let leg = 0; leg < legs; leg++) {
      const rot = [...working];
      for (let r = 0; r < numSingleRounds; r++) {
        const roundPairs: { homeId: string; awayId: string }[] = [];
        for (let i = 0; i < n / 2; i++) {
          const t1 = rot[i];
          const t2 = rot[n - 1 - i];
          const flip = (leg + r + i) % 2 === 1;
          roundPairs.push({
            homeId: flip ? t2 : t1,
            awayId: flip ? t1 : t2,
          });
        }
        rounds.push(roundPairs);
        const last = rot.pop()!;
        rot.splice(1, 0, last);
      }
    }

    const fixtures: Fixture[] = [];
    let matchNumber = 1;
    const totalLeagueMatches = rounds.reduce((acc, r) => acc + r.length, 0);

    rounds.forEach((pairs, rIdx) => {
      pairs.forEach((pair, pIdx) => {
        const homeTeam = getGlobalTeamById(pair.homeId);
        const progress = totalLeagueMatches > 1 ? (matchNumber - 1) / (totalLeagueMatches - 1) : 0;
        const dayOffset = Math.round(progress * leagueSpanDays);
        const matchDateIso = addDaysIso(startIso, dayOffset);

        fixtures.push({
          fixtureId: `${leagueId}_fix_${seasonYear}_${matchNumber}`,
          competitionId: leagueId,
          matchNumber,
          roundNumber: rIdx + 1,
          playoffStage: 'NONE',
          dateStr: formatShortDateFromIso(matchDateIso),
          matchDateIso,
          venue: homeTeam.homeStadium,
          homeFranchiseId: pair.homeId,
          awayFranchiseId: pair.awayId,
          isCompleted: false,
        });
        matchNumber += 1;
        void pIdx;
      });
    });

    // 4-Match Page Playoffs (Q1, Eliminator, Q2, Final)
    const q1Iso = addDaysIso(endIso, -5);
    const elimIso = addDaysIso(endIso, -4);
    const q2Iso = addDaysIso(endIso, -2);
    const finalIso = endIso;
    const playoffVenue = teams[0]?.homeStadium || def.name;

    const q1Id = `${leagueId}_fix_${seasonYear}_${matchNumber}`;
    fixtures.push({
      fixtureId: q1Id,
      competitionId: leagueId,
      matchNumber: matchNumber++,
      roundNumber: rounds.length + 1,
      playoffStage: 'QUALIFIER_1',
      dateStr: formatShortDateFromIso(q1Iso),
      matchDateIso: q1Iso,
      venue: playoffVenue,
      homeFranchiseId: 'TBD_1',
      awayFranchiseId: 'TBD_2',
      isCompleted: false,
    });

    const elimId = `${leagueId}_fix_${seasonYear}_${matchNumber}`;
    fixtures.push({
      fixtureId: elimId,
      competitionId: leagueId,
      matchNumber: matchNumber++,
      roundNumber: rounds.length + 1,
      playoffStage: 'ELIMINATOR',
      dateStr: formatShortDateFromIso(elimIso),
      matchDateIso: elimIso,
      venue: playoffVenue,
      homeFranchiseId: 'TBD_3',
      awayFranchiseId: 'TBD_4',
      isCompleted: false,
    });

    const q2Id = `${leagueId}_fix_${seasonYear}_${matchNumber}`;
    fixtures.push({
      fixtureId: q2Id,
      competitionId: leagueId,
      matchNumber: matchNumber++,
      roundNumber: rounds.length + 1,
      playoffStage: 'QUALIFIER_2',
      dateStr: formatShortDateFromIso(q2Iso),
      matchDateIso: q2Iso,
      venue: playoffVenue,
      homeFranchiseId: 'TBD_LQ1',
      awayFranchiseId: 'TBD_WELIM',
      isCompleted: false,
    });

    const finalId = `${leagueId}_fix_${seasonYear}_${matchNumber}`;
    fixtures.push({
      fixtureId: finalId,
      competitionId: leagueId,
      matchNumber: matchNumber++,
      roundNumber: rounds.length + 1,
      playoffStage: 'FINAL',
      dateStr: formatShortDateFromIso(finalIso),
      matchDateIso: finalIso,
      venue: playoffVenue,
      homeFranchiseId: 'TBD_WQ1',
      awayFranchiseId: 'TBD_WQ2',
      isCompleted: false,
    });

    return {
      tournamentId: `trn_${leagueId}_${seasonYear}`,
      leagueId,
      name: def.name,
      country: def.country,
      seasonYear,
      startDateIso: startIso,
      endDateIso: endIso,
      currentRound: 1,
      totalLeagueMatches,
      totalPlayoffMatches: 4,
      fixtures,
      currentFixtureIndex: 0,
      pointsTable: teams.map(t => makeEmptyPointsEntry(t.id)),
      playerStats: {},
      playoffs: {
        qualifier1FixtureId: q1Id,
        eliminatorFixtureId: elimId,
        qualifier2FixtureId: q2Id,
        finalFixtureId: finalId,
      },
    };
  }

  /**
   * Simulate an entire TournamentState to completion (skipping any active live match)
   */
  static simulateTournamentToCompletion(
    tournament: TournamentState,
    allPlayers: Player[],
    career?: CareerSave | null
  ): TournamentState {
    let current = tournament;
    const protectedId = this.getActiveProtectedFixtureId();

    for (let guard = 0; guard < 120; guard++) {
      const next = current.fixtures.find(
        f =>
          !f.isCompleted &&
          !f.homeFranchiseId.startsWith('TBD') &&
          !f.awayFranchiseId.startsWith('TBD') &&
          f.fixtureId !== protectedId
      );
      if (!next) break;
      const simResult = processGlobalMatchResultHelpers.simulateFixture(next, allPlayers, career);
      current = processGlobalMatchResultHelpers.recordTournamentResult(current, simResult);
    }
    return current;
  }

  /**
   * Backfill matchDateIso / competitionId on a legacy IPL TournamentState if created prior to v2 calendar
   */
  static hydrateLegacyIplTournament(ipl: TournamentState, seasonYear: number): TournamentState {
    const template = FixtureGenerator.generateSchedule(seasonYear);
    const templateById = new Map(template.fixtures.map(f => [f.fixtureId, f]));
    const updatedFixtures = ipl.fixtures.map(f => {
      const tpl = templateById.get(f.fixtureId);
      return {
        ...f,
        competitionId: f.competitionId || 'IPL',
        matchDateIso: f.matchDateIso || tpl?.matchDateIso || `${seasonYear}-04-15`,
      };
    });
    return {
      ...ipl,
      leagueId: 'IPL',
      name: ipl.name === 'T20 Franchise League' ? 'Indian Premier League' : ipl.name,
      country: ipl.country || 'India',
      startDateIso: ipl.startDateIso || template.startDateIso,
      endDateIso: ipl.endDateIso || template.endDateIso,
      fixtures: updatedFixtures,
    };
  }

  /**
   * Build fresh full-year world season covering all 8 domestic leagues
   */
  static initializeWorldSeason(
    seasonYear: number = 2026,
    existingIpl?: TournamentState,
    gclSlots?: GCLQualificationSlotConfig,
    careerStartIso?: string,
    allPlayers?: Player[],
    career?: CareerSave | null
  ): WorldSeasonState {
    const startIso = careerStartIso || `${seasonYear}-03-28`;
    const slotConfig: GCLQualificationSlotConfig = { ...DEFAULT_GCL_SLOTS, ...(gclSlots || {}) };
    const domesticLeagues = {} as Record<DomesticLeagueId, TournamentState>;

    DOMESTIC_LEAGUES.forEach(def => {
      if (def.id === 'IPL' && existingIpl) {
        domesticLeagues.IPL = this.hydrateLegacyIplTournament(existingIpl, seasonYear);
      } else {
        let trn = this.generateDomesticLeagueSchedule(def.id, seasonYear);
        // If career starts after this league's calendar window (e.g., Season 1 starting Mar 28), auto-complete Jan-Mar leagues
        if (allPlayers && trn.endDateIso && trn.endDateIso < startIso) {
          trn = this.simulateTournamentToCompletion(trn, allPlayers, career);
        }
        domesticLeagues[def.id] = trn;
      }
    });

    return {
      currentGameYear: seasonYear,
      currentDateIso: startIso,
      domesticLeagues,
      championsLeague: null,
      gclSlotConfig: slotConfig,
    };
  }

  /**
   * Ensure any CareerSave (new or legacy) has complete Year-Round Global Season fields hydrated
   */
  static ensureCareerWorldSeason(career: CareerSave, allPlayers: Player[]): CareerSave {
    const seasonYear = career.currentGameYear || career.tournament?.seasonYear || 2026 + (career.currentSeason - 1);
    const defaultStartIso =
      career.currentSeason === 1
        ? `${seasonYear}-03-28`
        : `${seasonYear}-01-02`;

    const careerDateIso = career.worldSeason?.currentDateIso ||
      (career.currentCareerDate ? toIsoDate(new Date(career.currentCareerDate)) : defaultStartIso);

    let worldSeason = career.worldSeason;
    if (!worldSeason || !worldSeason.domesticLeagues || !worldSeason.domesticLeagues.IPL) {
      worldSeason = this.initializeWorldSeason(
        seasonYear,
        career.tournament,
        worldSeason?.gclSlotConfig,
        careerDateIso,
        allPlayers,
        career
      );
    } else {
      // Ensure any missing domestic leagues are added cleanly without overwriting progress
      const patchedLeagues = { ...worldSeason.domesticLeagues };
      DOMESTIC_LEAGUES.forEach(def => {
        if (!patchedLeagues[def.id]) {
          patchedLeagues[def.id] =
            def.id === 'IPL' && career.tournament
              ? this.hydrateLegacyIplTournament(career.tournament, seasonYear)
              : this.generateDomesticLeagueSchedule(def.id, seasonYear);
        } else if (def.id === 'IPL') {
          patchedLeagues.IPL = this.hydrateLegacyIplTournament(patchedLeagues.IPL, seasonYear);
        }
      });
      worldSeason = {
        ...worldSeason,
        currentGameYear: worldSeason.currentGameYear || seasonYear,
        currentDateIso: worldSeason.currentDateIso || careerDateIso,
        gclSlotConfig: { ...DEFAULT_GCL_SLOTS, ...(worldSeason.gclSlotConfig || {}) },
        domesticLeagues: patchedLeagues,
      };
    }

    return {
      ...career,
      currentGameYear: worldSeason.currentGameYear,
      currentCareerDate:
        career.currentCareerDate ||
        new Date(`${worldSeason.currentDateIso}T12:00:00`).getTime(),
      tournament: worldSeason.domesticLeagues.IPL,
      worldSeason,
      trophiesCollected: career.trophiesCollected || [],
      unlockedAchievementIds: career.unlockedAchievementIds || [],
      recordedMatchIds: career.recordedMatchIds || [],
      matchHistory: career.matchHistory || [],
    };
  }

  /**
   * Check whether all 8 domestic leagues have finished their Final
   */
  static areAllDomesticLeaguesCompleted(worldSeason: WorldSeasonState): boolean {
    return DOMESTIC_LEAGUES.every(def => {
      const trn = worldSeason.domesticLeagues[def.id];
      return Boolean(trn?.playoffs?.championFranchiseId);
    });
  }

  /**
   * Generate Global Champions League T20 from domestic league winners & qualifiers
   * Guarantees zero duplicate teams, prioritizes league champions, and seeds 4 balanced Groups (A-D)
   */
  static generateChampionsLeague(
    worldSeason: WorldSeasonState,
    allPlayers: Player[],
    career?: CareerSave | null,
    overrideSlots?: GCLQualificationSlotConfig
  ): { worldSeason: WorldSeasonState; gcl: GCLState } {
    const seasonYear = worldSeason.currentGameYear;
    const slotConfig: GCLQualificationSlotConfig = {
      ...DEFAULT_GCL_SLOTS,
      ...(worldSeason.gclSlotConfig || {}),
      ...(overrideSlots || {}),
    };

    // Ensure every domestic league has crowned a champion before drafting GCL qualifiers
    const finalizedLeagues = { ...worldSeason.domesticLeagues };
    DOMESTIC_LEAGUES.forEach(def => {
      const trn = finalizedLeagues[def.id];
      if (!trn?.playoffs?.championFranchiseId) {
        finalizedLeagues[def.id] = this.simulateTournamentToCompletion(trn, allPlayers, career);
      }
    });

    const selectedIds = new Set<string>();
    const participants: GCLQualifiedParticipant[] = [];

    // 1. Collect requested slots from each league (champion prioritized #1)
    DOMESTIC_LEAGUES.forEach(def => {
      const slots = Math.max(0, Math.min(4, slotConfig[def.id] ?? def.defaultGclSlots));
      if (slots === 0) return;

      const trn = finalizedLeagues[def.id];
      const championId = trn.playoffs?.championFranchiseId;
      const runnerUpId = trn.playoffs?.runnerUpFranchiseId;
      const orderedCandidates: { id: string; reason: string; pos: number }[] = [];

      if (championId) {
        const pos = Math.max(1, trn.pointsTable.findIndex(p => p.franchiseId === championId) + 1);
        orderedCandidates.push({ id: championId, reason: `${def.shortName} Champion`, pos });
      }
      if (runnerUpId && runnerUpId !== championId) {
        const pos = Math.max(1, trn.pointsTable.findIndex(p => p.franchiseId === runnerUpId) + 1);
        orderedCandidates.push({ id: runnerUpId, reason: `${def.shortName} Runner-Up`, pos });
      }
      trn.pointsTable.forEach((row, idx) => {
        if (!orderedCandidates.some(c => c.id === row.franchiseId)) {
          orderedCandidates.push({
            id: row.franchiseId,
            reason: `${def.shortName} #${idx + 1}`,
            pos: idx + 1,
          });
        }
      });

      let addedForLeague = 0;
      for (const cand of orderedCandidates) {
        if (addedForLeague >= slots || participants.length >= 16) break;
        if (selectedIds.has(cand.id)) continue;
        selectedIds.add(cand.id);
        participants.push({
          teamId: cand.id,
          qualifiedFromLeagueId: def.id,
          qualificationReason: cand.reason,
          leaguePosition: cand.pos,
          seedRank: participants.length + 1,
        });
        addedForLeague += 1;
      }
    });

    // 2. If custom slots total < 16, fill remaining spots up to 16 from highest-ranked non-qualified league finishers
    if (participants.length < 16) {
      const extras: { teamId: string; leagueId: DomesticLeagueId; reason: string; pos: number; rating: number }[] = [];
      DOMESTIC_LEAGUES.forEach(def => {
        const trn = finalizedLeagues[def.id];
        trn.pointsTable.forEach((row, idx) => {
          if (!selectedIds.has(row.franchiseId)) {
            const team = getGlobalTeamById(row.franchiseId);
            extras.push({
              teamId: row.franchiseId,
              leagueId: def.id,
              reason: `${def.shortName} Wildcard (#${idx + 1})`,
              pos: idx + 1,
              rating: team.rating + row.points * 2,
            });
          }
        });
      });
      extras.sort((a, b) => b.rating - a.rating);
      for (const ex of extras) {
        if (participants.length >= 16) break;
        if (selectedIds.has(ex.teamId)) continue;
        selectedIds.add(ex.teamId);
        participants.push({
          teamId: ex.teamId,
          qualifiedFromLeagueId: ex.leagueId,
          qualificationReason: ex.reason,
          leaguePosition: ex.pos,
          seedRank: participants.length + 1,
        });
      }
    }

    // Re-seed: champions first, then by global team rating
    participants.sort((a, b) => {
      const aChamp = a.qualificationReason.includes('Champion') ? 1 : 0;
      const bChamp = b.qualificationReason.includes('Champion') ? 1 : 0;
      if (bChamp !== aChamp) return bChamp - aChamp;
      return getGlobalTeamById(b.teamId).rating - getGlobalTeamById(a.teamId).rating;
    });
    participants.forEach((p, idx) => {
      p.seedRank = idx + 1;
    });

    // Distribute into 4 balanced Groups (A, B, C, D) via snake draft (0,1,2,3, 3,2,1,0, ...)
    const groupNames: ('Group A' | 'Group B' | 'Group C' | 'Group D')[] = [
      'Group A',
      'Group B',
      'Group C',
      'Group D',
    ];
    const groupBuckets: string[][] = [[], [], [], []];
    participants.forEach((p, idx) => {
      const row = Math.floor(idx / 4);
      const col = row % 2 === 0 ? idx % 4 : 3 - (idx % 4);
      groupBuckets[col].push(p.teamId);
    });

    const groups: GCLGroup[] = groupNames.map((groupName, gIdx) => ({
      groupName,
      teamIds: groupBuckets[gIdx],
      standings: groupBuckets[gIdx].map(id => makeEmptyPointsEntry(id)),
    }));

    // Stage 1: Group Stage Fixtures (24 matches: 6 per group across Oct 02 - Oct 15)
    const startIso = `${seasonYear}-10-02`;
    const endIso = `${seasonYear}-10-28`;
    const fixtures: Fixture[] = [];
    let matchNumber = 1;

    // Interleave rounds across Groups A-D so all groups advance together day by day
    const groupPairings = [
      [0, 1, 2, 3],
      [0, 2, 1, 3],
      [0, 3, 1, 2],
    ];
    let dayOffset = 0;
    groupPairings.forEach((pairing, roundIdx) => {
      groups.forEach(group => {
        const pairs = [
          [group.teamIds[pairing[0]], group.teamIds[pairing[1]]],
          [group.teamIds[pairing[2]], group.teamIds[pairing[3]]],
        ];
        pairs.forEach(([homeId, awayId]) => {
          if (!homeId || !awayId) return;
          const matchDateIso = addDaysIso(startIso, Math.min(13, dayOffset));
          const homeTeam = getGlobalTeamById(homeId);
          fixtures.push({
            fixtureId: `gcl_${seasonYear}_m${matchNumber}`,
            competitionId: 'GCL_T20',
            groupName: group.groupName,
            matchNumber,
            roundNumber: roundIdx + 1,
            playoffStage: 'GROUP_STAGE',
            dateStr: formatShortDateFromIso(matchDateIso),
            matchDateIso,
            venue: homeTeam.homeStadium,
            homeFranchiseId: homeId,
            awayFranchiseId: awayId,
            isCompleted: false,
          });
          matchNumber += 1;
        });
        dayOffset += 1;
      });
    });

    // Stage 2: Quarter-Finals (4 matches: Oct 17-20)
    const qfMatchups = [
      { id: `gcl_${seasonYear}_qf1`, home: 'TBD_A1', away: 'TBD_B2', day: 15, venue: 'Wankhede Stadium, Mumbai' },
      { id: `gcl_${seasonYear}_qf2`, home: 'TBD_B1', away: 'TBD_A2', day: 16, venue: 'Dubai International Stadium' },
      { id: `gcl_${seasonYear}_qf3`, home: 'TBD_C1', away: 'TBD_D2', day: 17, venue: "Lord's Cricket Ground" },
      { id: `gcl_${seasonYear}_qf4`, home: 'TBD_D1', away: 'TBD_C2', day: 18, venue: 'Melbourne Cricket Ground (MCG)' },
    ];
    qfMatchups.forEach(qf => {
      const mIso = addDaysIso(startIso, qf.day);
      fixtures.push({
        fixtureId: qf.id,
        competitionId: 'GCL_T20',
        matchNumber: matchNumber++,
        roundNumber: 4,
        playoffStage: 'QUARTER_FINAL',
        dateStr: formatShortDateFromIso(mIso),
        matchDateIso: mIso,
        venue: qf.venue,
        homeFranchiseId: qf.home,
        awayFranchiseId: qf.away,
        isCompleted: false,
      });
    });

    // Stage 3: Semi-Finals (2 matches: Oct 23-24)
    const sf1Iso = addDaysIso(startIso, 21);
    fixtures.push({
      fixtureId: `gcl_${seasonYear}_sf1`,
      competitionId: 'GCL_T20',
      matchNumber: matchNumber++,
      roundNumber: 5,
      playoffStage: 'SEMI_FINAL',
      dateStr: formatShortDateFromIso(sf1Iso),
      matchDateIso: sf1Iso,
      venue: 'M. A. Chidambaram Stadium, Chennai',
      homeFranchiseId: 'TBD_QF1',
      awayFranchiseId: 'TBD_QF3',
      isCompleted: false,
    });

    const sf2Iso = addDaysIso(startIso, 22);
    fixtures.push({
      fixtureId: `gcl_${seasonYear}_sf2`,
      competitionId: 'GCL_T20',
      matchNumber: matchNumber++,
      roundNumber: 5,
      playoffStage: 'SEMI_FINAL',
      dateStr: formatShortDateFromIso(sf2Iso),
      matchDateIso: sf2Iso,
      venue: 'Dubai International Stadium',
      homeFranchiseId: 'TBD_QF2',
      awayFranchiseId: 'TBD_QF4',
      isCompleted: false,
    });

    // Stage 4: Grand Final (Oct 28)
    fixtures.push({
      fixtureId: `gcl_${seasonYear}_final`,
      competitionId: 'GCL_T20',
      matchNumber: matchNumber++,
      roundNumber: 6,
      playoffStage: 'FINAL',
      dateStr: formatShortDateFromIso(endIso),
      matchDateIso: endIso,
      venue: 'Narendra Modi Stadium, Ahmedabad',
      homeFranchiseId: 'TBD_SF1',
      awayFranchiseId: 'TBD_SF2',
      isCompleted: false,
    });

    const gcl: GCLState = {
      tournamentId: `trn_GCL_${seasonYear}`,
      name: 'Global Champions League T20',
      seasonYear,
      startDateIso: startIso,
      endDateIso: endIso,
      status: 'GROUP_STAGE',
      qualifiedParticipants: participants,
      groups,
      fixtures,
      playerStats: {},
    };

    return {
      worldSeason: {
        ...worldSeason,
        domesticLeagues: finalizedLeagues,
        championsLeague: gcl,
        gclSlotConfig: slotConfig,
      },
      gcl,
    };
  }

  /**
   * Record match result inside Global Champions League T20 & auto-progress Group -> QF -> SF -> Final
   */
  static recordGclMatchResult(gcl: GCLState, result: MatchResultDetails): GCLState {
    const updated = JSON.parse(JSON.stringify(gcl)) as GCLState;
    const fixture = updated.fixtures.find(f => f.fixtureId === result.fixtureId);
    if (!fixture || fixture.isCompleted) return gcl;

    fixture.isCompleted = true;
    fixture.homeScore = {
      runs:
        result.homeFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.totalRuns
          : result.innings2.totalRuns,
      wickets:
        result.homeFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.totalWickets
          : result.innings2.totalWickets,
      oversDisplay:
        result.homeFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.oversDisplay
          : result.innings2.oversDisplay,
      ballsFaced:
        result.homeFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.legalBallsFaced
          : result.innings2.legalBallsFaced,
    };
    fixture.awayScore = {
      runs:
        result.awayFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.totalRuns
          : result.innings2.totalRuns,
      wickets:
        result.awayFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.totalWickets
          : result.innings2.totalWickets,
      oversDisplay:
        result.awayFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.oversDisplay
          : result.innings2.oversDisplay,
      ballsFaced:
        result.awayFranchiseId === result.innings1.battingFranchiseId
          ? result.innings1.legalBallsFaced
          : result.innings2.legalBallsFaced,
    };
    fixture.winnerFranchiseId = result.winnerFranchiseId;
    fixture.resultDescription = result.marginDescription;
    fixture.playerOfTheMatchName = result.playerOfTheMatch.playerName;
    fixture.matchDetailsId = result.matchId;

    // Update Group standings
    if (fixture.playoffStage === 'GROUP_STAGE') {
      const targetGroup = updated.groups.find(
        g => g.groupName === fixture.groupName || g.teamIds.includes(fixture.homeFranchiseId)
      );
      if (targetGroup) {
        const homeEntry = targetGroup.standings.find(s => s.franchiseId === result.homeFranchiseId);
        const awayEntry = targetGroup.standings.find(s => s.franchiseId === result.awayFranchiseId);
        if (homeEntry && awayEntry) {
          homeEntry.played += 1;
          awayEntry.played += 1;
          if (result.winnerFranchiseId === homeEntry.franchiseId) {
            homeEntry.won += 1;
            homeEntry.points += 2;
            homeEntry.form = (['W', ...homeEntry.form] as ('W' | 'L' | 'T' | 'NR')[]).slice(0, 5);
            awayEntry.lost += 1;
            awayEntry.form = (['L', ...awayEntry.form] as ('W' | 'L' | 'T' | 'NR')[]).slice(0, 5);
          } else if (result.winnerFranchiseId === awayEntry.franchiseId) {
            awayEntry.won += 1;
            awayEntry.points += 2;
            awayEntry.form = (['W', ...awayEntry.form] as ('W' | 'L' | 'T' | 'NR')[]).slice(0, 5);
            homeEntry.lost += 1;
            homeEntry.form = (['L', ...homeEntry.form] as ('W' | 'L' | 'T' | 'NR')[]).slice(0, 5);
          } else {
            homeEntry.tied += 1;
            awayEntry.tied += 1;
            homeEntry.points += 1;
            awayEntry.points += 1;
            homeEntry.form = (['T', ...homeEntry.form] as ('W' | 'L' | 'T' | 'NR')[]).slice(0, 5);
            awayEntry.form = (['T', ...awayEntry.form] as ('W' | 'L' | 'T' | 'NR')[]).slice(0, 5);
          }

          const inn1Balls = result.innings1.isAllOut ? 120 : result.innings1.legalBallsFaced;
          const inn2Balls = result.innings2.isAllOut ? 120 : result.innings2.legalBallsFaced;

          const inn1Bat = result.innings1.battingFranchiseId === homeEntry.franchiseId ? homeEntry : awayEntry;
          const inn1Bowl = result.innings1.battingFranchiseId === homeEntry.franchiseId ? awayEntry : homeEntry;
          inn1Bat.runsScored += result.innings1.totalRuns;
          inn1Bat.legalBallsFaced += inn1Balls;
          inn1Bowl.runsConceded += result.innings1.totalRuns;
          inn1Bowl.legalBallsBowled += inn1Balls;

          const inn2Bat = result.innings2.battingFranchiseId === homeEntry.franchiseId ? homeEntry : awayEntry;
          const inn2Bowl = result.innings2.battingFranchiseId === homeEntry.franchiseId ? awayEntry : homeEntry;
          inn2Bat.runsScored += result.innings2.totalRuns;
          inn2Bat.legalBallsFaced += inn2Balls;
          inn2Bowl.runsConceded += result.innings2.totalRuns;
          inn2Bowl.legalBallsBowled += inn2Balls;

          [homeEntry, awayEntry].forEach(entry => {
            const scoredRate = entry.legalBallsFaced > 0 ? entry.runsScored / (entry.legalBallsFaced / 6) : 0;
            const concededRate = entry.legalBallsBowled > 0 ? entry.runsConceded / (entry.legalBallsBowled / 6) : 0;
            entry.netRunRate = Number((scoredRate - concededRate).toFixed(3));
          });

          targetGroup.standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.netRunRate !== a.netRunRate) return b.netRunRate - a.netRunRate;
            return b.won - a.won;
          });
        }
      }
    }

    // Update GCL player stats using shared helper
    updated.playerStats = processGlobalMatchResultHelpers.mergePlayerStats(updated.playerStats || {}, result);

    // Stage Progression: Group Stage -> Quarter-Finals -> Semi-Finals -> Grand Final -> Completed
    const groupMatchesDone = updated.fixtures
      .filter(f => f.playoffStage === 'GROUP_STAGE')
      .every(f => f.isCompleted);

    if (groupMatchesDone) {
      const gA = updated.groups.find(g => g.groupName === 'Group A')?.standings || [];
      const gB = updated.groups.find(g => g.groupName === 'Group B')?.standings || [];
      const gC = updated.groups.find(g => g.groupName === 'Group C')?.standings || [];
      const gD = updated.groups.find(g => g.groupName === 'Group D')?.standings || [];

      const qfFixtures = updated.fixtures.filter(f => f.playoffStage === 'QUARTER_FINAL');
      const [qf1, qf2, qf3, qf4] = qfFixtures;
      if (qf1 && qf1.homeFranchiseId === 'TBD_A1' && gA[0] && gB[1]) {
        qf1.homeFranchiseId = gA[0].franchiseId;
        qf1.awayFranchiseId = gB[1].franchiseId;
      }
      if (qf2 && qf2.homeFranchiseId === 'TBD_B1' && gB[0] && gA[1]) {
        qf2.homeFranchiseId = gB[0].franchiseId;
        qf2.awayFranchiseId = gA[1].franchiseId;
      }
      if (qf3 && qf3.homeFranchiseId === 'TBD_C1' && gC[0] && gD[1]) {
        qf3.homeFranchiseId = gC[0].franchiseId;
        qf3.awayFranchiseId = gD[1].franchiseId;
      }
      if (qf4 && qf4.homeFranchiseId === 'TBD_D1' && gD[0] && gC[1]) {
        qf4.homeFranchiseId = gD[0].franchiseId;
        qf4.awayFranchiseId = gC[1].franchiseId;
      }

      if (updated.status === 'GROUP_STAGE') {
        updated.status = 'QUARTER_FINALS';
      }

      if (qfFixtures.every(q => q.isCompleted)) {
        const sfFixtures = updated.fixtures.filter(f => f.playoffStage === 'SEMI_FINAL');
        const [sf1, sf2] = sfFixtures;
        if (sf1 && sf1.homeFranchiseId === 'TBD_QF1' && qf1?.winnerFranchiseId && qf3?.winnerFranchiseId) {
          sf1.homeFranchiseId = qf1.winnerFranchiseId;
          sf1.awayFranchiseId = qf3.winnerFranchiseId;
        }
        if (sf2 && sf2.homeFranchiseId === 'TBD_QF2' && qf2?.winnerFranchiseId && qf4?.winnerFranchiseId) {
          sf2.homeFranchiseId = qf2.winnerFranchiseId;
          sf2.awayFranchiseId = qf4.winnerFranchiseId;
        }
        updated.status = 'SEMI_FINALS';

        if (sfFixtures.every(s => s.isCompleted)) {
          const finalFix = updated.fixtures.find(f => f.playoffStage === 'FINAL');
          if (finalFix && finalFix.homeFranchiseId === 'TBD_SF1' && sf1?.winnerFranchiseId && sf2?.winnerFranchiseId) {
            finalFix.homeFranchiseId = sf1.winnerFranchiseId;
            finalFix.awayFranchiseId = sf2.winnerFranchiseId;
          }
          updated.status = 'FINAL';

          if (finalFix?.isCompleted && finalFix.winnerFranchiseId) {
            updated.championFranchiseId = finalFix.winnerFranchiseId;
            updated.runnerUpFranchiseId =
              finalFix.winnerFranchiseId === finalFix.homeFranchiseId
                ? finalFix.awayFranchiseId
                : finalFix.homeFranchiseId;
            updated.status = 'COMPLETED';
          }
        }
      }
    }

    return updated;
  }

  /**
   * Authoritative match result recorder across ANY competition (IPL, 7 other domestic leagues, or GCL T20).
   * Idempotent: prevents duplicate stat counting, duplicate trophies, and duplicate history entries.
   */
  static recordCompetitionMatchResult(
    careerInput: CareerSave,
    competitionId: CompetitionId,
    result: MatchResultDetails,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    newlyAwardedTrophies: CareerTrophy[];
    newlyUnlockedMilestones: PlayerMilestoneEvent[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const ws = { ...career.worldSeason! };
    const domesticLeagues = { ...ws.domesticLeagues };
    let championsLeague = ws.championsLeague;

    const matchRecordKey = `${competitionId}:${result.fixtureId}:${ws.currentGameYear}`;
    const recordedSet = new Set<string>(career.recordedMatchIds || []);
    const alreadyCounted = recordedSet.has(matchRecordKey);

    let completedFixture: Fixture | undefined;
    let competitionName = '';

    if (competitionId === 'GCL_T20') {
      if (!championsLeague) {
        return { updatedCareer: career, newlyAwardedTrophies: [], newlyUnlockedMilestones: [] };
      }
      const nextGcl = this.recordGclMatchResult(championsLeague, result);
      championsLeague = nextGcl;
      completedFixture = nextGcl.fixtures.find(f => f.fixtureId === result.fixtureId);
      competitionName = nextGcl.name;
    } else {
      const targetTrn = domesticLeagues[competitionId];
      if (!targetTrn) {
        return { updatedCareer: career, newlyAwardedTrophies: [], newlyUnlockedMilestones: [] };
      }
      const nextTrn = processGlobalMatchResultHelpers.recordTournamentResult(targetTrn, result);
      domesticLeagues[competitionId] = nextTrn;
      completedFixture = nextTrn.fixtures.find(f => f.fixtureId === result.fixtureId);
      competitionName = nextTrn.name;
    }

    const involvesUser =
      result.homeFranchiseId === career.franchiseId ||
      result.awayFranchiseId === career.franchiseId;

    let updatedStats = { ...(career.statsSummary || { matchesPlayed: 0, matchesWon: 0, matchesLost: 0, trophies: 0 }) };
    if (involvesUser && !alreadyCounted) {
      updatedStats.matchesPlayed += 1;
      if (result.winnerFranchiseId === career.franchiseId) {
        updatedStats.matchesWon += 1;
      } else if (result.winnerFranchiseId && result.winnerFranchiseId !== 'TIE') {
        updatedStats.matchesLost += 1;
      }
    }

    // Milestones for user squad matches
    let newlyUnlockedMilestones: PlayerMilestoneEvent[] = [];
    if (involvesUser && !alreadyCounted) {
      const msRes: MilestoneEventResult = MilestoneService.processMatchMilestones(career, result, allPlayers);
      career = msRes.updatedCareer;
      newlyUnlockedMilestones = msRes.newlyUnlockedMilestones;
    }

    // Match History logging (record user matches + playoffs/finals + GCL matches)
    let nextHistory = [...(career.matchHistory || [])];
    if (
      completedFixture &&
      !alreadyCounted &&
      (involvesUser ||
        completedFixture.playoffStage !== 'NONE' ||
        competitionId === 'GCL_T20')
    ) {
      const stageLabels: Record<string, string> = {
        NONE: `Round ${completedFixture.roundNumber}`,
        GROUP_STAGE: completedFixture.groupName || 'Group Stage',
        QUALIFIER_1: 'Qualifier 1',
        ELIMINATOR: 'Eliminator',
        QUALIFIER_2: 'Qualifier 2',
        QUARTER_FINAL: 'Quarter-Final',
        SEMI_FINAL: 'Semi-Final',
        FINAL: 'Grand Final',
      };
      const entry: MatchHistoryEntry = {
        id: `hist_${matchRecordKey}`,
        fixtureId: completedFixture.fixtureId,
        competitionId,
        competitionName,
        seasonYear: ws.currentGameYear,
        seasonNumber: career.currentSeason,
        dateStr: completedFixture.dateStr,
        stageLabel: stageLabels[completedFixture.playoffStage] || 'Match',
        homeTeamId: completedFixture.homeFranchiseId,
        awayTeamId: completedFixture.awayFranchiseId,
        homeScoreText: completedFixture.homeScore
          ? `${completedFixture.homeScore.runs}/${completedFixture.homeScore.wickets} (${completedFixture.homeScore.oversDisplay})`
          : '-',
        awayScoreText: completedFixture.awayScore
          ? `${completedFixture.awayScore.runs}/${completedFixture.awayScore.wickets} (${completedFixture.awayScore.oversDisplay})`
          : '-',
        winnerTeamId: completedFixture.winnerFranchiseId || result.winnerFranchiseId,
        resultDescription: completedFixture.resultDescription || result.marginDescription,
        playerOfTheMatchName: result.playerOfTheMatch.playerName,
        isUserMatch: involvesUser,
      };
      nextHistory = [entry, ...nextHistory].slice(0, 300);
    }

    if (completedFixture?.isCompleted) {
      recordedSet.add(matchRecordKey);
    }

    // Check Trophy Awards (idempotent by competitionId + seasonYear)
    const trophies = [...(career.trophiesCollected || [])];
    const newlyAwardedTrophies: CareerTrophy[] = [];

    const awardTrophyIfWinner = (
      compId: CompetitionId,
      trophyName: string,
      compName: string,
      winnerId: string | undefined,
      runnerUpId: string | undefined,
      tier: CareerTrophy['tier']
    ) => {
      if (!winnerId || winnerId !== career.franchiseId) return;
      const trophyKey = `trophy_${compId}_${ws.currentGameYear}_${career.currentSeason}`;
      if (trophies.some(t => t.id === trophyKey)) return;
      const winTeam = getGlobalTeamById(winnerId);
      const trophy: CareerTrophy = {
        id: trophyKey,
        competitionId: compId,
        trophyName,
        competitionName: compName,
        seasonYear: ws.currentGameYear,
        seasonNumber: career.currentSeason,
        winningTeamId: winnerId,
        winningTeamName: winTeam.name,
        runnerUpTeamId: runnerUpId,
        finalMargin: result.marginDescription,
        tier,
        awardedAt: Date.now(),
      };
      trophies.unshift(trophy);
      newlyAwardedTrophies.push(trophy);
      updatedStats.trophies = trophies.length;
    };

    if (competitionId !== 'GCL_T20') {
      const trn = domesticLeagues[competitionId];
      if (trn.playoffs?.championFranchiseId === career.franchiseId && completedFixture?.playoffStage === 'FINAL') {
        const def = getLeagueDefinition(competitionId);
        awardTrophyIfWinner(
          competitionId,
          def.trophyName,
          def.name,
          trn.playoffs.championFranchiseId,
          trn.playoffs.runnerUpFranchiseId,
          competitionId === 'IPL' ? 'PLATINUM' : 'GOLD'
        );
      }
    } else if (championsLeague?.status === 'COMPLETED' && completedFixture?.playoffStage === 'FINAL') {
      awardTrophyIfWinner(
        'GCL_T20',
        'Global Champions League Crown',
        'Global Champions League T20',
        championsLeague.championFranchiseId,
        championsLeague.runnerUpFranchiseId,
        'DIAMOND'
      );
    }

    // If user just completed their final IPL league match (#14) and AI Round-14 matches remain,
    // settle remaining uncompleted AI league matches (protectedId-safe) so Q1 & Eliminator seed immediately!
    if (
      competitionId === 'IPL' &&
      involvesUser &&
      completedFixture?.playoffStage === 'NONE'
    ) {
      const protectedId = this.getActiveProtectedFixtureId();
      let iplTrn = domesticLeagues.IPL;
      const userHasMoreLeagueMatches = iplTrn.fixtures.some(
        f =>
          f.playoffStage === 'NONE' &&
          !f.isCompleted &&
          (f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId)
      );
      if (!userHasMoreLeagueMatches) {
        const remainingAiLeague = iplTrn.fixtures
          .filter(
            f =>
              f.playoffStage === 'NONE' &&
              !f.isCompleted &&
              f.fixtureId !== protectedId &&
              f.homeFranchiseId !== career.franchiseId &&
              f.awayFranchiseId !== career.franchiseId
          )
          .sort((a, b) => a.matchNumber - b.matchNumber);
        for (const aiFix of remainingAiLeague) {
          const simRes = processGlobalMatchResultHelpers.simulateFixture(aiFix, allPlayers, career);
          iplTrn = processGlobalMatchResultHelpers.recordTournamentResult(iplTrn, simRes);
        }
        domesticLeagues.IPL = iplTrn;
      }
    }

    // Derive season phase accurately
    let seasonPhase = career.seasonPhase;
    const ipl = domesticLeagues.IPL;
    const iplLeagueDone = ipl.fixtures.filter(f => f.playoffStage === 'NONE').every(f => f.isCompleted);
    if (championsLeague) {
      seasonPhase = championsLeague.status === 'COMPLETED' ? 'Season End' : 'Champions League';
    } else if (ipl.playoffs?.championFranchiseId) {
      seasonPhase = 'Playoffs';
    } else if (iplLeagueDone) {
      seasonPhase = 'Playoffs';
    } else if (seasonPhase === 'Retentions' || seasonPhase === 'Auction' || seasonPhase === 'Pre-Season') {
      seasonPhase = 'SEASON_ACTIVE';
    }

    const updatedWs: WorldSeasonState = {
      ...ws,
      domesticLeagues,
      championsLeague,
      currentDateIso:
        completedFixture?.matchDateIso && completedFixture.matchDateIso > ws.currentDateIso
          ? completedFixture.matchDateIso
          : ws.currentDateIso,
    };

    let finalCareer: CareerSave = {
      ...career,
      currentGameYear: updatedWs.currentGameYear,
      currentCareerDate: new Date(`${updatedWs.currentDateIso}T12:00:00`).getTime(),
      seasonPhase,
      tournament: updatedWs.domesticLeagues.IPL,
      worldSeason: updatedWs,
      statsSummary: updatedStats,
      trophiesCollected: trophies,
      recordedMatchIds: Array.from(recordedSet).slice(-1200),
      matchHistory: nextHistory,
      lastPlayedAt: Date.now(),
    };

    // Update persistent unlocked achievement IDs
    const squadPlayers = (finalCareer.squadPlayerIds || [])
      .map(id => allPlayers.find(p => p.id === id))
      .filter(Boolean) as Player[];
    const evaluated = evaluateCareerAchievements(finalCareer, squadPlayers);
    const prevAch = new Set<string>(finalCareer.unlockedAchievementIds || []);
    evaluated.forEach(a => {
      if (a.isUnlocked) prevAch.add(a.id);
    });
    finalCareer = {
      ...finalCareer,
      unlockedAchievementIds: Array.from(prevAch),
    };

    return {
      updatedCareer: finalCareer,
      newlyAwardedTrophies,
      newlyUnlockedMilestones,
    };
  }

  /**
   * Collect all ready-to-play upcoming fixtures across all active competitions sorted chronologically
   */
  static getUpcomingScheduledFixtures(
    worldSeason: WorldSeasonState
  ): { competitionId: CompetitionId; competitionName: string; fixture: Fixture }[] {
    const items: { competitionId: CompetitionId; competitionName: string; fixture: Fixture }[] = [];

    DOMESTIC_LEAGUES.forEach(def => {
      const trn = worldSeason.domesticLeagues[def.id];
      if (!trn) return;
      trn.fixtures.forEach(f => {
        if (!f.isCompleted && !f.homeFranchiseId.startsWith('TBD') && !f.awayFranchiseId.startsWith('TBD')) {
          items.push({ competitionId: def.id, competitionName: def.name, fixture: f });
        }
      });
    });

    if (worldSeason.championsLeague) {
      worldSeason.championsLeague.fixtures.forEach(f => {
        if (!f.isCompleted && !f.homeFranchiseId.startsWith('TBD') && !f.awayFranchiseId.startsWith('TBD')) {
          items.push({
            competitionId: 'GCL_T20',
            competitionName: worldSeason.championsLeague!.name,
            fixture: f,
          });
        }
      });
    }

    items.sort((a, b) => {
      const da = a.fixture.matchDateIso || '9999-12-31';
      const db = b.fixture.matchDateIso || '9999-12-31';
      if (da !== db) return da.localeCompare(db);
      return a.fixture.matchNumber - b.fixture.matchNumber;
    });

    return items;
  }

  /**
   * Simulate a single scheduled fixture by ID (protected against active live match)
   */
  static simulateSpecificFixture(
    careerInput: CareerSave,
    competitionId: CompetitionId,
    fixtureId: string,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    simulatedFixture: Fixture | null;
    newlyAwardedTrophies: CareerTrophy[];
    newlyUnlockedMilestones: PlayerMilestoneEvent[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const protectedId = this.getActiveProtectedFixtureId();
    if (protectedId && protectedId === fixtureId) {
      return {
        updatedCareer: career,
        simulatedFixture: null,
        newlyAwardedTrophies: [],
        newlyUnlockedMilestones: [],
      };
    }

    const ws = career.worldSeason!;
    const fixture =
      competitionId === 'GCL_T20'
        ? ws.championsLeague?.fixtures.find(f => f.fixtureId === fixtureId)
        : ws.domesticLeagues[competitionId]?.fixtures.find(f => f.fixtureId === fixtureId);

    if (
      !fixture ||
      fixture.isCompleted ||
      fixture.homeFranchiseId.startsWith('TBD') ||
      fixture.awayFranchiseId.startsWith('TBD')
    ) {
      return {
        updatedCareer: career,
        simulatedFixture: null,
        newlyAwardedTrophies: [],
        newlyUnlockedMilestones: [],
      };
    }

    const result = processGlobalMatchResultHelpers.simulateFixture(fixture, allPlayers, career);
    const recorded = this.recordCompetitionMatchResult(career, competitionId, result, allPlayers);
    return {
      ...recorded,
      simulatedFixture: fixture,
    };
  }

  /**
   * Auto-start Global Champions League T20 once all domestic leagues complete and date reaches Oct 01
   */
  private static maybeAutoTriggerGcl(career: CareerSave, allPlayers: Player[]): CareerSave {
    const ws = career.worldSeason;
    if (!ws) return career;
    if (ws.championsLeague) return career;

    const allDone = this.areAllDomesticLeaguesCompleted(ws);
    if (allDone || ws.currentDateIso >= `${ws.currentGameYear}-10-01`) {
      const { worldSeason } = this.generateChampionsLeague(ws, allPlayers, career);
      const nextDate =
        worldSeason.currentDateIso < `${worldSeason.currentGameYear}-10-02`
          ? `${worldSeason.currentGameYear}-10-02`
          : worldSeason.currentDateIso;
      return {
        ...career,
        seasonPhase: 'Champions League',
        worldSeason: {
          ...worldSeason,
          currentDateIso: nextDate,
        },
        currentCareerDate: new Date(`${nextDate}T12:00:00`).getTime(),
      };
    }
    return career;
  }

  /**
   * Simulate next 1 match across the year-round calendar (never simulates an active live match in progress)
   */
  static simulateOneMatch(
    careerInput: CareerSave,
    allPlayers: Player[],
    skipUserMatch: boolean = false
  ): {
    updatedCareer: CareerSave;
    simulatedCount: number;
    newlyAwardedTrophies: CareerTrophy[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    career = this.maybeAutoTriggerGcl(career, allPlayers);

    const protectedId = this.getActiveProtectedFixtureId();
    const upcoming = this.getUpcomingScheduledFixtures(career.worldSeason!).filter(
      item =>
        item.fixture.fixtureId !== protectedId &&
        (!skipUserMatch ||
          (item.fixture.homeFranchiseId !== career.franchiseId &&
            item.fixture.awayFranchiseId !== career.franchiseId))
    );

    if (upcoming.length === 0) {
      return { updatedCareer: career, simulatedCount: 0, newlyAwardedTrophies: [] };
    }

    const target = upcoming[0];
    const res = this.simulateSpecificFixture(
      career,
      target.competitionId,
      target.fixture.fixtureId,
      allPlayers
    );
    const afterGcl = this.maybeAutoTriggerGcl(res.updatedCareer, allPlayers);
    return {
      updatedCareer: afterGcl,
      simulatedCount: res.simulatedFixture ? 1 : 0,
      newlyAwardedTrophies: res.newlyAwardedTrophies,
    };
  }

  /**
   * Simulate forward by N calendar days (1 Day, 7 Days = 1 Week, 30 Days = 1 Month)
   * Simulates all scheduled non-active matches up to targetDateIso, progressing playoffs & GCL automatically.
   * When skipUserMatch=true (e.g. Advance Day from Home), AI fixtures advance while preserving user's own scheduled match.
   */
  static simulateDays(
    careerInput: CareerSave,
    days: number,
    allPlayers: Player[],
    skipUserMatch: boolean = false
  ): {
    updatedCareer: CareerSave;
    simulatedCount: number;
    newlyAwardedTrophies: CareerTrophy[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const startIso = career.worldSeason!.currentDateIso;
    const yearEndIso = `${career.worldSeason!.currentGameYear}-12-31`;
    const rawTarget = addDaysIso(startIso, days);
    const targetIso = rawTarget > yearEndIso ? yearEndIso : rawTarget;

    const protectedId = this.getActiveProtectedFixtureId();
    let simulatedCount = 0;
    const allTrophies: CareerTrophy[] = [];

    for (let guard = 0; guard < 360; guard++) {
      career = this.maybeAutoTriggerGcl(career, allPlayers);
      const upcoming = this.getUpcomingScheduledFixtures(career.worldSeason!).filter(
        item =>
          item.fixture.fixtureId !== protectedId &&
          (item.fixture.matchDateIso || startIso) <= targetIso &&
          (!skipUserMatch ||
            (item.fixture.homeFranchiseId !== career.franchiseId &&
              item.fixture.awayFranchiseId !== career.franchiseId))
      );
      if (upcoming.length === 0) break;

      const next = upcoming[0];
      const res = this.simulateSpecificFixture(
        career,
        next.competitionId,
        next.fixture.fixtureId,
        allPlayers
      );
      career = res.updatedCareer;
      if (res.simulatedFixture) simulatedCount += 1;
      allTrophies.push(...res.newlyAwardedTrophies);
    }

    career = this.maybeAutoTriggerGcl(career, allPlayers);

    if (career.worldSeason!.currentDateIso < targetIso) {
      career = {
        ...career,
        worldSeason: {
          ...career.worldSeason!,
          currentDateIso: targetIso,
        },
        currentCareerDate: new Date(`${targetIso}T12:00:00`).getTime(),
      };
    }

    return {
      updatedCareer: career,
      simulatedCount,
      newlyAwardedTrophies: allTrophies,
    };
  }

  /**
   * Inspect current career progression phase across IPL League -> IPL Playoffs -> Champions League -> Next Season
   */
  static getCareerPhaseProgress(careerInput: CareerSave): CareerPhaseProgress {
    const ws = careerInput.worldSeason;
    const ipl = ws?.domesticLeagues?.IPL || careerInput.tournament;
    const gcl = ws?.championsLeague || null;
    const currentIso = ws?.currentDateIso || `${careerInput.currentGameYear || 2026}-03-28`;

    const iplFixtures: Fixture[] = ipl?.fixtures || [];
    const iplLeagueFixtures = iplFixtures.filter(f => f.playoffStage === 'NONE');
    const iplCompletedMatches = iplLeagueFixtures.filter(f => f.isCompleted).length;
    const iplLeagueDone = iplLeagueFixtures.length > 0 && iplCompletedMatches === iplLeagueFixtures.length;
    const iplChampionId = ipl?.playoffs?.championFranchiseId;
    const gclChampionId = gcl?.championFranchiseId;

    const pointsTable: PointsTableEntry[] = ipl?.pointsTable || [];
    const rankIdx = pointsTable.findIndex(p => p.franchiseId === careerInput.franchiseId);
    const userIplRank = rankIdx >= 0 ? rankIdx + 1 : 1;

    if ((careerInput.squadPlayerIds || []).length === 0) {
      return {
        phaseKey: 'EMPTY_SQUAD',
        competitionId: 'IPL',
        stageBadge: 'AUCTION REQUIRED',
        headline: 'Your Squad is Empty',
        subtext: 'Complete the Mega Auction to begin the season.',
        daysUntilUserMatch: 0,
        userIplRank,
        iplCompletedMatches,
        iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
        iplChampionId,
        gclChampionId,
      };
    }

    const stageLabelMap: Record<string, string> = {
      NONE: 'MATCH DAY',
      QUALIFIER_1: 'QUALIFIER 1',
      ELIMINATOR: 'ELIMINATOR',
      QUALIFIER_2: 'QUALIFIER 2',
      GROUP_STAGE: 'GCL GROUP STAGE',
      QUARTER_FINAL: 'GCL QUARTER-FINAL',
      SEMI_FINAL: 'GCL SEMI-FINAL',
      FINAL: gcl && !gclChampionId && iplChampionId ? 'GCL GRAND FINAL' : 'IPL FINAL',
    };

    // 1. Check user's next ready IPL fixture (League or seeded Playoff)
    const userIplFix = iplFixtures.find(
      f =>
        !f.isCompleted &&
        !f.homeFranchiseId.startsWith('TBD') &&
        !f.awayFranchiseId.startsWith('TBD') &&
        (f.homeFranchiseId === careerInput.franchiseId || f.awayFranchiseId === careerInput.franchiseId)
    );

    if (userIplFix) {
      const targetIso = userIplFix.matchDateIso || currentIso;
      const daysUntil = targetIso > currentIso ? daysBetweenIso(currentIso, targetIso) : 0;
      const baseStageLabel = stageLabelMap[userIplFix.playoffStage] || 'MATCH DAY';
      const badge =
        daysUntil > 0
          ? daysUntil === 1
            ? 'MATCH TOMORROW'
            : `NEXT MATCH IN ${daysUntil}D`
          : baseStageLabel;
      return {
        phaseKey: 'USER_MATCH_READY',
        competitionId: 'IPL',
        stageBadge: badge,
        headline:
          userIplFix.playoffStage !== 'NONE'
            ? `IPL ${baseStageLabel}`
            : `League Match ${userIplFix.matchNumber}`,
        subtext: `${userIplFix.homeFranchiseId} vs ${userIplFix.awayFranchiseId} · ${userIplFix.dateStr}`,
        userFixture: userIplFix,
        daysUntilUserMatch: daysUntil,
        userIplRank,
        iplCompletedMatches,
        iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
        iplChampionId,
        gclChampionId,
      };
    }

    // 2. If IPL League still has remaining AI matches after user finished all 14 matches
    if (!iplLeagueDone) {
      const nextAiLeague = iplLeagueFixtures.find(f => !f.isCompleted);
      return {
        phaseKey: 'WAITING_IPL_AI_LEAGUE',
        competitionId: 'IPL',
        stageBadge: 'ROUND 14 FINALE',
        headline: '14/14 League Matches Complete',
        subtext: `Current Rank #${userIplRank} · Simulate remaining Round 14 fixtures to lock Top 4 & seed Playoffs.`,
        nextAiFixture: nextAiLeague,
        daysUntilUserMatch: 0,
        userIplRank,
        iplCompletedMatches,
        iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
        iplChampionId,
        gclChampionId,
      };
    }

    // 3. IPL League finished, Playoffs active (either user won Q1 waiting for Elim/Q2, or user missed/exited Playoffs)
    if (!iplChampionId) {
      const nextPlayoffAi = iplFixtures.find(
        f =>
          f.playoffStage !== 'NONE' &&
          !f.isCompleted &&
          !f.homeFranchiseId.startsWith('TBD') &&
          !f.awayFranchiseId.startsWith('TBD')
      );
      const userWonQ1WaitingFinal = Boolean(
        iplFixtures.find(
          f =>
            f.playoffStage === 'QUALIFIER_1' &&
            f.isCompleted &&
            f.winnerFranchiseId === careerInput.franchiseId
        )
      );
      return {
        phaseKey: 'WAITING_IPL_PLAYOFFS',
        competitionId: 'IPL',
        stageBadge: 'IPL PLAYOFFS',
        headline: userWonQ1WaitingFinal
          ? 'Qualified for IPL Final!'
          : userIplRank <= 4
          ? 'IPL Playoffs in Progress'
          : 'IPL Playoffs Underway',
        subtext: userWonQ1WaitingFinal
          ? 'Simulate Eliminator & Qualifier 2 to reveal your IPL Final opponent.'
          : nextPlayoffAi
          ? `Next Playoff: ${nextPlayoffAi.playoffStage.replace('_', ' ')} (${nextPlayoffAi.homeFranchiseId} vs ${nextPlayoffAi.awayFranchiseId})`
          : 'Simulate remaining IPL Playoffs to crown the Champion.',
        nextAiFixture: nextPlayoffAi,
        daysUntilUserMatch: 0,
        userIplRank,
        iplCompletedMatches,
        iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
        iplChampionId,
        gclChampionId,
      };
    }

    // 4. IPL Complete, Global Champions League T20 not yet started
    if (!gcl) {
      const champTeam = getGlobalTeamById(iplChampionId);
      return {
        phaseKey: 'IPL_COMPLETE_READY_FOR_GCL',
        competitionId: 'GCL_T20',
        stageBadge: 'CHAMPIONS LEAGUE NEXT',
        headline: `${champTeam.shortName} Crowned IPL Champion!`,
        subtext: `Advance into the Global Champions League T20 (${ws?.currentGameYear || 2026}) with the world's top clubs.`,
        daysUntilUserMatch: 0,
        userIplRank,
        iplCompletedMatches,
        iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
        iplChampionId,
        gclChampionId,
      };
    }

    // 5. Global Champions League T20 active
    if (!gclChampionId) {
      const userGclFix = gcl.fixtures.find(
        f =>
          !f.isCompleted &&
          !f.homeFranchiseId.startsWith('TBD') &&
          !f.awayFranchiseId.startsWith('TBD') &&
          (f.homeFranchiseId === careerInput.franchiseId || f.awayFranchiseId === careerInput.franchiseId)
      );
      if (userGclFix) {
        const targetIso = userGclFix.matchDateIso || currentIso;
        const daysUntil = targetIso > currentIso ? daysBetweenIso(currentIso, targetIso) : 0;
        const gclBadge =
          userGclFix.playoffStage === 'FINAL'
            ? 'GCL GRAND FINAL'
            : stageLabelMap[userGclFix.playoffStage] || 'GCL T20';
        const badge =
          daysUntil > 0
            ? daysUntil === 1
              ? 'GCL TOMORROW'
              : `GCL IN ${daysUntil}D`
            : gclBadge;
        return {
          phaseKey: 'USER_MATCH_READY',
          competitionId: 'GCL_T20',
          stageBadge: badge,
          headline: `Champions League · ${gclBadge}`,
          subtext: `${userGclFix.homeFranchiseId} vs ${userGclFix.awayFranchiseId} · ${userGclFix.dateStr}`,
          userFixture: userGclFix,
          daysUntilUserMatch: daysUntil,
          userIplRank,
          iplCompletedMatches,
          iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
          iplChampionId,
          gclChampionId,
        };
      }

      const nextGclAi = gcl.fixtures.find(
        f =>
          !f.isCompleted &&
          !f.homeFranchiseId.startsWith('TBD') &&
          !f.awayFranchiseId.startsWith('TBD')
      );
      return {
        phaseKey: 'WAITING_GCL_AI',
        competitionId: 'GCL_T20',
        stageBadge: `GCL · ${gcl.status.replace('_', ' ')}`,
        headline: 'Champions League T20 in Progress',
        subtext: nextGclAi
          ? `Next Match: ${nextGclAi.homeFranchiseId} vs ${nextGclAi.awayFranchiseId} (${nextGclAi.playoffStage.replace('_', ' ')})`
          : 'Advance Champions League fixtures to crown the World Champion.',
        nextAiFixture: nextGclAi,
        daysUntilUserMatch: 0,
        userIplRank,
        iplCompletedMatches,
        iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
        iplChampionId,
        gclChampionId,
      };
    }

    // 6. Both IPL & GCL complete -> Ready for Next Season / Next Calendar Year
    const gclChamp = getGlobalTeamById(gclChampionId);
    return {
      phaseKey: 'SEASON_COMPLETE',
      competitionId: 'GCL_T20',
      stageBadge: `SEASON ${careerInput.currentSeason} COMPLETE`,
      headline: `${gclChamp.shortName} Won GCL T20!`,
      subtext: `Ready to advance to Season ${careerInput.currentSeason + 1} (${(ws?.currentGameYear || 2026) + 1}).`,
      daysUntilUserMatch: 0,
      userIplRank,
      iplCompletedMatches,
      iplTotalLeagueMatches: iplLeagueFixtures.length || 70,
      iplChampionId,
      gclChampionId,
    };
  }

  /**
   * Smart one-click progression through AI bottlenecks:
   * - Round 14 AI finish -> seeds IPL Playoffs
   * - AI Playoff matches -> reaches User's Final or crowns IPL Champion
   * - IPL Champion -> generates Global Champions League T20
   * - AI GCL matches -> reaches User's next GCL knockout or crowns GCL Champion
   * - Season Complete -> transitions cleanly to Season N+1 / Year N+1
   */
  static advanceToNextPlayableStep(
    careerInput: CareerSave,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    simulatedCount: number;
    newlyAwardedTrophies: CareerTrophy[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const phase = this.getCareerPhaseProgress(career);
    const protectedId = this.getActiveProtectedFixtureId();
    let simulatedCount = 0;
    const allTrophies: CareerTrophy[] = [];

    if (phase.phaseKey === 'WAITING_IPL_AI_LEAGUE') {
      const res = this.simulateRemainingLeague(career, 'IPL', allPlayers, true);
      career = res.updatedCareer;
      simulatedCount += res.simulatedCount;
      allTrophies.push(...res.newlyAwardedTrophies);
      const nextPhase = this.getCareerPhaseProgress(career);
      const nextDateIso =
        nextPhase.userFixture?.matchDateIso ||
        career.worldSeason!.domesticLeagues.IPL.fixtures.find(f => f.playoffStage === 'QUALIFIER_1')?.matchDateIso;
      if (nextDateIso && nextDateIso > career.worldSeason!.currentDateIso) {
        career = {
          ...career,
          worldSeason: { ...career.worldSeason!, currentDateIso: nextDateIso },
          currentCareerDate: new Date(`${nextDateIso}T12:00:00`).getTime(),
        };
      }
      return { updatedCareer: career, simulatedCount, newlyAwardedTrophies: allTrophies };
    }

    if (phase.phaseKey === 'WAITING_IPL_PLAYOFFS') {
      for (let guard = 0; guard < 10; guard++) {
        const curPhase = this.getCareerPhaseProgress(career);
        if (curPhase.phaseKey !== 'WAITING_IPL_PLAYOFFS') break;
        const nextAi = curPhase.nextAiFixture;
        if (!nextAi || nextAi.fixtureId === protectedId) break;
        const res = this.simulateSpecificFixture(career, 'IPL', nextAi.fixtureId, allPlayers);
        career = res.updatedCareer;
        if (res.simulatedFixture) simulatedCount += 1;
        allTrophies.push(...res.newlyAwardedTrophies);
      }
      const afterPhase = this.getCareerPhaseProgress(career);
      if (afterPhase.userFixture?.matchDateIso && afterPhase.userFixture.matchDateIso > career.worldSeason!.currentDateIso) {
        career = {
          ...career,
          worldSeason: { ...career.worldSeason!, currentDateIso: afterPhase.userFixture.matchDateIso },
          currentCareerDate: new Date(`${afterPhase.userFixture.matchDateIso}T12:00:00`).getTime(),
        };
      }
      return { updatedCareer: career, simulatedCount, newlyAwardedTrophies: allTrophies };
    }

    if (phase.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL') {
      // Complete any remaining earlier/mid-year domestic leagues & generate GCL T20
      for (const def of DOMESTIC_LEAGUES) {
        if (def.id === 'IPL') continue;
        const trn = career.worldSeason!.domesticLeagues[def.id];
        if (!trn?.playoffs?.championFranchiseId) {
          const res = this.simulateRemainingLeague(career, def.id, allPlayers, false);
          career = res.updatedCareer;
          simulatedCount += res.simulatedCount;
          allTrophies.push(...res.newlyAwardedTrophies);
        }
      }
      if (!career.worldSeason!.championsLeague) {
        const { worldSeason } = this.generateChampionsLeague(career.worldSeason!, allPlayers, career);
        const startGclIso = `${worldSeason.currentGameYear}-10-02`;
        const nextIso = worldSeason.currentDateIso < startGclIso ? startGclIso : worldSeason.currentDateIso;
        career = {
          ...career,
          seasonPhase: 'Champions League',
          worldSeason: {
            ...worldSeason,
            currentDateIso: nextIso,
          },
          currentCareerDate: new Date(`${nextIso}T12:00:00`).getTime(),
        };
      }
      return { updatedCareer: career, simulatedCount, newlyAwardedTrophies: allTrophies };
    }

    if (phase.phaseKey === 'WAITING_GCL_AI') {
      for (let guard = 0; guard < 40; guard++) {
        const curPhase = this.getCareerPhaseProgress(career);
        if (curPhase.phaseKey !== 'WAITING_GCL_AI') break;
        const nextAi = curPhase.nextAiFixture;
        if (!nextAi || nextAi.fixtureId === protectedId) break;
        const res = this.simulateSpecificFixture(career, 'GCL_T20', nextAi.fixtureId, allPlayers);
        career = res.updatedCareer;
        if (res.simulatedFixture) simulatedCount += 1;
        allTrophies.push(...res.newlyAwardedTrophies);
      }
      const afterPhase = this.getCareerPhaseProgress(career);
      if (afterPhase.userFixture?.matchDateIso && afterPhase.userFixture.matchDateIso > career.worldSeason!.currentDateIso) {
        career = {
          ...career,
          worldSeason: { ...career.worldSeason!, currentDateIso: afterPhase.userFixture.matchDateIso },
          currentCareerDate: new Date(`${afterPhase.userFixture.matchDateIso}T12:00:00`).getTime(),
        };
      }
      return { updatedCareer: career, simulatedCount, newlyAwardedTrophies: allTrophies };
    }

    if (phase.phaseKey === 'SEASON_COMPLETE') {
      const { updatedCareer } = this.advanceToNextCalendarYear(career, allPlayers);
      return { updatedCareer, simulatedCount: 0, newlyAwardedTrophies: [] };
    }

    return { updatedCareer: career, simulatedCount: 0, newlyAwardedTrophies: [] };
  }

  /**
   * Jump directly from a Training/Gap Day to the user's next scheduled Match Day.
   * Simulates intervening AI fixtures cleanly and recovers squad stamina over the rest/training days.
   */
  static advanceToUserNextMatch(
    careerInput: CareerSave,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    simulatedCount: number;
    newlyAwardedTrophies: CareerTrophy[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const phase = this.getCareerPhaseProgress(career);

    if (phase.phaseKey !== 'USER_MATCH_READY' || !phase.userFixture) {
      return this.advanceToNextPlayableStep(career, allPlayers);
    }

    const daysToJump = Math.max(0, Math.min(180, phase.daysUntilUserMatch));
    if (daysToJump <= 0) {
      return { updatedCareer: career, simulatedCount: 0, newlyAwardedTrophies: [] };
    }

    // Recover squad stamina & reduce injury days across the jumped days
    const nextWorkloads = { ...(career.playerWorkloads || {}) };
    Object.keys(nextWorkloads).forEach(pid => {
      const w = nextWorkloads[pid];
      if (!w) return;
      const recoveredDays = Math.max(0, (w.daysInjuredRemaining || 0) - daysToJump);
      nextWorkloads[pid] = {
        ...w,
        stamina: Math.min(100, (w.stamina ?? 80) + daysToJump * 8),
        fatigue: Math.max(0, (w.fatigue ?? 15) - daysToJump * 8),
        isInjured: recoveredDays > 0 ? w.isInjured : false,
        daysInjuredRemaining: recoveredDays,
        injuryRisk: 'LOW',
      };
    });

    const simRes = this.simulateDays(
      { ...career, playerWorkloads: nextWorkloads },
      daysToJump,
      allPlayers,
      true
    );
    career = simRes.updatedCareer;

    const targetIso = phase.userFixture.matchDateIso;
    if (targetIso && career.worldSeason && career.worldSeason.currentDateIso < targetIso) {
      career = {
        ...career,
        worldSeason: {
          ...career.worldSeason,
          currentDateIso: targetIso,
        },
        currentCareerDate: new Date(`${targetIso}T12:00:00`).getTime(),
      };
    }

    return {
      updatedCareer: career,
      simulatedCount: simRes.simulatedCount,
      newlyAwardedTrophies: simRes.newlyAwardedTrophies,
    };
  }

  /**
   * Simulate all remaining fixtures (league stage + playoffs) in a specific domestic league
   */
  static simulateRemainingLeague(
    careerInput: CareerSave,
    leagueId: DomesticLeagueId,
    allPlayers: Player[],
    leagueStageOnly: boolean = false
  ): {
    updatedCareer: CareerSave;
    simulatedCount: number;
    newlyAwardedTrophies: CareerTrophy[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const protectedId = this.getActiveProtectedFixtureId();
    let simulatedCount = 0;
    const allTrophies: CareerTrophy[] = [];

    for (let guard = 0; guard < 120; guard++) {
      const trn = career.worldSeason!.domesticLeagues[leagueId];
      const next = trn.fixtures.find(
        f =>
          !f.isCompleted &&
          !f.homeFranchiseId.startsWith('TBD') &&
          !f.awayFranchiseId.startsWith('TBD') &&
          f.fixtureId !== protectedId &&
          (!leagueStageOnly || f.playoffStage === 'NONE')
      );
      if (!next) break;
      const res = this.simulateSpecificFixture(career, leagueId, next.fixtureId, allPlayers);
      career = res.updatedCareer;
      if (res.simulatedFixture) simulatedCount += 1;
      allTrophies.push(...res.newlyAwardedTrophies);
    }

    career = this.maybeAutoTriggerGcl(career, allPlayers);
    return {
      updatedCareer: career,
      simulatedCount,
      newlyAwardedTrophies: allTrophies,
    };
  }

  /**
   * Simulate entire remaining calendar year: all 8 domestic leagues -> Global Champions League -> Grand Final
   */
  static simulateEntireSeason(
    careerInput: CareerSave,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    simulatedCount: number;
    newlyAwardedTrophies: CareerTrophy[];
  } {
    let career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const protectedId = this.getActiveProtectedFixtureId();
    let simulatedCount = 0;
    const allTrophies: CareerTrophy[] = [];

    // 1. Complete all 8 domestic leagues
    for (const def of DOMESTIC_LEAGUES) {
      const res = this.simulateRemainingLeague(career, def.id, allPlayers, false);
      career = res.updatedCareer;
      simulatedCount += res.simulatedCount;
      allTrophies.push(...res.newlyAwardedTrophies);
    }

    // 2. Generate GCL if not already generated
    if (!career.worldSeason!.championsLeague) {
      const { worldSeason } = this.generateChampionsLeague(career.worldSeason!, allPlayers, career);
      career = {
        ...career,
        seasonPhase: 'Champions League',
        worldSeason: {
          ...worldSeason,
          currentDateIso: `${worldSeason.currentGameYear}-10-02`,
        },
        currentCareerDate: new Date(`${worldSeason.currentGameYear}-10-02T12:00:00`).getTime(),
      };
    }

    // 3. Complete GCL Group Stage -> QF -> SF -> Grand Final
    for (let guard = 0; guard < 60; guard++) {
      const gcl = career.worldSeason!.championsLeague;
      if (!gcl) break;
      const next = gcl.fixtures.find(
        f =>
          !f.isCompleted &&
          !f.homeFranchiseId.startsWith('TBD') &&
          !f.awayFranchiseId.startsWith('TBD') &&
          f.fixtureId !== protectedId
      );
      if (!next) break;
      const res = this.simulateSpecificFixture(career, 'GCL_T20', next.fixtureId, allPlayers);
      career = res.updatedCareer;
      if (res.simulatedFixture) simulatedCount += 1;
      allTrophies.push(...res.newlyAwardedTrophies);
    }

    return {
      updatedCareer: career,
      simulatedCount,
      newlyAwardedTrophies: allTrophies,
    };
  }

  /**
   * Transition career cleanly to Next Calendar Year (Season N+1, Jan 02)
   * Preserves all permanent trophies, achievements, match history, and player career records.
   */
  static advanceToNextCalendarYear(
    careerInput: CareerSave,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    retiredPlayers: Player[];
  } {
    const career = this.ensureCareerWorldSeason(careerInput, allPlayers);
    const ipl = career.worldSeason!.domesticLeagues.IPL;
    const { updatedCareer: baseNext, retiredPlayers } = MultiSeasonEngine.advanceToNextSeason(
      career,
      ipl,
      allPlayers
    );

    const nextYear = (career.worldSeason!.currentGameYear || 2026) + 1;
    const nextStartIso = `${nextYear}-01-02`;

    // Off-season full fitness & stamina reset so Season N+1 starts healthy
    const recoveredWorkloads = { ...(baseNext.playerWorkloads || {}) };
    (baseNext.squadPlayerIds || []).forEach(pid => {
      const prev = recoveredWorkloads[pid];
      recoveredWorkloads[pid] = {
        ...(prev || {
          playerId: pid,
          formScore: 85,
          moraleScore: 8,
        }),
        playerId: pid,
        stamina: 100,
        fatigue: 0,
        injuryRisk: 'LOW',
        isInjured: false,
        daysInjuredRemaining: 0,
      };
    });

    const nextWorldSeason = this.initializeWorldSeason(
      nextYear,
      baseNext.tournament,
      career.worldSeason!.gclSlotConfig,
      nextStartIso,
      allPlayers,
      baseNext
    );

    const kickoffNotif = {
      id: `notif_season_${nextYear}_${Date.now()}`,
      title: `Season ${baseNext.currentSeason} (${nextYear}) Underway`,
      message: `Pre-season complete! Early global leagues concluded and your ${nextYear} IPL campaign begins now.`,
      date: nextStartIso,
      read: false,
      type: 'INFO' as const,
    };

    let updatedCareer: CareerSave = {
      ...baseNext,
      seasonPhase: 'SEASON_ACTIVE',
      currentGameYear: nextYear,
      currentCareerDate: new Date(`${nextStartIso}T12:00:00`).getTime(),
      playerWorkloads: recoveredWorkloads,
      worldSeason: nextWorldSeason,
      tournament: nextWorldSeason.domesticLeagues.IPL,
      trophiesCollected: career.trophiesCollected || [],
      unlockedAchievementIds: career.unlockedAchievementIds || [],
      matchHistory: career.matchHistory || [],
      recordedMatchIds: career.recordedMatchIds || [],
      notifications: [kickoffNotif, ...(career.notifications || [])].slice(0, 30),
      unreadNotificationsCount: (career.unreadNotificationsCount || 0) + 1,
    };

    // Advance cleanly across early-year domestic leagues (BBL, SA20, ILT20, PSL) right up to Season N+1 IPL Match Day #1
    const firstUserIplFix = nextWorldSeason.domesticLeagues.IPL.fixtures.find(
      f => f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId
    );
    if (firstUserIplFix?.matchDateIso && firstUserIplFix.matchDateIso > nextStartIso) {
      const gapDays = daysBetweenIso(nextStartIso, firstUserIplFix.matchDateIso);
      if (gapDays > 0) {
        updatedCareer = this.simulateDays(updatedCareer, gapDays, allPlayers, true).updatedCareer;
      }
    }

    return { updatedCareer, retiredPlayers };
  }
}

export { processGlobalMatchResultHelpers };
