/**
 * WICKET DYNASTY - Career Overview & Home Dashboard (SCR_06)
 * Redesigned to match the authoritative mobile UI reference:
 * - Top Franchise Header with Crest, Season, Notifications (1) and Calendar
 * - Horizontal Calendar Strip with dynamic day selection & match day dots
 * - Daily Activity Card: Empty Squad Warning, Training Day (Tip, Stamina, Focus, Intensity), or Match Day
 * - Fixed Full-Width ADVANCE DAY Action Button
 * - 5-Tab Bottom Navigation Bar (Hub, Team, League, World, Profile) with integrated views
 */
import React, { useState, useMemo, useEffect } from 'react';
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
  FastForward,
  RotateCcw,
} from 'lucide-react';
import { CareerSave } from '../types/career';
import { Fixture } from '../types/tournament';
import { CompetitionId } from '../types/globalSeason';
import { FRANCHISES } from '../data/franchises';
import { getGlobalTeamById, getGlobalTeamSquad } from '../data/globalLeagues';
import { PLAYERS_DATABASE } from '../data/players';
import { FranchiseLogo } from './FranchiseLogo';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerProfileModal } from './PlayerProfileModal';
import { Player } from '../types/player';
import { GlobalSeasonEngine, toIsoDate } from '../services/globalSeasonEngine';
import { SquadValidationEngine } from '../services/squadValidationEngine';
import { InjuryEngine } from '../services/injuryEngine';
import { evaluateCareerAchievements } from '../services/careerAchievements';
import { DbPersistence } from '../services/dbPersistence';
import { WinLossTrendChart } from './WinLossTrendChart';
import { SeasonHubSection } from './SeasonCalendarHub';

interface CareerOverviewScreenProps {
  career: CareerSave;
  onUpdateCareer?: (updated: CareerSave) => void;
  onPlayNextMatch: (fixture?: Fixture, competitionId?: CompetitionId) => void;
  onResumeLiveMatch?: () => void;
  onResumeLiveAuction?: () => void;
  onOpenPlayerDB: () => void;
  onOpenAudit: () => void;
  onOpenTraining: () => void;
  onOpenTactics: () => void;
  onOpenMatchPrep: () => void;
  onOpenTournament: () => void;
  onOpenSeasonHub?: (section?: SeasonHubSection) => void;
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
  onResumeLiveMatch,
  onResumeLiveAuction,
  onOpenPlayerDB,
  onOpenAudit,
  onOpenTraining,
  onOpenTactics,
  onOpenMatchPrep,
  onOpenTournament,
  onOpenSeasonHub,
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

  const savedLiveMatch = DbPersistence.getActiveLiveMatch();
  const hasSavedLiveMatch = Boolean(
    savedLiveMatch &&
    savedLiveMatch.status !== 'COMPLETED' &&
    (savedLiveMatch.careerId
      ? savedLiveMatch.careerId === career.id
      : (savedLiveMatch.homeFranchiseId === career.franchiseId || savedLiveMatch.awayFranchiseId === career.franchiseId))
  );

  // Authoritative phase progress across IPL League -> IPL Playoffs -> Champions League -> Next Season
  const phaseProgress = useMemo(() => GlobalSeasonEngine.getCareerPhaseProgress(career), [career]);

  const savedFixtureObj =
    hasSavedLiveMatch && savedLiveMatch?.fixtureId
      ? career.worldSeason?.championsLeague?.fixtures?.find(f => f.fixtureId === savedLiveMatch.fixtureId) ||
        career.tournament?.fixtures?.find((f: Fixture) => f.fixtureId === savedLiveMatch.fixtureId)
      : undefined;

  const upcomingFixture: Fixture | undefined = savedFixtureObj || phaseProgress.userFixture;
  const upcomingCompetitionId: CompetitionId =
    savedFixtureObj
      ? savedFixtureObj.competitionId === 'GCL_T20'
        ? 'GCL_T20'
        : 'IPL'
      : phaseProgress.competitionId;

