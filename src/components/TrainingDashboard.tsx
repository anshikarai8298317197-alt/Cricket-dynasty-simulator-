/**
 * WICKET DYNASTY - Training & Development Centre (SCR_13)
 * Phase 03 Architecture
 */
import React, { useState } from 'react';
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import {
  TrainingFacility,
  Coach,
  DevelopmentLogEntry,
  PlayerWorkloadState,
  WeeklySchedule,
  TrainingIntensity,
  TrainingProgramme,
} from '../types/training';
import { TRAINING_PROGRAMMES, DEFAULT_COACHES, INITIAL_TRAINING_FACILITIES, generateInitialSchedule } from '../data/trainingData';
import { TrainingEngine } from '../services/trainingEngine';
import { IndividualTrainingModal } from './IndividualTrainingModal';
import { LevelPlayService } from '../services/levelPlayService';
import { DbPersistence } from '../services/dbPersistence';
import {
  ArrowLeft,
  Dumbbell,
  Users,
  Calendar,
  Building2,
  HeartPulse,
  FileText,
  Award,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Activity,
  Plus,
  PlayCircle,
  CheckCircle2,
  RefreshCw,
  Coins,
  Video,
} from 'lucide-react';

interface TrainingDashboardProps {
  career: CareerSave;
  allPlayers: Player[];
  onUpdateCareer: (updated: CareerSave) => void;
  onBack: () => void;
}

