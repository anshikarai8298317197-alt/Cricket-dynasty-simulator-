/**
 * WICKET DYNASTY - Franchise Team Transfer Service (Part 10)
 * Allows switching coached franchise inside an active career at any time:
 * - All 10 IPL franchises unlocked with ZERO coach level or tier restrictions
 * - Preserves coach progress, permanent trophies, achievements, matchHistory & seasonal records
 * - Archives outgoing franchise squad/purse cleanly & loads target franchise squad, Playing XI, C/VC/WK & venue
 * - Clears any stale in-progress match belonging to previous team context cleanly
 */
import { CareerSave, TeamTransferRecord } from '../types/career';
import { Player } from '../types/player';
import { FRANCHISES } from '../data/franchises';
import { ClubProfile } from '../types/club';
import { ClubEngine } from './clubEngine';
import { DbPersistence } from './dbPersistence';

export class TeamTransferService {
  /**
   * Builds a balanced 11-player starting XI from a franchise squad (max 4 overseas, >=1 WK if available)
   */
  static buildBalancedPlayingXI(
    squadIds: string[],
    allPlayers: Player[],
    overrides?: Record<string, any>
  ): {
    playingXiIds: string[];
    captainId: string | null;
    viceCaptainId: string | null;
    wicketKeeperId: string | null;
  } {
    const resolvePlayer = (id: string): Player | undefined => {
      const base = allPlayers.find(p => p.id === id);
      if (!base) return undefined;
      return overrides?.[id] ? { ...base, ...overrides[id] } : base;
    };

    const pool = squadIds
      .map(resolvePlayer)
      .filter((p): p is Player => Boolean(p))
      .sort((a, b) => b.overallRating - a.overallRating);

    if (pool.length === 0) {
      return { playingXiIds: [], captainId: null, viceCaptainId: null, wicketKeeperId: null };
    }

    const selected: Player[] = [];
    const usedIds = new Set<string>();
    let overseasCount = 0;

    // 1. Prioritize at least 1 Wicketkeeper
    const bestWk = pool.find(p => p.isWicketkeeper || p.primaryRole.includes('Wicketkeeper'));
    if (bestWk) {
      selected.push(bestWk);
      usedIds.add(bestWk.id);
      if (bestWk.isOverseas) overseasCount += 1;
    }

    // 2. Fill remaining spots respecting max 4 overseas limit first
    for (const p of pool) {
      if (selected.length >= 11) break;
      if (usedIds.has(p.id)) continue;
      if (p.isOverseas && overseasCount >= 4) continue;
      selected.push(p);
      usedIds.add(p.id);
      if (p.isOverseas) overseasCount += 1;
    }

    // 3. Fallback pad if domestic depth is sparse (< 11)
    for (const p of pool) {
      if (selected.length >= 11) break;
      if (usedIds.has(p.id)) continue;
      selected.push(p);
      usedIds.add(p.id);
    }

    const captain =
      [...selected].sort((a, b) => (b.mental?.leadership || 60) - (a.mental?.leadership || 60))[0] ||
      selected[0] ||
      null;
    const viceCaptain = selected.find(p => p.id !== captain?.id) || selected[0] || null;
    const wicketKeeper =
      selected.find(p => p.isWicketkeeper || p.primaryRole.includes('Wicketkeeper')) ||
      bestWk ||
      selected[2] ||
      selected[0] ||
      null;

    return {
      playingXiIds: selected.map(p => p.id),
      captainId: captain?.id || null,
      viceCaptainId: viceCaptain?.id || null,
      wicketKeeperId: wicketKeeper?.id || null,
    };
  }