  const opponentId = upcomingFixture
    ? upcomingFixture.homeFranchiseId === career.franchiseId
      ? upcomingFixture.awayFranchiseId
      : upcomingFixture.homeFranchiseId
    : hasSavedLiveMatch && savedLiveMatch
    ? savedLiveMatch.homeFranchiseId === career.franchiseId
      ? savedLiveMatch.awayFranchiseId
      : savedLiveMatch.homeFranchiseId
    : FRANCHISES.find(f => f.id !== career.franchiseId)?.id || 'MI';

  const opponentFranchise = getGlobalTeamById(opponentId);
  const isHomeMatch = upcomingFixture ? upcomingFixture.homeFranchiseId === career.franchiseId : true;

  // Calendar dates setup (synced with worldSeason.currentDateIso & currentCareerDate)
  const baseCareerDateMs = useMemo(() => {
    if (career.worldSeason?.currentDateIso) {
      return new Date(`${career.worldSeason.currentDateIso}T10:00:00Z`).getTime();
    }
    return career.currentCareerDate || Date.parse(`${career.currentGameYear || 2026}-03-28T10:00:00Z`);
  }, [career.worldSeason?.currentDateIso, career.currentCareerDate, career.currentGameYear]);

  const [selectedDateMs, setSelectedDateMs] = useState<number>(baseCareerDateMs);

  useEffect(() => {
    setSelectedDateMs(baseCareerDateMs);
  }, [baseCareerDateMs]);

  const baseIso = useMemo(() => toIsoDate(new Date(baseCareerDateMs)), [baseCareerDateMs]);
  const selectedIso = useMemo(() => toIsoDate(new Date(selectedDateMs)), [selectedDateMs]);

