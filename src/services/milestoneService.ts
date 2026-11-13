/**
 * WICKET DYNASTY - Player Career Milestone Evaluation Service
 * Detects when squad cricketers cross landmark career thresholds
 * (e.g., 500 career runs, 100 career wickets, 50/100/150 matches) and emits popup events.
 */
import { CareerSave } from '../types/career';
import { MatchResultDetails } from '../types/match';
import { Player } from '../types/player';

export interface PlayerMilestoneEvent {
  id: string;
  playerId: string;
  playerName: string;
  playerRole: string;
  franchiseId: string;
  category: 'RUNS' | 'WICKETS' | 'MATCHES';
  threshold: number;
  title: string;
  subtitle: string;
  newTotal: number;
  matchDelta: number;
  achievedAt: number;
}

const RUN_THRESHOLDS = [500, 1000, 1500, 2000, 3000, 5000];
const WICKET_THRESHOLDS = [50, 100, 150, 200, 250];
const MATCH_THRESHOLDS = [50, 100, 150, 200];

export class MilestoneService {
  /**
   * Accumulate completed match contributions for user squad players and detect newly crossed landmarks
   */
  static processMatchMilestones(
    career: CareerSave,
    result: MatchResultDetails,
    allPlayers: Player[]
  ): {
    updatedCareer: CareerSave;
    newlyUnlockedMilestones: PlayerMilestoneEvent[];
  } {
    const prevCareerStats = { ...(career.careerPlayerStats || {}) };
    const prevOverrides = { ...(career.careerPlayerOverrides || {}) };
    const triggeredSet = new Set<string>(career.triggeredMilestones || []);
    const newlyUnlockedMilestones: PlayerMilestoneEvent[] = [];
    const newNotifications = [...(career.notifications || [])];

    const playerMap = new Map<string, Player>();
    allPlayers.forEach(p => playerMap.set(p.id, p));

    // Aggregate per-player contribution from both innings for user's squad
    const contribMap: Record<string, { runs: number; wickets: number; played: boolean }> = {};
    const squadSet = new Set<string>(career.squadPlayerIds || []);

    const recordInnings = (inn: MatchResultDetails['innings1']) => {
      if (!inn) return;
      inn.batters?.forEach(b => {
        if (!squadSet.has(b.playerId)) return;
        if (!contribMap[b.playerId]) contribMap[b.playerId] = { runs: 0, wickets: 0, played: true };
        contribMap[b.playerId].runs += b.runs || 0;
        contribMap[b.playerId].played = true;
      });
      inn.bowlers?.forEach(bw => {
        if (!squadSet.has(bw.playerId)) return;
        if (!contribMap[bw.playerId]) contribMap[bw.playerId] = { runs: 0, wickets: 0, played: true };
        contribMap[bw.playerId].wickets += bw.wickets || 0;
        contribMap[bw.playerId].played = true;
      });
    };

    recordInnings(result.innings1);
    recordInnings(result.innings2);

    const now = Date.now();

    Object.entries(contribMap).forEach(([playerId, delta]) => {
      const basePlayer = playerMap.get(playerId);
      const override = prevOverrides[playerId];
      const existingStat = prevCareerStats[playerId] || {
        matches: override?.careerStats?.matches ?? basePlayer?.careerStats?.matches ?? 0,
        runs: override?.careerStats?.runs ?? basePlayer?.careerStats?.runs ?? 0,
        wickets: override?.careerStats?.wickets ?? basePlayer?.careerStats?.wickets ?? 0,
      };

      const nextStat = {
        matches: existingStat.matches + (delta.played ? 1 : 0),
        runs: existingStat.runs + delta.runs,
        wickets: existingStat.wickets + delta.wickets,
      };

      prevCareerStats[playerId] = nextStat;
      prevOverrides[playerId] = {
        ...(override || {}),
        careerStats: {
          ...(basePlayer?.careerStats || {}),
          ...(override?.careerStats || {}),
          matches: nextStat.matches,
          runs: nextStat.runs,
          wickets: nextStat.wickets,
        },
      };

      const playerName = basePlayer?.name || playerId;
      const playerRole = basePlayer?.primaryRole || 'Cricketer';

      // Check Runs landmarks (e.g., 500 career runs)
      for (const threshold of RUN_THRESHOLDS) {
        const key = `${playerId}_RUNS_${threshold}`;
        if (existingStat.runs < threshold && nextStat.runs >= threshold && !triggeredSet.has(key)) {
          triggeredSet.add(key);
          const ev: PlayerMilestoneEvent = {
            id: key,
            playerId,
            playerName,
            playerRole,
            franchiseId: career.franchiseId,
            category: 'RUNS',
            threshold,
            title: `${threshold.toLocaleString()} Career Runs`,
            subtitle: `${playerName} crossed ${threshold.toLocaleString()} career runs in franchise cricket!`,
            newTotal: nextStat.runs,
            matchDelta: delta.runs,
            achievedAt: now,
          };
          newlyUnlockedMilestones.push(ev);
          newNotifications.unshift({
            id: `ms_${key}_${now}`,
            title: `Milestone: ${ev.title}`,
            message: ev.subtitle,
            date: 'Match Day',
            read: false,
            type: 'ACHIEVEMENT',
          });
        }
      }

      // Check Wickets landmarks (e.g., 100 career wickets)
      for (const threshold of WICKET_THRESHOLDS) {
        const key = `${playerId}_WICKETS_${threshold}`;
        if (existingStat.wickets < threshold && nextStat.wickets >= threshold && !triggeredSet.has(key)) {
          triggeredSet.add(key);
          const ev: PlayerMilestoneEvent = {
            id: key,
            playerId,
            playerName,
            playerRole,
            franchiseId: career.franchiseId,
            category: 'WICKETS',
            threshold,
            title: `${threshold.toLocaleString()} Career Wickets`,
            subtitle: `${playerName} claimed their ${threshold}th career wicket!`,
            newTotal: nextStat.wickets,
            matchDelta: delta.wickets,
            achievedAt: now,
          };
          newlyUnlockedMilestones.push(ev);
          newNotifications.unshift({
            id: `ms_${key}_${now}`,
            title: `Milestone: ${ev.title}`,
            message: ev.subtitle,
            date: 'Match Day',
            read: false,
            type: 'ACHIEVEMENT',
          });
        }
      }

      // Check Matches landmarks
      for (const threshold of MATCH_THRESHOLDS) {
        const key = `${playerId}_MATCHES_${threshold}`;
        if (existingStat.matches < threshold && nextStat.matches >= threshold && !triggeredSet.has(key)) {
          triggeredSet.add(key);
          const ev: PlayerMilestoneEvent = {
            id: key,
            playerId,
            playerName,
            playerRole,
            franchiseId: career.franchiseId,
            category: 'MATCHES',
            threshold,
            title: `${threshold} Career Appearances`,
            subtitle: `${playerName} featured in their ${threshold}th career match!`,
            newTotal: nextStat.matches,
            matchDelta: 1,
            achievedAt: now,
          };
          newlyUnlockedMilestones.push(ev);
          newNotifications.unshift({
            id: `ms_${key}_${now}`,
            title: `Milestone: ${ev.title}`,
            message: ev.subtitle,
            date: 'Match Day',
            read: false,
            type: 'ACHIEVEMENT',
          });
        }
      }
    });

    const updatedCareer: CareerSave = {
      ...career,
      careerPlayerStats: prevCareerStats,
      careerPlayerOverrides: prevOverrides,
      triggeredMilestones: Array.from(triggeredSet),
      notifications: newNotifications.slice(0, 35),
      unreadNotificationsCount:
        (career.unreadNotificationsCount || 0) + newlyUnlockedMilestones.length,
    };

    return { updatedCareer, newlyUnlockedMilestones };
  }
}