  /**
   * Transfers coach to another IPL franchise inside the active saved career.
   * Zero franchise locks / tier restrictions: all 10 teams are immediately eligible.
   */
  static transferCoachToFranchise(
    career: CareerSave,
    targetFranchiseId: string,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    transferRecord: TeamTransferRecord;
  } {
    const targetFranchise = FRANCHISES.find(f => f.id === targetFranchiseId);
    if (!targetFranchise) {
      throw new Error(`Unknown franchise "${targetFranchiseId}".`);
    }
    if (targetFranchiseId === career.franchiseId) {
      throw new Error(`You are already managing ${targetFranchise.name}.`);
    }

    const previousFranchise =
      FRANCHISES.find(f => f.id === career.franchiseId) || {
        id: career.franchiseId,
        name: career.franchiseId,
        startingPurseCr: 100,
        homeStadium: 'Home Stadium',
      };

    const now = Date.now();
    const prevHistory = career.previousTeamsHistory || [];
    const lastRecord = prevHistory[0];
    const fromSeason = lastRecord ? lastRecord.toSeason : 1;

    const transferRecord: TeamTransferRecord = {
      franchiseId: previousFranchise.id,
      franchiseName: previousFranchise.name,
      fromSeason,
      toSeason: career.currentSeason,
      transferredAt: now,
      matchesManaged: career.statsSummary?.matchesPlayed || 0,
    };

    // 1. Archive outgoing team squad & purse cleanly in career multi-franchise map
    const updatedAllSquads: Record<string, string[]> = {
      ...(career.allFranchiseSquads || {}),
      [career.franchiseId]: [...(career.squadPlayerIds || [])],
    };

    // Populate any missing IPL team rosters from master database
    for (const f of FRANCHISES) {
      if (!updatedAllSquads[f.id] || updatedAllSquads[f.id].length === 0) {
        updatedAllSquads[f.id] = allPlayers
          .filter(p => p.originalFranchiseId === f.id || p.contract?.currentFranchiseId === f.id)
          .map(p => p.id)
          .slice(0, 25);
      }
    }

    const updatedAllPurses: Record<string, number> = {
      ...(career.allFranchisePurses || {}),
      [career.franchiseId]: career.purseBalanceCr,
    };

    const targetSquadIds = updatedAllSquads[targetFranchiseId] || [];
    const targetPurseCr =
      typeof updatedAllPurses[targetFranchiseId] === 'number'
        ? updatedAllPurses[targetFranchiseId]
        : targetFranchise.startingPurseCr;

    // 2. Build balanced XI for the new team
    const xiSetup = this.buildBalancedPlayingXI(targetSquadIds, allPlayers, career.careerPlayerOverrides);

    // 3. Update ClubProfile stadium name while retaining club reputation/brand/archive/ledger
    const existingProfile = (career.clubProfile ||
      ClubEngine.generateInitialClubProfile(targetFranchise, career.id)) as ClubProfile;

    const updatedProfile: ClubProfile = {
      ...existingProfile,
      stadiumName: targetFranchise.homeStadium,
    };

    // 4. Clear any paused match from previous club so new team doesn't inherit stale match context
    const activeMatch = DbPersistence.getActiveLiveMatch();
    if (
      activeMatch &&
      activeMatch.careerId === career.id &&
      activeMatch.homeFranchiseId !== targetFranchiseId &&
      activeMatch.awayFranchiseId !== targetFranchiseId
    ) {
      DbPersistence.clearLiveMatch();
    }

    const transferNotif = {
      id: `notif_transfer_${targetFranchiseId}_${now}`,
      title: `Signed as Head Coach of ${targetFranchise.shortName}`,
      message: `Transferred from ${previousFranchise.name} to ${targetFranchise.name}. Squad (${targetSquadIds.length}), trophies, and career records preserved.`,
      date: career.worldSeason?.currentDateIso || 'Today',
      read: false,
      type: 'INFO' as const,
    };

    const updatedCareer: CareerSave = {
      ...career,
      franchiseId: targetFranchiseId,
      purseBalanceCr: targetPurseCr,
      squadPlayerIds: targetSquadIds,
      playingXiIds: xiSetup.playingXiIds,
      captainId: xiSetup.captainId,
      viceCaptainId: xiSetup.viceCaptainId,
      wicketKeeperId: xiSetup.wicketKeeperId,
      impactPlayerId: null,
      allFranchiseSquads: updatedAllSquads,
      allFranchisePurses: updatedAllPurses,
      clubProfile: updatedProfile,
      previousTeamsHistory: [transferRecord, ...prevHistory],
      notifications: [transferNotif, ...(career.notifications || [])].slice(0, 30),
      unreadNotificationsCount: (career.unreadNotificationsCount || 0) + 1,
      lastPlayedAt: now,
    };

    return { updatedCareer, transferRecord };
  }
}