  // Generate 7-day strip centered/anchored around baseCareerDateMs
  const calendarDays = useMemo(() => {
    const days = [];
    const oneDayMs = 24 * 60 * 60 * 1000;
    const matchIsoSet = new Set<string>();
    if (upcomingFixture?.matchDateIso) matchIsoSet.add(upcomingFixture.matchDateIso);
    if (phaseProgress.nextAiFixture?.matchDateIso) matchIsoSet.add(phaseProgress.nextAiFixture.matchDateIso);

    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseCareerDateMs + i * oneDayMs);
      const iso = toIsoDate(d);
      const isCurrentDay = i === 0;
      const isSelected = selectedIso === iso;
      const isMatchDay =
        matchIsoSet.has(iso) ||
        (i === 0 && Boolean(upcomingFixture) && (!upcomingFixture?.matchDateIso || baseIso >= upcomingFixture.matchDateIso));

      days.push({
        dateObj: d,
        iso,
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
  }, [baseCareerDateMs, selectedIso, baseIso, upcomingFixture, phaseProgress.nextAiFixture]);

  // Formatted Current Date, Month & Year
  const currentMonthYearStr = useMemo(() => {
    const d = new Date(baseCareerDateMs);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
  const unreadCount = career.unreadNotificationsCount ?? (career.notifications?.filter(n => !n.read).length || 0);
  const savedLiveAuction = DbPersistence.getActiveLiveAuction();
  const hasSavedLiveAuction = Boolean(savedLiveAuction && savedLiveAuction.careerId === career.id);

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

    const baseWithWorkloads: CareerSave = {
      ...career,
      playerWorkloads: updatedWorkloads,
      notifications: newNotifications.slice(0, 30),
      unreadNotificationsCount: (career.unreadNotificationsCount || 0) + (newNotifications.length - (career.notifications?.length || 0)),
      lastPlayedAt: Date.now(),
    };

    // Simulate all scheduled AI-only matches forward by 1 calendar day (never skips user match or saved live match)
    const simDayResult = GlobalSeasonEngine.simulateDays(baseWithWorkloads, 1, PLAYERS_DATABASE, true);
    const updatedCareer = simDayResult.updatedCareer;

    if (onUpdateCareer) {
      onUpdateCareer(updatedCareer);
    }
    const updatedMs = updatedCareer.worldSeason?.currentDateIso
      ? new Date(`${updatedCareer.worldSeason.currentDateIso}T10:00:00Z`).getTime()
      : nextDateMs;
    setSelectedDateMs(updatedMs);
  };

  // One-click Smart Phase Stepper (14th Match -> Playoffs -> Champions League -> Next Season/Year)
  const handleAdvancePhaseStep = () => {
    const res = GlobalSeasonEngine.advanceToNextPlayableStep(career, PLAYERS_DATABASE);
    if (onUpdateCareer) {
      onUpdateCareer(res.updatedCareer);
    }
  };

  // One-click Fast-Forward straight to the user's next Match Day (eliminates tedious 26-85 day manual clicking)
  const handleJumpToNextMatch = () => {
    if (isEmptySquad) {
      onOpenAuctionHub();
      return;
    }
    const res = GlobalSeasonEngine.advanceToUserNextMatch(career, PLAYERS_DATABASE);
    if (onUpdateCareer) {
      onUpdateCareer(res.updatedCareer);
    }
    if (res.updatedCareer.worldSeason?.currentDateIso) {
      setSelectedDateMs(new Date(`${res.updatedCareer.worldSeason.currentDateIso}T10:00:00Z`).getTime());
    }
  };

  // Determine if selected/current day is a match day for the user
  const isSelectedDateMatchDay = useMemo(() => {
    if (!upcomingFixture) return false;
    if (!upcomingFixture.matchDateIso) return true;
    return selectedIso === upcomingFixture.matchDateIso || baseIso >= upcomingFixture.matchDateIso;
  }, [upcomingFixture, selectedIso, baseIso]);

  const daysUntilMatch = phaseProgress.daysUntilUserMatch;

  // Inspected Team (supports all 54 global teams)
  const inspectedFranchise = inspectingFranchiseId ? getGlobalTeamById(inspectingFranchiseId) : null;
  const inspectedFranchisePlayers = useMemo(() => {
    if (!inspectedFranchise) return [];
    return getGlobalTeamSquad(inspectedFranchise.id, PLAYERS_DATABASE, career);
  }, [inspectedFranchise, career]);

  return (
    <div className="flex-1 flex flex-col bg-[#080E1A] text-white select-none overflow-hidden h-full">
      {/* 1. TOP FRANCHISE HEADER (3D Elevated Bar + Season & Year Pill) */}
      <header className="px-4 py-3 bg-gradient-to-b from-[#13203B] to-[#0A1121] border-b-2 border-[#1E2E50] shadow-[0_6px_20px_rgba(0,0,0,0.65)] flex items-center justify-between shrink-0 z-20">
        {/* Left: Franchise Crest + Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-0.5 rounded-xl bg-gradient-to-b from-amber-400/50 to-amber-700/20 shadow-lg shrink-0">
            <FranchiseLogo franchiseId={franchise.id} size={36} className="rounded-xl" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm sm:text-base font-black text-white tracking-wide truncate">
                {franchise.name}
              </h1>
              <span className="pill-3d text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 shrink-0">
                S{career.currentSeason} · {career.currentGameYear || new Date(baseCareerDateMs).getFullYear()}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
              {currentMonthYearStr} · <span className="text-amber-300 font-bold">{phaseProgress.stageBadge}</span>
            </p>
          </div>
        </div>

        {/* Right: Notification, Calendar & Menu Icons */}
        <div className="flex items-center space-x-2">
          {/* Notification Envelope with Unread Badge */}
          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              if (onUpdateCareer && unreadCount > 0) {
                onUpdateCareer({
                  ...career,
                  unreadNotificationsCount: 0,
                  notifications: (career.notifications || []).map(n => ({ ...n, read: true })),
                });
              }
            }}
            className="relative p-2 rounded-xl bg-[#121E36] border border-[#1E2E50] text-slate-300 hover:text-white hover:border-amber-500/40 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-black text-white flex items-center justify-center shadow-md">
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

      {/* 2. HORIZONTAL 3D CALENDAR STRIP */}
      <div className="px-3 py-2.5 bg-[#091120] border-b border-[#16243E] overflow-x-auto scrollbar-none flex items-center justify-between gap-1.5 shrink-0">
        {calendarDays.map(day => (
          <button
            key={day.timestamp}
            onClick={() => setSelectedDateMs(day.timestamp)}
            className={`flex-1 min-w-[44px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              day.isSelected
                ? 'calendar-day-3d-active text-slate-950 font-black scale-105'
                : 'calendar-day-3d text-slate-300 hover:border-slate-600'
            }`}
          >
            <span className={`text-[9px] uppercase font-bold tracking-wider ${day.isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
              {day.dayOfWeek}
            </span>
            <span className={`text-sm font-black ${day.isSelected ? 'text-slate-950' : 'text-white'}`}>
              {day.dayOfMonth}
            </span>

            {/* Red Match Day Dot */}
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
            {hasSavedLiveAuction && onResumeLiveAuction && (
              <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/50 flex items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 block">MEGA AUCTION IN PROGRESS</span>
                  <p className="text-xs font-bold text-white mt-0.5">
                    Lot #{(savedLiveAuction?.currentLotIndex || 0) + 1} · {savedLiveAuction?.phase}
                  </p>
                </div>
                <button
                  onClick={onResumeLiveAuction}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shrink-0"
                >
                  Resume Auction
                </button>
              </div>
            )}
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
            ) : phaseProgress.phaseKey === 'WAITING_IPL_AI_LEAGUE' ||
              phaseProgress.phaseKey === 'WAITING_IPL_PLAYOFFS' ||
              phaseProgress.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL' ||
              phaseProgress.phaseKey === 'WAITING_GCL_AI' ||
              phaseProgress.phaseKey === 'SEASON_COMPLETE' ? (
              /* 3D SEASON PROGRESSION STAGE CARD (Prevents stalling after 14 matches -> Playoffs -> GCL -> Next Year) */
              <div
                className={`p-5 rounded-3xl relative overflow-hidden space-y-4 ${
                  phaseProgress.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL' || phaseProgress.phaseKey === 'WAITING_GCL_AI'
                    ? 'card-3d-cyan'
                    : 'card-3d-gold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`pill-3d text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                      phaseProgress.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL' || phaseProgress.phaseKey === 'WAITING_GCL_AI'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {phaseProgress.stageBadge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300 font-bold">
                    Season {career.currentSeason} · {career.currentGameYear || 2026}
                  </span>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0C1527] border border-amber-400/40 shadow-inner flex items-center justify-center shrink-0">
                    {phaseProgress.phaseKey === 'SEASON_COMPLETE' ? (
                      <RotateCcw className="w-6 h-6 text-amber-300" />
                    ) : phaseProgress.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL' || phaseProgress.phaseKey === 'WAITING_GCL_AI' ? (
                      <Globe className="w-6 h-6 text-cyan-300" />
                    ) : (
                      <Trophy className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white leading-tight">{phaseProgress.headline}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{phaseProgress.subtext}</p>
                  </div>
                </div>

                {phaseProgress.nextAiFixture && (
                  <div className="p-3 rounded-2xl bg-[#091122]/90 border border-slate-700/60 flex items-center justify-between text-xs shadow-inner">
                    <div className="flex items-center space-x-2">
                      <FranchiseLogo franchiseId={phaseProgress.nextAiFixture.homeFranchiseId} size={26} />
                      <span className="font-black text-white">
                        {getGlobalTeamById(phaseProgress.nextAiFixture.homeFranchiseId).shortName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-amber-400">
                      VS · {phaseProgress.nextAiFixture.dateStr}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white">
                        {getGlobalTeamById(phaseProgress.nextAiFixture.awayFranchiseId).shortName}
                      </span>
                      <FranchiseLogo franchiseId={phaseProgress.nextAiFixture.awayFranchiseId} size={26} />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleAdvancePhaseStep}
                    className="w-full py-3.5 px-4 rounded-2xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FastForward className="w-4 h-4 text-slate-950" />
                    <span>
                      {phaseProgress.phaseKey === 'WAITING_IPL_AI_LEAGUE'
                        ? 'Simulate to Playoffs (Q1 & Eliminator)'
                        : phaseProgress.phaseKey === 'WAITING_IPL_PLAYOFFS'
                        ? 'Advance IPL Playoffs'
                        : phaseProgress.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL'
                        ? 'Enter Champions League T20'
                        : phaseProgress.phaseKey === 'WAITING_GCL_AI'
                        ? 'Advance Champions League'
                        : `Start Season ${career.currentSeason + 1} (${(career.currentGameYear || 2026) + 1})`}
                    </span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={onOpenTournament}
                      className="flex-1 py-2.5 px-3 rounded-xl btn-game-dark text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Playoff Bracket</span>
                    </button>
                    {onOpenSeasonHub && (
                      <button
                        onClick={() => onOpenSeasonHub(phaseProgress.phaseKey === 'SEASON_COMPLETE' ? 'TROPHIES' : 'GCL')}
                        className="flex-1 py-2.5 px-3 rounded-xl btn-game-dark text-cyan-300 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{phaseProgress.phaseKey === 'SEASON_COMPLETE' ? 'Trophy Room' : 'Season Hub'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (isSelectedDateMatchDay || hasSavedLiveMatch) ? (
              /* 3D MATCH DAY STATE CARD */
              <div
                className={`p-5 rounded-3xl relative overflow-hidden space-y-4 ${
                  upcomingCompetitionId === 'GCL_T20' ? 'card-3d-cyan' : 'card-3d-gold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="pill-3d text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                      {phaseProgress.stageBadge}
                    </span>
                    <span className="text-xs font-bold text-amber-300">
                      {upcomingFixture
                        ? `${upcomingCompetitionId === 'GCL_T20' ? 'Champions League' : upcomingFixture.playoffStage !== 'NONE' ? 'IPL Playoffs' : 'IPL League'} · Match ${upcomingFixture.matchNumber}`
                        : 'Match Day · T20'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300 font-bold">
                    {upcomingFixture?.dateStr || currentMonthYearStr}
                  </span>
                </div>

                {/* 3D Matchup Crests */}
                <div className="bg-[#091122]/90 border border-slate-700/70 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-3">
                    <div className="p-1 rounded-2xl bg-[#13203B] border border-amber-400/30 shadow-lg">
                      <FranchiseLogo franchiseId={franchise.id} size={46} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{franchise.shortName}</h4>
                      <span className="text-[11px] text-amber-400 font-bold">(You)</span>
                    </div>
                  </div>

                  <span className="pill-3d text-xs font-black text-amber-300 font-mono bg-[#14223D] px-3 py-1.5 rounded-xl border border-amber-500/40">
                    VS
                  </span>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <h4 className="text-sm font-black text-white">{opponentFranchise.shortName}</h4>
                      <span className="text-[11px] text-slate-400">{opponentFranchise.homeCity}</span>
                    </div>
                    <div className="p-1 rounded-2xl bg-[#13203B] border border-slate-600/40 shadow-lg">
                      <FranchiseLogo franchiseId={opponentFranchise.id} size={46} />
                    </div>
                  </div>
                </div>

                {/* Venue & Pitch Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
                  <span className="truncate max-w-[65%]">
                    Venue: <strong className="text-slate-200">{upcomingFixture?.venue || franchise.homeStadium}</strong>
                  </span>
                  <span className="text-amber-300">{career.matchPreparationPlan?.pitchCondition || 'Balanced Surface'}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() =>
                      hasSavedLiveMatch && onResumeLiveMatch
                        ? onResumeLiveMatch()
                        : onPlayNextMatch(upcomingFixture, upcomingCompetitionId)
                    }
                    className="w-full py-3.5 px-4 rounded-2xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 fill-current text-slate-950" />
                    <span>{hasSavedLiveMatch ? 'CONTINUE MATCH' : 'START MATCH (LIVE 2D)'}</span>
                  </button>

                  <button
                    onClick={onOpenMatchPrep}
                    className="w-full py-2.5 px-3 rounded-xl btn-game-dark text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Match Briefing &amp; Toss Strategy</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            ) : (
              /* 3D TRAINING DAY STATE CARD */
              <div className="p-5 rounded-3xl card-3d-elevated relative overflow-hidden space-y-4">
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

                {/* Quick Fast-Forward to Next Match Day */}
                {daysUntilMatch > 0 && (
                  <button
                    onClick={handleJumpToNextMatch}
                    className="w-full py-3 px-4 rounded-2xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <FastForward className="w-4 h-4 text-slate-950" />
                    <span>
                      SIM TO MATCH DAY ({daysUntilMatch} {daysUntilMatch === 1 ? 'DAY' : 'DAYS'})
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* 3D Quick Access Grid to Deep Modules */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Squad & 2D Lineup */}
              <button
                onClick={onOpenSquad}
                className="p-3.5 rounded-2xl tile-3d text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shadow-inner">
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
                className="p-3.5 rounded-2xl tile-3d text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#091120] text-emerald-400 font-mono">
                    Lv. {career.clubProfile?.facilities?.stadium?.tier || 1}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">Club Headquarters</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Stadium, Academy & HQ</p>
              </button>

              {/* Season Calendar & Sim Controls */}
              {onOpenSeasonHub && (
                <>
                  <button
                    onClick={() => onOpenSeasonHub('CALENDAR')}
                    className="p-3.5 rounded-2xl tile-3d text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shadow-inner">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#091120] text-amber-300 font-mono">
                        S{career.currentSeason} · {career.currentGameYear || 2026}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">Season Calendar</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">8 Leagues &amp; Sim Engine</p>
                  </button>

                  <button
                    onClick={() => onOpenSeasonHub('GCL')}
                    className="p-3.5 rounded-2xl tile-3d text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-300 shadow-inner">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#091120] text-cyan-300 font-mono">
                        GCL T20
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors">Champions League</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Groups, QF, SF &amp; Final</p>
                  </button>

                  <button
                    onClick={() => onOpenSeasonHub('TROPHIES')}
                    className="p-3.5 rounded-2xl tile-3d text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300 shadow-inner">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#091120] text-amber-300 font-mono">
                        {(career.trophiesCollected || []).length}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">Trophy Room</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Permanent 3D silverware</p>
                  </button>

                  <button
                    onClick={() => onOpenSeasonHub('HISTORY')}
                    className="p-3.5 rounded-2xl tile-3d text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-purple-300 shadow-inner">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#091120] text-purple-300 font-mono">
                        {(career.matchHistory || []).length}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white group-hover:text-purple-300 transition-colors">Match History</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Results &amp; Season Stats</p>
                  </button>
                </>
              )}

              {/* Career Achievements Quick Access Button */}
              <button
                onClick={() => setActiveTab('PROFILE')}
                className="col-span-2 p-3.5 rounded-2xl tile-3d border-amber-500/35 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
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
                    <p className="text-[10px] text-slate-400">Milestone badges: Playoffs, GCL, Trophy &amp; Squad</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
              </button>
            </div>

            {/* D3.js Win/Loss % Season Form Trend (Last 5 Matches) */}
            <WinLossTrendChart career={career} />
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
                      <PlayerAvatar player={player} size={36} jerseyColor={franchise.primaryColor} />
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
                          {player.primaryRole}{player.age ? ` · ${player.age} yrs` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-400 block">{player.fitness ?? 100}% Fit</span>
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
                {(career.tournament?.pointsTable || []).map((row: any, idx: number) => {
                  const teamFranchise = getGlobalTeamById(row.franchiseId);
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
                      <span className="col-span-1 text-xs text-center text-slate-300 font-mono tabular-nums">{row.played}</span>
                      <span className="col-span-1 text-xs text-center text-emerald-400 font-mono font-bold tabular-nums">{row.won}</span>
                      <span className="col-span-1 text-xs text-center text-red-400 font-mono tabular-nums">{row.lost}</span>
                      <span className="col-span-2 text-xs text-center text-white font-mono font-black tabular-nums">{row.points}</span>
                      <span className="col-span-2 text-xs text-right text-slate-300 font-mono tabular-nums">
                        {(row.netRunRate ?? 0) >= 0 ? `+${(row.netRunRate ?? 0).toFixed(2)}` : (row.netRunRate ?? 0).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {onOpenSeasonHub && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onOpenSeasonHub('LEAGUES')}
                  className="min-h-[42px] py-2.5 px-3 rounded-xl bg-[#121E36] border border-slate-700 text-xs font-bold text-amber-300"
                >
                  All 8 Domestic Leagues
                </button>
                <button
                  onClick={() => onOpenSeasonHub('GCL')}
                  className="min-h-[42px] py-2.5 px-3 rounded-xl bg-[#121E36] border border-cyan-500/40 text-xs font-bold text-cyan-300"
                >
                  Champions League T20
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: WORLD (Global Leagues, GCL, DB & Transfers) ================= */}
        {activeTab === 'WORLD' && (
          <div className="space-y-3 max-w-lg mx-auto">
            {onOpenSeasonHub && (
              <>
                <div className="p-4 rounded-2xl bg-[#121E36] border border-amber-500/40 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white">Year-Round Cricket Calendar</h3>
                    <p className="text-xs text-slate-400">Sim controls, 8 leagues, Playoff brackets &amp; GCL</p>
                  </div>
                  <button
                    onClick={() => onOpenSeasonHub('CALENDAR')}
                    className="py-2 px-3 rounded-xl btn-game-gold text-xs uppercase font-black shrink-0"
                  >
                    Open Hub
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onOpenSeasonHub('LEAGUES')}
                    className="p-3 rounded-2xl bg-[#121E36] border border-[#1E2E50] text-left"
                  >
                    <h4 className="text-xs font-black text-amber-300">8 Domestic Leagues</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">IPL, BBL, PSL, SA20, CPL...</p>
                  </button>
                  <button
                    onClick={() => onOpenSeasonHub('GCL')}
                    className="p-3 rounded-2xl bg-[#121E36] border border-[#1E2E50] text-left"
                  >
                    <h4 className="text-xs font-black text-cyan-300">Champions League</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">16-team Global T20 Cup</p>
                  </button>
                  <button
                    onClick={() => onOpenSeasonHub('TEAMS')}
                    className="p-3 rounded-2xl bg-[#121E36] border border-[#1E2E50] text-left"
                  >
                    <h4 className="text-xs font-black text-white">54 Global Clubs</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Squads, stadiums &amp; titles</p>
                  </button>
                  <button
                    onClick={() => onOpenSeasonHub('TROPHIES')}
                    className="p-3 rounded-2xl bg-[#121E36] border border-[#1E2E50] text-left"
                  >
                    <h4 className="text-xs font-black text-emerald-300">Trophy Room</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Permanent silverware gallery</p>
                  </button>
                </div>
              </>
            )}

            <div className="p-4 rounded-2xl bg-[#121E36] border border-[#1E2E50] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Global Player Database</h3>
                <p className="text-xs text-slate-400">Search all 320 real & uncapped stars</p>
              </div>
              <button
                onClick={onOpenPlayerDB}
                className="py-2 px-3 rounded-xl bg-[#091120] border border-amber-500/40 text-amber-300 text-xs font-black"
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

      {/* 4. FIXED FULL-WIDTH 3D ACTION BUTTON */}
      <div className="p-3 bg-gradient-to-t from-[#070D18] to-[#0B1324] border-t border-[#1A2642] shrink-0">
        <div className="max-w-lg mx-auto">
          {((isSelectedDateMatchDay && !isEmptySquad) || (hasSavedLiveMatch && !isEmptySquad)) ? (
            <button
              onClick={() =>
                hasSavedLiveMatch && onResumeLiveMatch
                  ? onResumeLiveMatch()
                  : onPlayNextMatch(upcomingFixture, upcomingCompetitionId)
              }
              className="w-full py-3.5 px-4 rounded-2xl btn-game-gold text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 fill-current text-slate-950" />
              <span>{hasSavedLiveMatch ? 'CONTINUE MATCH' : 'START MATCH (LIVE 2D)'}</span>
            </button>
          ) : !isEmptySquad &&
            (phaseProgress.phaseKey === 'WAITING_IPL_AI_LEAGUE' ||
              phaseProgress.phaseKey === 'WAITING_IPL_PLAYOFFS' ||
              phaseProgress.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL' ||
              phaseProgress.phaseKey === 'WAITING_GCL_AI' ||
              phaseProgress.phaseKey === 'SEASON_COMPLETE') ? (
            <button
              onClick={handleAdvancePhaseStep}
              className="w-full py-3.5 px-4 rounded-2xl btn-game-gold text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FastForward className="w-5 h-5 text-slate-950" />
              <span>
                {phaseProgress.phaseKey === 'WAITING_IPL_AI_LEAGUE'
                  ? 'SIMULATE TO PLAYOFFS'
                  : phaseProgress.phaseKey === 'WAITING_IPL_PLAYOFFS'
                  ? 'ADVANCE PLAYOFFS'
                  : phaseProgress.phaseKey === 'IPL_COMPLETE_READY_FOR_GCL'
                  ? 'ENTER CHAMPIONS LEAGUE T20'
                  : phaseProgress.phaseKey === 'WAITING_GCL_AI'
                  ? 'ADVANCE CHAMPIONS LEAGUE'
                  : `START SEASON ${career.currentSeason + 1} (${(career.currentGameYear || 2026) + 1})`}
              </span>
            </button>
          ) : daysUntilMatch > 0 && !isEmptySquad ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAdvanceDay}
                className="py-3.5 px-4 rounded-2xl btn-game-dark text-xs uppercase tracking-wider text-slate-200 flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
              >
                <span className="text-amber-400 text-xs">▶|</span>
                <span>1 DAY</span>
              </button>
              <button
                onClick={handleJumpToNextMatch}
                className="flex-1 py-3.5 px-4 rounded-2xl btn-game-gold text-xs sm:text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FastForward className="w-4 h-4 text-slate-950 shrink-0" />
                <span>GO TO MATCH DAY ({daysUntilMatch}D)</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdvanceDay}
              className="w-full py-3.5 px-4 rounded-2xl btn-game-gold text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center space-x-2 cursor-pointer"
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
              {career.notifications && career.notifications.length > 0 ? (
                career.notifications.map(notif => (
                  <div key={notif.id} className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">{notif.title}</span>
                    <p className="text-slate-200">{notif.message}</p>
                    <span className="text-[9px] text-slate-500 font-mono">{notif.date}</span>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Scouting Update</span>
                  <p className="text-slate-200">Next match opponent {opponentFranchise.name} is preparing for fixture action.</p>
                  <span className="text-[9px] text-slate-500 font-mono">League Wire</span>
                </div>
              )}
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
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <PlayerAvatar player={p} size={32} jerseyColor={inspectedFranchise.primaryColor} />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{p.name}</h5>
                      <span className="text-[10px] text-slate-400">{p.primaryRole}{p.age ? ` · ${p.age} yrs` : ''}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black text-amber-400 bg-[#121E36] px-2 py-0.5 rounded border border-slate-700 shrink-0">
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