type TabType = 'OVERVIEW' | 'INDIVIDUAL' | 'SCHEDULE' | 'COACHES' | 'FACILITIES' | 'REPORTS' | 'RECOVERY';

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({
  career,
  allPlayers,
  onUpdateCareer,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [selectedPlayerForTraining, setSelectedPlayerForTraining] = useState<Player | null>(null);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Initialize or read facilities, coaches, workloads, schedule from career
  const facilities: TrainingFacility[] = career.facilities && career.facilities.length > 0
    ? career.facilities
    : INITIAL_TRAINING_FACILITIES;

  const coaches: Coach[] = career.coaches && career.coaches.length > 0
    ? career.coaches
    : DEFAULT_COACHES;

  const weeklySchedule: WeeklySchedule = career.weeklySchedule || generateInitialSchedule();
  const developmentReports: DevelopmentLogEntry[] = career.developmentReports || [];

  // Squad Players with current overrides applied
  const squadPlayers: Player[] = career.squadPlayerIds.map(id => {
    const base = allPlayers.find(p => p.id === id);
    const override = career.careerPlayerOverrides?.[id];
    if (!base) return null as any;
    return override ? { ...base, ...override } : base;
  }).filter(Boolean);

  // Workloads
  const playerWorkloads: Record<string, PlayerWorkloadState> = career.playerWorkloads || {};
  squadPlayers.forEach(p => {
    if (!playerWorkloads[p.id]) {
      playerWorkloads[p.id] = {
        playerId: p.id,
        fatigue: 15,
        fitness: 94,
        injuryRiskScore: 3,
        isInjured: false,
      };
    }
  });

  // Calculate squad stats
  const totalSquadSize = squadPlayers.length;
  const avgFitness = Math.round(
    squadPlayers.reduce((acc, p) => acc + (playerWorkloads[p.id]?.fitness || 90), 0) / (totalSquadSize || 1)
  );
  const injuredCount = squadPlayers.filter(p => playerWorkloads[p.id]?.isInjured).length;
  const fatiguedCount = squadPlayers.filter(p => (playerWorkloads[p.id]?.fatigue || 0) > 65).length;

  const battingCount = squadPlayers.filter(p => p.primaryRole.includes('Batter')).length;
  const bowlingCount = squadPlayers.filter(p => p.primaryRole.includes('Bowler')).length;
  const allRounderCount = squadPlayers.filter(p => p.primaryRole.includes('All-rounder')).length;

  // Notification helper
  const notify = (msg: string) => {
    setRecentNotification(msg);
    setTimeout(() => setRecentNotification(null), 4000);
  };

  // Execute Individual Drill immediately
  const handleExecuteDrillNow = (
    programme: TrainingProgramme,
    intensity: TrainingIntensity,
    coach: Coach
  ) => {
    if (!selectedPlayerForTraining) return;
    const player = selectedPlayerForTraining;
    const currentWk = playerWorkloads[player.id];

    const { updatedPlayer, updatedWorkload, logEntry } = TrainingEngine.processTrainingSession(
      player,
      programme,
      intensity,
      coach,
      facilities,
      currentWk
    );

    const updatedOverrides = {
      ...(career.careerPlayerOverrides || {}),
      [player.id]: updatedPlayer,
    };

    const updatedWkMap = {
      ...playerWorkloads,
      [player.id]: updatedWorkload,
    };

    const updatedLogs = [logEntry, ...developmentReports].slice(0, 50);

    const updatedCareer: CareerSave = {
      ...career,
      careerPlayerOverrides: updatedOverrides,
      playerWorkloads: updatedWkMap,
      developmentReports: updatedLogs,
      lastPlayedAt: Date.now(),
    };

    onUpdateCareer(updatedCareer);
    setSelectedPlayerForTraining(null);
    notify(`Training session completed for ${player.name}: ${logEntry.status} (${logEntry.notes})`);
  };

  // Assign to Weekly Schedule
  const handleAssignToSchedule = (
    programmeId: string,
    intensity: TrainingIntensity,
    coachId: string
  ) => {
    if (!selectedPlayerForTraining) return;
    const player = selectedPlayerForTraining;

    const currentSchedule = { ...weeklySchedule };
    const dayName = 'Monday'; // Assign to next available training day
    const dayObj = currentSchedule.days[dayName];

    if (dayObj) {
      // Remove previous assignment for this player if any
      dayObj.individualAssignments = (dayObj.individualAssignments || []).filter(
        a => a.playerId !== player.id
      );
      dayObj.individualAssignments.push({
        playerId: player.id,
        programmeId,
        intensity,
        coachId,
        assignedDay: 'Monday',
        sessionsRemaining: 1,
      });
    }

    const updatedCareer: CareerSave = {
      ...career,
      weeklySchedule: currentSchedule,
      lastPlayedAt: Date.now(),
    };

    onUpdateCareer(updatedCareer);
    setSelectedPlayerForTraining(null);
    notify(`Assigned ${player.name} to weekly training schedule.`);
  };

  // Advance Scheduled Day (Process all assigned sessions)
  const handleAdvanceScheduledDay = () => {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDayName = daysOrder[(weeklySchedule.weekNumber - 1) % 7] || 'Monday';
    const currentDaySchedule = weeklySchedule.days[currentDayName];

    const updatedOverrides = { ...(career.careerPlayerOverrides || {}) };
    const updatedWkMap = { ...playerWorkloads };
    const newLogs: DevelopmentLogEntry[] = [];

    // Process all assigned individual players
    if (currentDaySchedule && currentDaySchedule.individualAssignments) {
      currentDaySchedule.individualAssignments.forEach(assign => {
        const player = squadPlayers.find(p => p.id === assign.playerId);
        const prog = TRAINING_PROGRAMMES.find(p => p.id === assign.programmeId);
        const coach = coaches.find(c => c.id === assign.coachId) || coaches[0];
        const currentWk = updatedWkMap[assign.playerId];

        if (player && prog && currentWk && !currentWk.isInjured) {
          const res = TrainingEngine.processTrainingSession(
            player,
            prog,
            assign.intensity,
            coach,
            facilities,
            currentWk
          );
          updatedOverrides[player.id] = res.updatedPlayer;
          updatedWkMap[player.id] = res.updatedWorkload;
          newLogs.push(res.logEntry);
        }
      });
    }

    // Default rest recovery for unassigned players
    squadPlayers.forEach(p => {
      const isAssigned = currentDaySchedule?.individualAssignments?.some(a => a.playerId === p.id);
      if (!isAssigned && updatedWkMap[p.id]) {
        updatedWkMap[p.id] = TrainingEngine.applyRecoveryTreatment(updatedWkMap[p.id], 'LIGHT_RECOVERY');
      }
    });

    const nextWeekNumber = weeklySchedule.weekNumber + 1;
    const updatedCareer: CareerSave = {
      ...career,
      careerPlayerOverrides: updatedOverrides,
      playerWorkloads: updatedWkMap,
      weeklySchedule: {
        ...weeklySchedule,
        weekNumber: nextWeekNumber,
      },
      developmentReports: [...newLogs, ...developmentReports].slice(0, 60),
      lastPlayedAt: Date.now(),
    };

    onUpdateCareer(updatedCareer);
    notify(`Day complete: Advanced calendar. Processed ${newLogs.length} training sessions.`);
  };

  // Upgrade Training Facility
  const handleUpgradeFacility = (facilityId: string) => {
    const fac = facilities.find(f => f.id === facilityId);
    if (!fac) return;

    if (fac.level >= 5) {
      notify('Facility is already at Maximum Level 5.');
      return;
    }

    if (career.purseBalanceCr < fac.upgradeCostCr) {
      notify(`Insufficient Franchise Purse! Requires ₹${fac.upgradeCostCr.toFixed(2)} Cr.`);
      return;
    }

    const updatedFacilities = facilities.map(f => {
      if (f.id === facilityId) {
        return {
          ...f,
          level: f.level + 1,
          upgradeCostCr: Number((f.upgradeCostCr * 1.35).toFixed(2)),
          currentBonusText: `+${(f.level + 1) * 3}% enhanced training efficiency`,
        };
      }
      return f;
    });

    const updatedCareer: CareerSave = {
      ...career,
      purseBalanceCr: Number((career.purseBalanceCr - fac.upgradeCostCr).toFixed(2)),
      facilities: updatedFacilities,
      lastPlayedAt: Date.now(),
    };

    onUpdateCareer(updatedCareer);
    notify(`Upgraded ${fac.name} to Level ${fac.level + 1}!`);
  };

  // Recovery Treatment
  const handleApplyRecovery = (
    playerId: string,
    treatment: 'FULL_REST' | 'LIGHT_RECOVERY' | 'PHYSIOTHERAPY' | 'SURGERY'
  ) => {
    const currentWk = playerWorkloads[playerId];
    if (!currentWk) return;

    const costMap = {
      FULL_REST: 0,
      LIGHT_RECOVERY: 0.1,
      PHYSIOTHERAPY: 0.35,
      SURGERY: 1.5,
    };
    const cost = costMap[treatment];

    if (cost > 0 && career.purseBalanceCr < cost) {
      notify(`Insufficient funds for medical treatment (Requires ₹${cost} Cr).`);
      return;
    }

    const updatedWk = TrainingEngine.applyRecoveryTreatment(currentWk, treatment);
    const updatedCareer: CareerSave = {
      ...career,
      purseBalanceCr: Number(Math.max(0, career.purseBalanceCr - cost).toFixed(2)),
      playerWorkloads: {
        ...playerWorkloads,
        [playerId]: updatedWk,
      },
      lastPlayedAt: Date.now(),
    };

    onUpdateCareer(updatedCareer);
    notify(`Treatment applied: ${treatment.replace('_', ' ')}. Fatigue reduced.`);
  };

  // Optional Rewarded Ad: Team Conditioning & Form Boost (TRAINING_BOOST)
  const [adActionBusy, setAdActionBusy] = useState(false);

  const handleWatchAdTrainingBoost = async () => {
    if (adActionBusy) return;
    setAdActionBusy(true);
    const res = await LevelPlayService.showRewardedAd('TRAINING_BOOST');
    setAdActionBusy(false);

    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — conditioning boost not granted.');
      return;
    }

    const dedupeKey = `trn_boost_${career.id}_${res.rewardToken}`;
    if (DbPersistence.hasProcessedEvent(dedupeKey)) {
      notify('Reward token already processed.');
      return;
    }
    DbPersistence.markEventProcessed(dedupeKey);

    const updatedWkMap = { ...playerWorkloads };
    squadPlayers.forEach(p => {
      const cur = updatedWkMap[p.id];
      if (cur && !cur.isInjured) {
        updatedWkMap[p.id] = {
          ...cur,
          fitness: Math.min(100, cur.fitness + 4),
          fatigue: Math.max(0, cur.fatigue - 10),
        };
      }
    });

    onUpdateCareer({
      ...career,
      playerWorkloads: updatedWkMap,
      lastPlayedAt: Date.now(),
    });
    notify('Verified! Squad fitness +4% & fatigue -10% across healthy roster.');
  };

  // Optional Rewarded Ad: Free Cryo Fatigue Recovery (PLAYER_FATIGUE_RECOVERY)
  const handleWatchAdFatigueRecovery = async (playerId: string, playerName: string) => {
    const currentWk = playerWorkloads[playerId];
    if (!currentWk || adActionBusy) return;
    setAdActionBusy(true);
    const res = await LevelPlayService.showRewardedAd('PLAYER_FATIGUE_RECOVERY');
    setAdActionBusy(false);

    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — cryo recovery not granted.');
      return;
    }

    const dedupeKey = `trn_fat_${career.id}_${playerId}_${res.rewardToken}`;
    if (DbPersistence.hasProcessedEvent(dedupeKey)) return;
    DbPersistence.markEventProcessed(dedupeKey);

    const updatedWk: PlayerWorkloadState = {
      ...currentWk,
      fatigue: Math.max(0, currentWk.fatigue - 30),
      fitness: Math.min(100, currentWk.fitness + 8),
    };

    onUpdateCareer({
      ...career,
      playerWorkloads: { ...playerWorkloads, [playerId]: updatedWk },
      lastPlayedAt: Date.now(),
    });
    notify(`Free Cryo Recovery complete for ${playerName}!`);
  };

  // Optional Rewarded Ad: Fast Injury Rehab -4 Days (INJURY_RECOVERY_SPEEDUP)
  const handleWatchAdInjurySpeedup = async (playerId: string, playerName: string) => {
    const currentWk = playerWorkloads[playerId];
    if (!currentWk?.isInjured || adActionBusy) return;
    setAdActionBusy(true);
    const res = await LevelPlayService.showRewardedAd('INJURY_RECOVERY_SPEEDUP');
    setAdActionBusy(false);

    if (!res.completed || !res.rewardToken) {
      notify(res.reason || 'Ad not completed — rehab speedup not granted.');
      return;
    }

    const dedupeKey = `trn_inj_${career.id}_${playerId}_${res.rewardToken}`;
    if (DbPersistence.hasProcessedEvent(dedupeKey)) return;
    DbPersistence.markEventProcessed(dedupeKey);

    const remDays = Math.max(0, (currentWk.injuryDetails?.recoveryDaysRemaining || 4) - 4);
    const updatedWk: PlayerWorkloadState =
      remDays === 0
        ? {
            ...currentWk,
            isInjured: false,
            injuryDetails: undefined,
            fitness: Math.min(100, Math.max(82, currentWk.fitness + 12)),
            fatigue: 5,
          }
        : {
            ...currentWk,
            injuryDetails: {
              ...currentWk.injuryDetails!,
              recoveryDaysRemaining: remDays,
            },
          };

    onUpdateCareer({
      ...career,
      playerWorkloads: { ...playerWorkloads, [playerId]: updatedWk },
      lastPlayedAt: Date.now(),
    });
    notify(
      remDays === 0
        ? `${playerName} cleared fit after accelerated rehab!`
        : `${playerName} rehab accelerated (-4 days, ${remDays}d left).`
    );
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100 flex flex-col font-sans pb-16">
      {/* Toast Notification */}
      {recentNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-2xl text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" />
          <span>{recentNotification}</span>
        </div>
      )}

      {/* Top App Header */}
      <div className="sticky top-0 z-40 bg-[#0C1527]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-wide uppercase flex items-center space-x-2">
              <span>Training & Development</span>
            </h1>
            <p className="text-[11px] text-amber-400/90 font-medium">
              Week {Math.ceil(weeklySchedule.weekNumber / 7)} • Day {(weeklySchedule.weekNumber - 1) % 7 + 1} of 7
            </p>
          </div>
        </div>

        {/* Purse balance display */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl">
          <Coins className="w-4 h-4 text-amber-400" />
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Purse</span>
            <span className="text-xs font-black text-amber-400 font-mono">₹{career.purseBalanceCr.toFixed(2)} Cr</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#0F1A30] border-b border-slate-800 px-3 py-2 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: Dumbbell },
          { id: 'INDIVIDUAL', label: 'Individual', icon: Users },
          { id: 'SCHEDULE', label: 'Weekly Schedule', icon: Calendar },
          { id: 'COACHES', label: 'Staff Coaches', icon: Award },
          { id: 'FACILITIES', label: 'Club Facilities', icon: Building2 },
          { id: 'REPORTS', label: 'Development Log', icon: FileText },
          { id: 'RECOVERY', label: 'Recovery Centre', icon: HeartPulse },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="p-4 max-w-4xl mx-auto w-full space-y-4">
        {/* ======================= TAB 1: OVERVIEW ======================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Visual Academy Pavilion Banner (Exact Reference Screen 6 Replica) */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-[0_8px_30px_rgba(0,0,0,0.8)] bg-[#0A1224]">
              <img
                src="/src/assets/images/training_ground_pavilion_1794244160986.jpg"
                alt="Cricket High Performance Pavilion"
                className="w-full h-44 sm:h-52 object-cover object-center select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-[#0A1224]/30 to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full inline-block backdrop-blur-md">
                    High Performance Pavilion
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-white drop-shadow mt-1">
                    {career.name} Training Grounds
                  </h2>
                </div>
                <button
                  onClick={handleAdvanceScheduledDay}
                  className="btn-game-gold py-2 px-3.5 rounded-xl text-xs uppercase flex items-center space-x-1.5 shadow-xl cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4 fill-current text-slate-950" />
                  <span>Advance Day</span>
                </button>
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="card-game-3d p-2 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Avg Fitness</span>
                <span className="text-sm font-black text-emerald-400">{avgFitness}%</span>
              </div>
              <div className="card-game-3d p-2 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Fatigued</span>
                <span className={`text-sm font-black ${fatiguedCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {fatiguedCount}
                </span>
              </div>
              <div className="card-game-3d p-2 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Injuries</span>
                <span className={`text-sm font-black ${injuredCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {injuredCount}
                </span>
              </div>
              <div className="card-game-3d p-2 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Improvement</span>
                <span className="text-sm font-black text-emerald-400 flex items-center justify-center space-x-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>▲ +2</span>
                </span>
              </div>
            </div>

            {/* Training Units (Matching Reference Cards) */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                <span>Training Unit Allocations</span>
                <span className="text-[11px] text-slate-500 font-normal">Active squad: {totalSquadSize} players</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
                    🏏
                  </div>
                  <span className="text-xs font-bold text-white">Batting Unit</span>
                  <span className="text-[11px] text-amber-400 font-bold mt-0.5">{battingCount} Players</span>
                  <span className="text-[10px] text-slate-400 mt-1">Nets & Power Range</span>
                </div>

                <div className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-2">
                    ⚾
                  </div>
                  <span className="text-xs font-bold text-white">Bowling Unit</span>
                  <span className="text-[11px] text-amber-400 font-bold mt-0.5">{bowlingCount} Players</span>
                  <span className="text-[10px] text-slate-400 mt-1">Pace & Spin Labs</span>
                </div>

                <div className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                    🧤
                  </div>
                  <span className="text-xs font-bold text-white">Fielding Unit</span>
                  <span className="text-[11px] text-amber-400 font-bold mt-0.5">{totalSquadSize} Players</span>
                  <span className="text-[10px] text-slate-400 mt-1">Catching & Direct Hits</span>
                </div>

                <div className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                    💪
                  </div>
                  <span className="text-xs font-bold text-white">Fitness Unit</span>
                  <span className="text-[11px] text-amber-400 font-bold mt-0.5">{totalSquadSize} Players</span>
                  <span className="text-[10px] text-slate-400 mt-1">Conditioning & Mobility</span>
                </div>
              </div>
            </div>

            {/* Current Cycle Progress & Focus Area */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-slate-300">Current Training Cycle</span>
                  <p className="text-[11px] text-slate-400">Week 2 of 4 (Mid-Season Microcycle)</p>
                </div>
                <span className="text-sm font-bold text-amber-400 font-mono">50%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2.5 rounded-full w-1/2 transition-all duration-300" />
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400">Focus Area:</span>
                <span className="font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                  T20 Match Preparation & Death Execution
                </span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('INDIVIDUAL')}
                className="bg-[#0F1A30] hover:bg-[#142342] border border-slate-800 rounded-xl p-3 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Assign Individual Drills</span>
                  <span className="text-[10px] text-slate-400">Target specific player attributes</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => setActiveTab('RECOVERY')}
                className="bg-[#0F1A30] hover:bg-[#142342] border border-slate-800 rounded-xl p-3 text-left transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Recovery Centre</span>
                  <span className="text-[10px] text-emerald-400">
                    {injuredCount > 0 ? `${injuredCount} Injured` : 'All Players Available'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Optional Sponsored Squad Conditioning Boost (TRAINING_BOOST) */}
            <div className="p-3.5 rounded-2xl bg-[#101B33] border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-white block">Sponsored conditioning Camp (Optional)</span>
                <span className="text-[11px] text-slate-400">
                  Watch Ad for +4% fitness & -10% fatigue across healthy roster
                </span>
              </div>
              <button
                onClick={handleWatchAdTrainingBoost}
                disabled={adActionBusy}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-[11px] uppercase flex items-center space-x-1.5 shrink-0"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{adActionBusy ? 'Loading...' : 'Watch Ad Boost'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: INDIVIDUAL ======================= */}
        {activeTab === 'INDIVIDUAL' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase">Individual Player Training</h3>
                <p className="text-[11px] text-slate-400">Select a cricketer to assign role-compatible programmes</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {squadPlayers.length} Squad Players
              </span>
            </div>

            <div className="space-y-2">
              {squadPlayers.map(player => {
                const wk = playerWorkloads[player.id] || { fatigue: 10, fitness: 95, isInjured: false };
                return (
                  <div
                    key={player.id}
                    className="bg-[#0F1A30] border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs">
                        {player.overallRating}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{player.name}</span>
                          {player.isOverseas && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold">
                              ✈ OS
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {player.primaryRole} • Age {player.age} • Pot {player.potentialRating}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 block">Fit / Fat</span>
                        <span
                          className={`text-xs font-bold ${
                            wk.fatigue > 60 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {wk.fitness}% / {wk.fatigue}%
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedPlayerForTraining(player)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-all"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Train</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 3: SCHEDULE ======================= */}
        {activeTab === 'SCHEDULE' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase">7-Day Weekly Training Schedule</h3>
                <p className="text-[11px] text-slate-400">Microcycle planner from Monday through Sunday</p>
              </div>
              <button
                onClick={handleAdvanceScheduledDay}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase flex items-center space-x-1.5 shadow-lg"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Advance Day</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {Object.values(weeklySchedule.days).map(daySchedule => {
                const isRecovery = daySchedule.activityType === 'RECOVERY';
                const isTeamUnit = daySchedule.activityType === 'TEAM_UNIT';
                const assignedCount = daySchedule.individualAssignments?.length || 0;

                return (
                  <div
                    key={daySchedule.day}
                    className={`bg-[#0F1A30] border rounded-xl p-3.5 transition-all ${
                      isRecovery
                        ? 'border-emerald-500/30'
                        : isTeamUnit
                        ? 'border-blue-500/30'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-black text-white uppercase w-24">
                          {daySchedule.day}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isRecovery
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isTeamUnit
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {daySchedule.activityType.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {assignedCount > 0 ? `${assignedCount} Assigned Drills` : daySchedule.notes}
                      </span>
                    </div>

                    {isTeamUnit && daySchedule.teamSession && (
                      <div className="mt-2 text-xs text-blue-300 bg-blue-950/40 p-2 rounded-lg border border-blue-900/40 flex items-center justify-between">
                        <span>Squad Focus: {daySchedule.teamSession.unitName} ({daySchedule.teamSession.category})</span>
                        <span className="font-semibold text-[11px]">Intensity: {daySchedule.teamSession.intensity}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: COACHES ======================= */}
        {activeTab === 'COACHES' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase">Coaching Staff & Specialists</h3>
                <p className="text-[11px] text-slate-400">High-tier coaches boost skill absorption rates</p>
              </div>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {coaches.length} Staff Members
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coaches.map(c => (
                <div
                  key={c.id}
                  className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        Tier {c.qualityRating >= 92 ? '5' : '4'}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-medium block mt-0.5">{c.role}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{c.specialisation}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Rating: {c.qualityRating}</span>
                    <span className="text-emerald-400 font-bold">+{c.developmentBonusPercent}% Dev Bonus</span>
                    <span className="text-slate-400 font-mono">₹{c.salaryPerSeasonCr} Cr/yr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 5: FACILITIES ======================= */}
        {activeTab === 'FACILITIES' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase">Club Infrastructure & HQ</h3>
                <p className="text-[11px] text-slate-400">Upgrade training facilities to accelerate squad growth</p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                <Coins className="w-4 h-4" />
                <span>₹{career.purseBalanceCr.toFixed(2)} Cr Available</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facilities.map(fac => {
                const canAfford = career.purseBalanceCr >= fac.upgradeCostCr;
                const isMax = fac.level >= 5;

                return (
                  <div
                    key={fac.id}
                    className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{fac.name}</span>
                        <span className="text-xs font-black text-amber-400 font-mono">
                          Level {fac.level}/5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">{fac.description}</p>
                      <div className="mt-2 text-[10px] text-emerald-400 font-medium bg-emerald-950/30 border border-emerald-900/30 p-1.5 rounded-lg">
                        {fac.currentBonusText}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {isMax ? 'MAX LEVEL' : `Upgrade: ₹${fac.upgradeCostCr} Cr`}
                      </span>
                      {!isMax && (
                        <button
                          onClick={() => handleUpgradeFacility(fac.id)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Upgrade Facility
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 6: REPORTS ======================= */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase">Player Development Reports</h3>
                <p className="text-[11px] text-slate-400">Chronological history of attribute growth and milestones</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {developmentReports.length} Reports Logged
              </span>
            </div>

            {developmentReports.length === 0 ? (
              <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">No training sessions completed yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Assign drills or advance scheduled days to record skill progression.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {developmentReports.map(report => (
                  <div
                    key={report.id}
                    className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{report.playerName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          report.status === 'IMPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : report.status === 'FATIGUED'
                            ? 'bg-amber-500/20 text-amber-300'
                            : report.status === 'INJURED'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Programme: <span className="text-slate-200">{report.programmeName}</span> • {report.notes}
                    </p>
                    {Object.keys(report.attributeChanges).length > 0 && (
                      <div className="flex items-center space-x-2 pt-1 font-mono text-[10px] text-emerald-400">
                        {Object.entries(report.attributeChanges).map(([attr, val]) => (
                          <span key={attr} className="bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                            +{val} {attr.split('.')[1]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 7: RECOVERY ======================= */}
        {activeTab === 'RECOVERY' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase">Medical & Recovery Centre</h3>
                <p className="text-[11px] text-slate-400">Manage fatigue dissipation and treat player injuries</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {injuredCount > 0 ? `${injuredCount} In Rehab` : 'Squad 100% Fit'}
              </span>
            </div>

            <div className="space-y-3">
              {squadPlayers.map(player => {
                const wk = playerWorkloads[player.id];
                if (!wk) return null;

                return (
                  <div
                    key={player.id}
                    className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{player.name}</span>
                        <p className="text-[10px] text-slate-400">{player.primaryRole}</p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold ${
                            wk.isInjured ? 'text-red-400' : wk.fatigue > 60 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {wk.isInjured ? wk.injuryDetails?.type : `Fatigue: ${wk.fatigue}%`}
                        </span>
                        {wk.isInjured && wk.injuryDetails && (
                          <span className="text-[10px] text-slate-400 block">
                            {wk.injuryDetails.recoveryDaysRemaining} Days Out
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Treatment buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => handleApplyRecovery(player.id, 'FULL_REST')}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition-all text-center"
                      >
                        Full Rest (Free)
                      </button>
                      <button
                        onClick={() => handleApplyRecovery(player.id, 'LIGHT_RECOVERY')}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition-all text-center"
                      >
                        Ice Bath / Spa (₹0.1 Cr)
                      </button>
                      <button
                        onClick={() => handleApplyRecovery(player.id, 'PHYSIOTHERAPY')}
                        className="py-1.5 px-2 bg-blue-900/40 hover:bg-blue-800/40 text-blue-200 border border-blue-700/40 rounded-lg text-[10px] font-bold transition-all text-center"
                      >
                        Physio (-3 Days, ₹0.35 Cr)
                      </button>
                      <button
                        onClick={() => handleApplyRecovery(player.id, 'SURGERY')}
                        disabled={!wk.isInjured}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center ${
                          wk.isInjured
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40'
                            : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        Surgery (Heal Now, ₹1.5 Cr)
                      </button>
                      <button
                        onClick={() => handleWatchAdFatigueRecovery(player.id, player.name)}
                        disabled={adActionBusy}
                        className="py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center space-x-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Ad Cryo (Free)</span>
                      </button>
                      <button
                        onClick={() => handleWatchAdInjurySpeedup(player.id, player.name)}
                        disabled={!wk.isInjured || adActionBusy}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
                          wk.isInjured
                            ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <Video className="w-3 h-3" />
                        <span>Ad Rehab (-4d)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Individual Drill Modal */}
      {selectedPlayerForTraining && (
        <IndividualTrainingModal
          player={selectedPlayerForTraining}
          workload={playerWorkloads[selectedPlayerForTraining.id]}
          facilities={facilities}
          coaches={coaches}
          onAssign={handleAssignToSchedule}
          onExecuteNow={handleExecuteDrillNow}
          onClose={() => setSelectedPlayerForTraining(null)}
        />
      )}
    </div>
  );
};
