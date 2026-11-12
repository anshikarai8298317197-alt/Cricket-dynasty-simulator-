/**
 * WICKET DYNASTY - Career Overview & Home Dashboard (SCR_06)
 * Redesigned to match the authoritative mobile UI reference:
 * - Top Franchise Header with Crest, Season, Notifications (1) and Calendar
 * - Horizontal Calendar Strip with dynamic day selection & match day dots
 * - Daily Activity Card: Empty Squad Warning, Training Day (Tip, Stamina, Focus, Intensity), or Match Day
 * - Fixed Full-Width ADVANCE DAY Action Button
 * - 5-Tab Bottom Navigation Bar (Hub, Team, League, World, Profile) with integrated views
 */
import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Users,
  Calendar as CalendarIcon,
  Dumbbell,
  PlayCircle,
  ArrowRight,
  MapPin,
  Building2,
  Globe,
  User,
  Bell,
  Menu,
  Shield,
  Award,
  Zap,
  Info,
  ChevronRight,
  Hammer,
  AlertTriangle,
  Flame,
  Check,
  X,
  TrendingUp,
  Lock,
  Medal,
  Sparkles,
} from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { FranchiseLogo } from './FranchiseLogo';
import { PlayerProfileModal } from './PlayerProfileModal';
import { Player } from '../types/player';
import { TournamentEngine } from '../services/tournamentEngine';
import { SquadValidationEngine } from '../services/squadValidationEngine';
import { InjuryEngine } from '../services/injuryEngine';
import { evaluateCareerAchievements } from '../services/careerAchievements';

interface CareerOverviewScreenProps {
  career: CareerSave;
  onUpdateCareer?: (updated: CareerSave) => void;
  onPlayNextMatch: () => void;
  onOpenPlayerDB: () => void;
  onOpenAudit: () => void;
  onOpenTraining: () => void;
  onOpenTactics: () => void;
  onOpenMatchPrep: () => void;
  onOpenTournament: () => void;
  onOpenClubHQ: () => void;
  onOpenSquad: () => void;
  onOpenPlayingXI: () => void;
  onOpenAuctionHub: () => void;
  onBackToDashboard: () => void;
}

type TabType = 'HUB' | 'TEAM' | 'LEAGUE' | 'WORLD' | 'PROFILE';

export const CareerOverviewScreen: React.FC<CareerOverviewScreenProps> = ({
  career,
  onUpdateCareer,
  onPlayNextMatch,
  onOpenPlayerDB,
  onOpenAudit,
  onOpenTraining,
  onOpenTactics,
  onOpenMatchPrep,
  onOpenTournament,
  onOpenClubHQ,
  onOpenSquad,
  onOpenPlayingXI,
  onOpenAuctionHub,
  onBackToDashboard,
}) => {
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<TabType>('HUB');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [inspectingFranchiseId, setInspectingFranchiseId] = useState<string | null>(null);

  // Modals & Drawers
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [showTrainingTip, setShowTrainingTip] = useState(true);

  // Team tab filtering & sheet
  const [teamRoleFilter, setTeamRoleFilter] = useState<'ALL' | 'BAT' | 'BWL' | 'AR' | 'WK'>('ALL');
  const [teamSubView, setTeamSubView] = useState<'LINEUP' | 'SQUAD'>('LINEUP');

  // Franchise & Squad Data
  const franchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];
  const squadIds = career.squadPlayerIds || [];
  const isEmptySquad = squadIds.length === 0;

  // Authoritative squad players
  const squadPlayers: Player[] = useMemo(() => {
    if (squadIds.length === 0) return [];
    return squadIds
      .map(id => {
        const base = PLAYERS_DATABASE.find(p => p.id === id);
        if (!base) return null;
        const override = career.careerPlayerOverrides?.[id];
        return override ? { ...base, ...override } : base;
      })
      .filter(Boolean) as Player[];
  }, [squadIds, career.careerPlayerOverrides]);

  // Playing XI players
  const playingXiPlayers: Player[] = useMemo(() => {
    const xiIds = career.playingXiIds || [];
    return xiIds
      .map(id => squadPlayers.find(p => p.id === id))
      .filter(Boolean) as Player[];
  }, [career.playingXiIds, squadPlayers]);

  // Career Achievements evaluation
  const achievements = useMemo(() => {
    return evaluateCareerAchievements(career, squadPlayers);
  }, [career, squadPlayers]);

  const unlockedAchievementsCount = useMemo(() => {
    return achievements.filter(a => a.isUnlocked).length;
  }, [achievements]);

  // Next upcoming fixture for user's franchise
  const upcomingFixture = career.tournament?.fixtures?.find(
    (f: any) => !f.isCompleted && (f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId)
  );

  const opponentId = upcomingFixture
    ? upcomingFixture.homeFranchiseId === career.franchiseId
      ? upcomingFixture.awayFranchiseId
      : upcomingFixture.homeFranchiseId
    : FRANCHISES.find(f => f.id !== career.franchiseId)?.id || 'MI';

  const opponentFranchise = FRANCHISES.find(f => f.id === opponentId) || FRANCHISES[1];
  const isHomeMatch = upcomingFixture ? upcomingFixture.homeFranchiseId === career.franchiseId : true;

  // Calendar dates setup (Default start: March 30, 2026)
  const baseCareerDateMs = career.currentCareerDate || new Date('2026-03-30T10:00:00Z').getTime();
  const [selectedDateMs, setSelectedDateMs] = useState<number>(baseCareerDateMs);

  // Generate 7-day strip centered/anchored around baseCareerDateMs
  const calendarDays = useMemo(() => {
    const days = [];
    const oneDayMs = 24 * 60 * 60 * 1000;
    // Show 3 days prior, current day, and 3 days ahead
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseCareerDateMs + i * oneDayMs);
      const isCurrentDay = i === 0;
      const isSelected = selectedDateMs === d.getTime();

      // Check if this day has a match for user's franchise
      // In default calendar: Day +2 (e.g. Apr 1) is match day vs opponent
      const isMatchDay = i === 2 || (upcomingFixture && i === 0);

      days.push({
        dateObj: d,
        timestamp: d.getTime(),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayOfMonth: d.getDate(),
        monthStr: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        isCurrentDay,
        isSelected,
        isMatchDay,
      });
    }
    return days;
  }, [baseCareerDateMs, selectedDateMs, upcomingFixture]);

  // Formatted Current Month & Year
  const currentMonthYearStr = useMemo(() => {
    const d = new Date(baseCareerDateMs);
    return `${d.toLocaleDateString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  }, [baseCareerDateMs]);

  // Active Daily Focus & Intensity
  const activeFocus = career.activeDailyFocus || 'Mental';
  const activeIntensity = career.activeDailyIntensity || 'Medium';

  // Compute average squad stamina
  const avgStamina = useMemo(() => {
    if (squadPlayers.length === 0) return 100;
    const workloads = career.playerWorkloads || {};
    let total = 0;
    squadPlayers.forEach(p => {
      const w = workloads[p.id];
      total += w ? w.stamina : (p.fitness || p.fitnessAttributes?.stamina || 80);
    });
    return Math.round(total / squadPlayers.length);
  }, [squadPlayers, career.playerWorkloads]);

  // Notification count
  const unreadCount = career.unreadNotificationsCount ?? 1;

  // Handle Changing Focus
  const handleSelectFocus = (focus: 'Batting' | 'Bowling' | 'Fielding' | 'Fitness' | 'Mental') => {
    if (!onUpdateCareer) return;
    onUpdateCareer({
      ...career,
      activeDailyFocus: focus,
    });
  };

  // Handle Changing Intensity
  const handleSelectIntensity = (intensity: 'Light' | 'Medium' | 'Hard' | 'REST') => {
    if (!onUpdateCareer) return;
    onUpdateCareer({
      ...career,
      activeDailyIntensity: intensity,
    });
  };

  // ADVANCE DAY Action
  const handleAdvanceDay = () => {
    if (isEmptySquad) {
      onOpenAuctionHub();
      return;
    }

    const nextDateMs = baseCareerDateMs + 24 * 60 * 60 * 1000;
    const medLevel = career.clubProfile?.stadiumFacilities?.find((f: any) => f.id === 'fac_medical')?.level || 3;

    // Update player stamina & workloads based on chosen intensity and injury rolls
    const updatedWorkloads = { ...(career.playerWorkloads || {}) };
    const newNotifications = [...(career.notifications || [])];

    squadPlayers.forEach(p => {
      const current = updatedWorkloads[p.id] || {
        playerId: p.id,
        stamina: p.fitness || p.fitnessAttributes?.stamina || 80,
        fatigue: 15,
        injuryRisk: 'LOW',
        isInjured: false,
        daysInjuredRemaining: 0,
        formScore: 85,
        moraleScore: 8,
      };

      if (current.isInjured) {
        // Advance recovery in infirmary
        const advanced = InjuryEngine.advanceDayRecovery(current as any, medLevel);
        updatedWorkloads[p.id] = {
          ...current,
          ...advanced,
        };
        if (!advanced.isInjured) {
          newNotifications.unshift({
            id: `notif_rec_${p.id}_${Date.now()}`,
            title: 'Player Cleared by Medical Team',
            message: `${p.name} has completed rehabilitation and is fit to play.`,
            date: 'Today',
            read: false,
            type: 'INFO',
          });
        }
      } else {
        // Healthy player training session
        let newStamina = current.stamina;
        let newFatigue = current.fatigue || 20;

        if (activeIntensity === 'REST') {
          newStamina = Math.min(100, current.stamina + 15);
          newFatigue = Math.max(0, newFatigue - 20);
        } else if (activeIntensity === 'Light') {
          newStamina = Math.min(100, current.stamina + 5);
          newFatigue = Math.max(0, newFatigue - 8);
        } else if (activeIntensity === 'Medium') {
          newStamina = Math.max(45, current.stamina - 6);
          newFatigue = Math.min(100, newFatigue + 10);
        } else if (activeIntensity === 'Hard') {
          newStamina = Math.max(30, current.stamina - 14);
          newFatigue = Math.min(100, newFatigue + 22);
        }

        // Influenceable Injury Roll: High intensity or low stamina increases probability
        const injuryRoll = InjuryEngine.rollTrainingInjury(p, activeIntensity, newStamina, medLevel);

        if (injuryRoll.isInjured && injuryRoll.injury) {
          updatedWorkloads[p.id] = {
            ...current,
            isInjured: true,
            injuryType: injuryRoll.injury.type,
            injurySeverity: injuryRoll.injury.severity,
            daysInjuredRemaining: injuryRoll.daysRemaining || 4,
            initialDaysInjured: injuryRoll.daysRemaining || 4,
            stamina: Math.max(25, newStamina - 20),
            fatigue: Math.min(100, newFatigue + 15),
            injuryRisk: 'CRITICAL',
          };

          newNotifications.unshift({
            id: `notif_inj_${p.id}_${Date.now()}`,
            title: 'Training Injury Sustained',
            message: `${p.name} suffered a ${injuryRoll.injury.type} during ${activeIntensity} training. Out for ${injuryRoll.daysRemaining} days.`,
            date: 'Today',
            read: false,
            type: 'INJURY',
          });
        } else {
          updatedWorkloads[p.id] = {
            ...current,
            stamina: newStamina,
            fatigue: newFatigue,
            injuryRisk: InjuryEngine.calculateInjuryRisk(newStamina, newFatigue),
          };
        }
      }
    });

    // Check if the new day has intervening matches and simulate them
    let updatedTourn = career.tournament;
    if (updatedTourn && upcomingFixture) {
      updatedTourn = TournamentEngine.simulateInterveningFixtures(
        updatedTourn,
        Math.max(1, upcomingFixture.matchNumber - 1),
        PLAYERS_DATABASE,
        career.allFranchiseSquads
      );
    }

    const updatedCareer: CareerSave = {
      ...career,
      currentCareerDate: nextDateMs,
      playerWorkloads: updatedWorkloads,
      tournament: updatedTourn,
      notifications: newNotifications.slice(0, 30),
      unreadNotificationsCount: (career.unreadNotificationsCount || 0) + (newNotifications.length - (career.notifications?.length || 0)),
      lastPlayedAt: Date.now(),
    };

    if (onUpdateCareer) {
      onUpdateCareer(updatedCareer);
    }
    setSelectedDateMs(nextDateMs);
  };

  // Determine if selected day is a match day for the user
  const isSelectedDateMatchDay = useMemo(() => {
    // If selected date is exactly 2 days after base (or is the upcoming fixture day)
    const diffDays = Math.round((selectedDateMs - baseCareerDateMs) / (24 * 60 * 60 * 1000));
    return diffDays === 2 || diffDays === 0;
  }, [selectedDateMs, baseCareerDateMs]);

  const daysUntilMatch = Math.max(0, Math.round((selectedDateMs - baseCareerDateMs) / (24 * 60 * 60 * 1000)) + 2);

  // Inspected Franchise for Roster Modal
  const inspectedFranchise = FRANCHISES.find(f => f.id === inspectingFranchiseId);
  const inspectedFranchisePlayers = useMemo(() => {
    if (!inspectedFranchise) return [];
    const rosterIds = career.allFranchiseSquads?.[inspectedFranchise.id];
    if (rosterIds && rosterIds.length > 0) {
      return rosterIds.map(id => PLAYERS_DATABASE.find(p => p.id === id)).filter(Boolean) as Player[];
    }
    return PLAYERS_DATABASE.filter(p => p.originalFranchiseId === inspectedFranchise.id);
  }, [inspectedFranchise, career.allFranchiseSquads]);

  return (
    <div className="flex-1 flex flex-col bg-[#080E1A] text-white select-none overflow-hidden h-full">
      {/* 1. TOP FRANCHISE HEADER (Matches Screenshot) */}
      <header className="px-4 py-3 bg-[#0B1324] border-b border-[#1A2642] flex items-center justify-between shrink-0 z-20">
        {/* Left: Franchise Crest + Title */}
        <div className="flex items-center space-x-3">
          <FranchiseLogo franchiseId={franchise.id} size={36} className="rounded-xl shadow-md border border-amber-500/20" />
          <div className="leading-tight">
            <h1 className="text-base font-black text-white tracking-wide">
              {franchise.name}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {currentMonthYearStr} · Premier T20 (India)
            </p>
          </div>
        </div>

        {/* Right: Notification, Calendar & Menu Icons */}
        <div className="flex items-center space-x-2">
          {/* Notification Envelope with Unread Badge */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl bg-[#121E36] border border-[#1E2E50] text-slate-300 hover:text-white hover:border-amber-500/40 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-black text-white flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Full Calendar Schedule Modal Button */}
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="p-2 rounded-xl bg-[#121E36] border border-[#1E2E50] text-slate-300 hover:text-white hover:border-amber-500/40 transition-colors"
            title="Tournament Calendar"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>

          {/* Quick Menu Drawer */}
          <button
            onClick={() => setIsMenuDrawerOpen(true)}
            className="p-2 rounded-xl bg-[#121E36] border border-[#1E2E50] text-slate-300 hover:text-white hover:border-amber-500/40 transition-colors"
            title="Options Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. HORIZONTAL CALENDAR STRIP (Matches Screenshot) */}
      <div className="px-3 py-2 bg-[#091120] border-b border-[#16243E] overflow-x-auto scrollbar-none flex items-center justify-between gap-1.5 shrink-0">
        {calendarDays.map(day => (
          <button
            key={day.timestamp}
            onClick={() => setSelectedDateMs(day.timestamp)}
            className={`flex-1 min-w-[44px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              day.isSelected
                ? 'bg-[#FBBF24] text-slate-950 font-black shadow-lg scale-105'
                : 'bg-[#101C33]/70 hover:bg-[#162747] text-slate-300 border border-slate-800'
            }`}
          >
            <span className={`text-[9px] uppercase font-bold tracking-wider ${day.isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
              {day.dayOfWeek}
            </span>
            <span className={`text-sm font-black ${day.isSelected ? 'text-slate-950' : 'text-white'}`}>
              {day.dayOfMonth}
            </span>

            {/* Red Match Day Dot (Underneath match dates like APR 1) */}
            <div className="h-1.5 mt-0.5 flex items-center justify-center">
              {day.isMatchDay ? (
                <span className={`w-1.5 h-1.5 rounded-full ${day.isSelected ? 'bg-red-700' : 'bg-red-500'} shadow-sm`} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* 3. MAIN TAB CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB: HUB (Main Home View matching screenshot) ================= */}
        {activeTab === 'HUB' && (
          <div className="space-y-4 max-w-lg mx-auto">
            {/* EMPTY SQUAD ALERT CARD (Guarantees zero random players can enter) */}
            {isEmptySquad ? (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-red-950/60 via-[#1C1628] to-[#121E36] border-2 border-red-500/70 shadow-2xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white tracking-wide">YOUR SQUAD IS EMPTY</h3>
                    <p className="text-xs text-red-300 font-medium">Mega Auction Incomplete • 0/25 Players</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  You have not purchased any players for {franchise.name}. WICKET DYNASTY enforces authentic tournament progression and will never substitute random or hardcoded players.
                </p>

                <button
                  onClick={onOpenAuctionHub}
                  className="w-full py-3.5 px-4 rounded-2xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-2 active:scale-[0.98] transition-all cursor-pointer shadow-xl"
                >
                  <Hammer className="w-4 h-4 fill-current text-slate-950" />
                  <span>ENTER MEGA AUCTION ROOM</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            ) : isSelectedDateMatchDay ? (
              /* MATCH DAY STATE CARD */
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] border-2 border-amber-500/70 shadow-2xl relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow">
                      MATCH DAY
                    </span>
                    <span className="text-xs font-bold text-amber-300">
                      Match {upcomingFixture?.matchNumber || 1} • T20
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">19:30 IST</span>
                </div>

                {/* Matchup Crests */}
                <div className="bg-[#0C1527] border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FranchiseLogo franchiseId={franchise.id} size={48} />
                    <div>
                      <h4 className="text-sm font-black text-white">{franchise.shortName}</h4>
                      <span className="text-[11px] text-amber-400 font-bold">(You)</span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    VS
                  </span>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <h4 className="text-sm font-black text-white">{opponentFranchise.shortName}</h4>
                      <span className="text-[11px] text-slate-400">{opponentFranchise.homeCity}</span>
                    </div>
                    <FranchiseLogo franchiseId={opponentFranchise.id} size={48} />
                  </div>
                </div>

                {/* Venue & Pitch Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
                  <span>Venue: <strong className="text-slate-200">{upcomingFixture?.venue || franchise.homeStadium}</strong></span>
                  <span className="text-amber-300">{career.matchPreparationPlan?.pitchCondition || 'Balanced Surface'}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={onPlayNextMatch}
                    className="w-full py-3.5 px-4 rounded-2xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer shadow-lg"
                  >
                    <PlayCircle className="w-4 h-4 fill-current text-slate-950" />
                    <span>START MATCH (LIVE 2D)</span>
                  </button>

                  <button
                    onClick={onOpenMatchPrep}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#121E36] hover:bg-[#1A2A4C] border border-[#1E2D4A] text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Match Briefing & Toss Strategy</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            ) : (
              /* TRAINING DAY STATE CARD (Exact match to Screenshot) */
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#311622] via-[#211225] to-[#120F1D] border border-amber-900/40 shadow-2xl relative overflow-hidden space-y-4">
                {/* Header Title Row */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#4A261E] border border-amber-700/50 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Dumbbell className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                      TRAINING DAY
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight">
                      Prepare for {opponentFranchise.homeCity}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {isHomeMatch ? 'Home' : 'Away'} match in {daysUntilMatch} {daysUntilMatch === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>

                {/* Training & Rest Tip Card */}
                {showTrainingTip && (
                  <div className="p-4 rounded-2xl bg-[#141C2E]/90 border border-slate-700/60 relative space-y-2.5 shadow-md">
                    <div className="flex items-center space-x-2 text-amber-300">
                      <span className="text-sm">💡</span>
                      <h4 className="text-xs font-bold text-amber-300 tracking-wide">Training & rest</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      Pick a focus and intensity to develop players, or REST to recover stamina. Harder sessions improve players faster, but tire them and can cause injuries.
                    </p>
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => setShowTrainingTip(false)}
                        className="py-1 px-4 rounded-full bg-[#FBBF24] hover:bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all shadow"
                      >
                        GOT IT
                      </button>
                    </div>
                  </div>
                )}

                {/* Stamina Meter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="uppercase text-[11px] tracking-wider">STAMINA</span>
                    </span>
                    <span className="text-amber-400">{avgStamina}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${avgStamina}%` }}
                    />
                  </div>
                </div>

                {/* Focus Selector Pills */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    FOCUS
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['Batting', 'Bowling', 'Fielding', 'Fitness', 'Mental'] as const).map(focus => (
                      <button
                        key={focus}
                        onClick={() => handleSelectFocus(focus)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeFocus === focus
                            ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-md scale-105'
                            : 'bg-[#121E36] text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {focus}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Selector Pills */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    INTENSITY
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(['Light', 'Medium', 'Hard', 'REST'] as const).map(intensity => (
                      <button
                        key={intensity}
                        onClick={() => handleSelectIntensity(intensity)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                          activeIntensity === intensity
                            ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-md scale-105'
                            : 'bg-[#121E36] text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {intensity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Access Grid to Deep Modules */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Squad & 2D Lineup */}
              <button
                onClick={onOpenSquad}
                className="p-3.5 rounded-2xl bg-[#121E36] border border-[#1E2E50] hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#091120] text-amber-400 font-mono">
                    {squadPlayers.length}/25
                  </span>
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">Squad & Playing XI</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Captain, WK & lineup</p>
              </button>

              {/* Club Headquarters */}
              <button
                onClick={onOpenClubHQ}
                className="p-3.5 rounded-2xl bg-[#121E36] border border-[#1E2E50] hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#091120] text-emerald-400 font-mono">
                    Lv. {career.clubProfile?.facilities?.stadium?.tier || 1}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">Club Headquarters</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Stadium, Academy & HQ</p>
              </button>

              {/* Career Achievements Quick Access Button */}
              <button
                onClick={() => setActiveTab('PROFILE')}
                className="col-span-2 p-3 rounded-2xl bg-gradient-to-r from-[#121E36] via-[#162747] to-[#121E36] border border-amber-500/30 hover:border-amber-400/60 flex items-center justify-between transition-all group cursor-pointer shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                        Career Achievements
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {unlockedAchievementsCount}/{achievements.length} Unlocked
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Milestone badges: 10 Wins, Trophy & Squad Rating</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB: TEAM (Matches Screenshot_2026-11-10-21-55-14) ================= */}
        {activeTab === 'TEAM' && (
          <div className="space-y-4 max-w-lg mx-auto">
            {/* Header with Sub-tab toggle & Team Sheet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 bg-[#101C33] p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTeamSubView('LINEUP')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    teamSubView === 'LINEUP'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Playing XI ({playingXiPlayers.length})
                </button>
                <button
                  onClick={() => setTeamSubView('SQUAD')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    teamSubView === 'SQUAD'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full Squad ({squadPlayers.length})
                </button>
              </div>

              <button
                onClick={onOpenPlayingXI}
                className="py-1.5 px-3 rounded-xl bg-[#121E36] border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center space-x-1"
              >
                <span>Edit Pitch XI</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

            {/* Filter Pills (ALL, BAT, BWL, AR, WK) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['ALL', 'BAT', 'BWL', 'AR', 'WK'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setTeamRoleFilter(role)}
                  className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                    teamRoleFilter === role
                      ? 'bg-[#FBBF24] text-slate-950 font-black shadow'
                      : 'bg-[#101C33] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Player Cards List (Matches Reference UI) */}
            <div className="space-y-2">
              {(teamSubView === 'LINEUP' ? playingXiPlayers : squadPlayers)
                .filter(p => {
                  if (teamRoleFilter === 'ALL') return true;
                  if (teamRoleFilter === 'BAT') return p.primaryRole.includes('Batter');
                  if (teamRoleFilter === 'BWL') return p.primaryRole.includes('Bowler');
                  if (teamRoleFilter === 'AR') return p.primaryRole.includes('All-rounder');
                  if (teamRoleFilter === 'WK') return p.isWicketkeeper;
                  return true;
                })
                .map((player, idx) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className="p-3 rounded-2xl bg-[#121E36] border border-[#1E2E50] hover:border-amber-500/60 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-500 font-mono w-4">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-white">{player.name}</h4>
                          <span className="text-[10px] font-bold text-blue-400">{player.nationality}</span>
                          {player.id === career.captainId && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">C</span>
                          )}
                          {player.isWicketkeeper && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-600 text-white">WK</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {player.primaryRole} · {player.age} yrs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-400 block">100% Fit</span>
                        <span className="text-[10px] text-slate-400 font-mono">₹{player.contract.salaryExpectationCr.toFixed(1)} Cr</span>
                      </div>
                      <span className="w-8 h-8 rounded-xl bg-[#091120] border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center font-mono">
                        {player.overallRating}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= TAB: LEAGUE (Matches Screenshot_2026-11-10-21-55-00) ================= */}
        {activeTab === 'LEAGUE' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">T20 Points Table</h3>
                <p className="text-[11px] text-slate-400">Top 4 qualify for playoffs</p>
              </div>
              <button
                onClick={onOpenTournament}
                className="py-1 px-3 rounded-lg bg-[#121E36] border border-slate-700 text-xs font-bold text-amber-300"
              >
                Full Fixtures &gt;
              </button>
            </div>

            {/* Standings Table */}
            <div className="rounded-2xl bg-[#121E36] border border-[#1E2E50] overflow-hidden">
              <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-[#0C1527] border-b border-[#1E2E50] text-[10px] font-bold text-slate-400 uppercase">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-5">Team</span>
                <span className="col-span-1 text-center">P</span>
                <span className="col-span-1 text-center">W</span>
                <span className="col-span-1 text-center">L</span>
                <span className="col-span-2 text-center">Pts</span>
                <span className="col-span-2 text-right">NRR</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {(career.tournament?.standings || []).map((row: any, idx: number) => {
                  const teamFranchise = FRANCHISES.find(f => f.id === row.franchiseId) || FRANCHISES[0];
                  const isUserTeam = row.franchiseId === career.franchiseId;
                  const isTop4 = idx < 4;

                  return (
                    <div
                      key={row.franchiseId}
                      onClick={() => setInspectingFranchiseId(row.franchiseId)}
                      className={`grid grid-cols-12 gap-1 px-3 py-2.5 items-center cursor-pointer transition-colors ${
                        isUserTeam
                          ? 'bg-amber-500/10 border-l-4 border-amber-400'
                          : isTop4
                          ? 'bg-[#121E36] hover:bg-[#1A2A4C]'
                          : 'bg-[#0E172B] hover:bg-[#16233B]'
                      }`}
                    >
                      <span className={`col-span-1 text-xs font-black text-center ${isTop4 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <div className="col-span-5 flex items-center space-x-2">
                        <FranchiseLogo franchiseId={teamFranchise.id} size={22} />
                        <span className={`text-xs font-bold truncate ${isUserTeam ? 'text-amber-300 font-black' : 'text-white'}`}>
                          {teamFranchise.shortName}
                        </span>
                      </div>
                      <span className="col-span-1 text-xs text-center text-slate-300 font-mono">{row.played}</span>
                      <span className="col-span-1 text-xs text-center text-emerald-400 font-mono font-bold">{row.won}</span>
                      <span className="col-span-1 text-xs text-center text-red-400 font-mono">{row.lost}</span>
                      <span className="col-span-2 text-xs text-center text-white font-mono font-black">{row.points}</span>
                      <span className="col-span-2 text-xs text-right text-slate-300 font-mono">
                        {row.nrr >= 0 ? `+${row.nrr.toFixed(2)}` : row.nrr.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: WORLD (Player DB & Transfers) ================= */}
        {activeTab === 'WORLD' && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-[#121E36] border border-[#1E2E50] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Global Player Database</h3>
                <p className="text-xs text-slate-400">Search all 320 real & uncapped stars</p>
              </div>
              <button
                onClick={onOpenPlayerDB}
                className="py-2 px-3 rounded-xl btn-game-gold text-xs uppercase font-black"
              >
                Open Database
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#121E36] border border-[#1E2E50] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Mega Auction Hub</h3>
                <p className="text-xs text-slate-400">Review transactions & franchise purse</p>
              </div>
              <button
                onClick={onOpenAuctionHub}
                className="py-2 px-3 rounded-xl bg-[#091120] border border-amber-500/40 text-amber-400 text-xs font-bold"
              >
                Auction Room
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB: PROFILE (Matches Screenshot_2026-11-10-21-54-58) ================= */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-4 max-w-lg mx-auto">
            {/* Coach Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121E36] to-[#0A1120] border border-slate-700/60 flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-[#080E1A] border border-amber-500/30 flex items-center justify-center text-amber-400">
                <User className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">HEAD COACH</span>
                <h3 className="text-base font-black text-white">{career.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{franchise.name} • Season {career.currentSeason}</p>
              </div>
            </div>

            {/* Lifetime Stats 2x4 Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#121E36] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Matches Played</span>
                <h4 className="text-lg font-black text-white font-mono mt-0.5">{career.statsSummary?.matchesPlayed || 0}</h4>
              </div>
              <div className="p-3 rounded-xl bg-[#121E36] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Matches Won</span>
                <h4 className="text-lg font-black text-emerald-400 font-mono mt-0.5">{career.statsSummary?.matchesWon || 0}</h4>
              </div>
              <div className="p-3 rounded-xl bg-[#121E36] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Matches Lost</span>
                <h4 className="text-lg font-black text-red-400 font-mono mt-0.5">{career.statsSummary?.matchesLost || 0}</h4>
              </div>
              <div className="p-3 rounded-xl bg-[#121E36] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Trophies</span>
                <h4 className="text-lg font-black text-amber-400 font-mono mt-0.5">{career.statsSummary?.trophies || 0}</h4>
              </div>
            </div>

            {/* Career Achievements & Badges System */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Career Achievements</h3>
                    <p className="text-[10px] text-slate-400">Unlock visual badges & milestones</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {unlockedAchievementsCount} / {achievements.length} Unlocked
                </span>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map((ach) => {
                  const percent = Math.min(100, Math.round((ach.currentValue / ach.targetValue) * 100));

                  return (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                        ach.isUnlocked
                          ? 'bg-[#121E36] border-amber-500/40 shadow-lg shadow-amber-950/20'
                          : 'bg-[#0B1324]/80 border-slate-800/80 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border shadow-sm ${
                              ach.isUnlocked
                                ? 'bg-gradient-to-br from-amber-400/20 to-yellow-600/20 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                                : 'bg-slate-900 border-slate-700/60 text-slate-600 grayscale'
                            }`}
                          >
                            <span>{ach.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className={`text-xs font-black ${ach.isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                                {ach.title}
                              </h4>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                              {ach.description}
                            </p>
                          </div>
                        </div>

                        {/* Status Chip */}
                        {ach.isUnlocked ? (
                          <span className="shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Done</span>
                          </span>
                        ) : (
                          <span className="shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>

                      {/* Progress Bar & Details */}
                      <div className="space-y-1 mt-1 pt-1.5 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">
                            {ach.tier} TIER
                          </span>
                          <span className={ach.isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                            {ach.unlockedLabel}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              ach.isUnlocked
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                                : 'bg-slate-700'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. FIXED FULL-WIDTH ACTION BUTTON (Matches Screenshot) */}
      <div className="p-3 bg-[#0B1324] border-t border-[#1A2642] shrink-0">
        <div className="max-w-lg mx-auto">
          {isSelectedDateMatchDay && !isEmptySquad ? (
            <button
              onClick={onPlayNextMatch}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-sm uppercase tracking-wider text-slate-950 shadow-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 fill-current text-slate-950" />
              <span>START MATCH (LIVE 2D)</span>
            </button>
          ) : (
            <button
              onClick={handleAdvanceDay}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-sm uppercase tracking-wider text-slate-950 shadow-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="text-slate-950 text-sm">▶|</span>
              <span>ADVANCE DAY</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. FIXED 5-TAB BOTTOM NAVIGATION BAR (Exact match to Screenshot) */}
      <nav className="px-2 py-1.5 bg-[#070D18] border-t border-[#142036] flex items-center justify-around shrink-0 z-20">
        <button
          onClick={() => setActiveTab('HUB')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeTab === 'HUB' ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {/* 2x2 Grid Icon */}
            <div className="grid grid-cols-2 gap-0.5">
              <span className={`w-1.5 h-1.5 rounded-sm ${activeTab === 'HUB' ? 'bg-amber-400' : 'bg-slate-500'}`} />
              <span className={`w-1.5 h-1.5 rounded-sm ${activeTab === 'HUB' ? 'bg-amber-400' : 'bg-slate-500'}`} />
              <span className={`w-1.5 h-1.5 rounded-sm ${activeTab === 'HUB' ? 'bg-amber-400' : 'bg-slate-500'}`} />
              <span className={`w-1.5 h-1.5 rounded-sm ${activeTab === 'HUB' ? 'bg-amber-400' : 'bg-slate-500'}`} />
            </div>
          </div>
          <span className="text-[10px] mt-0.5">Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('TEAM')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeTab === 'TEAM' ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Team</span>
        </button>

        <button
          onClick={() => setActiveTab('LEAGUE')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeTab === 'LEAGUE' ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">League</span>
        </button>

        <button
          onClick={() => setActiveTab('WORLD')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeTab === 'WORLD' ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">World</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex-1 py-1 flex flex-col items-center justify-center transition-all ${
            activeTab === 'PROFILE' ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </nav>

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121E36] border border-slate-700 rounded-2xl max-w-sm w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Notifications ({unreadCount})</h3>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#0C1527] text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Scouting Update</span>
                <p className="text-slate-200">Next match opponent {opponentFranchise.name} has registered 20 players for the fixture.</p>
                <span className="text-[9px] text-slate-500 font-mono">10m ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Calendar Schedule Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121E36] border border-slate-700 rounded-2xl max-w-md w-full p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Season Schedule (74 Fixtures)</h3>
              </div>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-[#0C1527] text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {(career.tournament?.fixtures || []).slice(0, 20).map((f: any) => (
                <div
                  key={f.fixtureId}
                  className={`p-2 rounded-xl text-xs flex items-center justify-between ${
                    f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-[#091120] border border-slate-800'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-400">Match {f.matchNumber}</span>
                  <span className="font-bold text-white">{f.homeFranchiseId} vs {f.awayFranchiseId}</span>
                  <span className="text-[10px] text-slate-400">{f.venue.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Drawer */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121E36] border-l border-slate-700 w-64 h-full p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h3 className="text-sm font-bold text-white">Dynasty Menu</h3>
                <button
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#0C1527] text-slate-400 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onOpenTactics();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#091120] text-left text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-2"
                >
                  <span>Tactics & Match Plans</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onOpenTraining();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#091120] text-left text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-2"
                >
                  <span>Training & Drills</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onOpenClubHQ();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#091120] text-left text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-2"
                >
                  <span>Club Headquarters</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    onOpenAudit();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#091120] text-left text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-2"
                >
                  <span>Player Database Audit</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setIsMenuDrawerOpen(false);
                onBackToDashboard();
              }}
              className="w-full py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-bold text-red-300 hover:text-white"
            >
              Exit to Main Menu
            </button>
          </div>
        </div>
      )}

      {/* Franchise Detailed Roster Popup (Matches Screenshot_2026-11-10-21-55-08) */}
      {inspectedFranchise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121E36] border border-slate-700 rounded-2xl max-w-sm w-full p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 shrink-0">
              <div className="flex items-center space-x-2.5">
                <FranchiseLogo franchiseId={inspectedFranchise.id} size={36} />
                <div>
                  <h3 className="text-sm font-black text-white">{inspectedFranchise.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {inspectedFranchisePlayers.length} players • {inspectedFranchisePlayers.filter(p => p.isOverseas).length} overseas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingFranchiseId(null)}
                className="w-7 h-7 rounded-lg bg-[#0C1527] text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                ROSTER ({inspectedFranchisePlayers.length})
              </span>
              {inspectedFranchisePlayers.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayer(p)}
                  className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{p.name}</h5>
                    <span className="text-[10px] text-slate-400">{p.primaryRole} · {p.age} yrs</span>
                  </div>
                  <span className="font-mono text-xs font-black text-amber-400 bg-[#121E36] px-2 py-0.5 rounded border border-slate-700">
                    {p.overallRating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
};
