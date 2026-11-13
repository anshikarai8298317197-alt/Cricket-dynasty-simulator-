/**
 * WICKET DYNASTY - Master App Container
 * Full Integration of Phases 01, 02, 03, 04, 05 & 06
 */
import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { MainDashboard } from './components/MainDashboard';
import { NewCareerScreen } from './components/NewCareerScreen';
import { FranchiseSelectionScreen } from './components/FranchiseSelectionScreen';
import { CareerOverviewScreen } from './components/CareerOverviewScreen';
import { PlayerDatabaseScreen } from './components/PlayerDatabaseScreen';
import { LoadCareerModal } from './components/LoadCareerModal';
import { DatabaseAuditModal } from './components/DatabaseAuditModal';
import { SettingsModal } from './components/SettingsModal';
import { FranchiseRosterModal } from './components/FranchiseRosterModal';

// Phase 02 Screens
import { AuctionHubScreen } from './components/AuctionHubScreen';
import { AuctionIntroScreen } from './components/AuctionIntroScreen';
import { RetentionScreen } from './components/RetentionScreen';
import { LiveAuctionScreen } from './components/LiveAuctionScreen';
import { SquadManagementScreen } from './components/SquadManagementScreen';
import { PlayingXiScreen } from './components/PlayingXiScreen';

// Phase 03 Screens & Modals
import { TrainingDashboard } from './components/TrainingDashboard';
import { TacticalManagementScreen } from './components/TacticalManagementScreen';
import { MatchPreparationModal } from './components/MatchPreparationModal';

// Phase 04, 05, 06 Screens & Services
import { TournamentHubScreen } from './components/TournamentHubScreen';
import { LiveMatchScreen } from './components/LiveMatchScreen';
import { MatchResultScreen } from './components/MatchResultScreen';
import { ClubManagementScreen } from './components/ClubManagementScreen';
import { MatchEngineAuditModal } from './components/MatchEngineAuditModal';

import { CareerSave, CareerRules, DifficultyLevel, SquadMode } from './types/career';
import { Franchise } from './types/franchise';
import { StorageService } from './services/storage';
import { FRANCHISES } from './data/franchises';
import { PLAYERS_DATABASE } from './data/players';
import { AuctionTransaction } from './types/auction';
import { TournamentState, Fixture } from './types/tournament';
import { FixtureGenerator } from './services/fixtureGenerator';
import { CricketMatchEngine, MatchSimulationConfig } from './services/cricketMatchEngine';
import { TournamentEngine } from './services/tournamentEngine';
import { ClubEngine } from './services/clubEngine';
import { MatchResultDetails } from './types/match';
import { SquadValidationEngine, SquadValidationResult } from './services/squadValidationEngine';
import { MatchValidationModal } from './components/MatchValidationModal';
import { DbPersistence } from './services/dbPersistence';
import { MilestonePopupModal } from './components/MilestonePopupModal';
import { PlayerMilestoneEvent } from './services/milestoneService';
import { SeasonCalendarHub, SeasonHubSection } from './components/SeasonCalendarHub';
import { TrophyCelebrationModal } from './components/TrophyCelebrationModal';
import { GlobalSeasonEngine } from './services/globalSeasonEngine';
import { LevelPlayService } from './services/levelPlayService';
import { CareerTrophy, CompetitionId } from './types/globalSeason';
import { getGlobalTeamById, getGlobalTeamSquad } from './data/globalLeagues';

type AppView =
  | 'DASHBOARD'
  | 'NEW_CAREER'
  | 'FRANCHISE_SELECTION'
  | 'CAREER_OVERVIEW'
  | 'PLAYER_DATABASE'
  | 'AUCTION_HUB'
  | 'AUCTION_INTRO'
  | 'RETENTIONS'
  | 'LIVE_AUCTION'
  | 'SQUAD_MANAGEMENT'
  | 'PLAYING_XI'
  | 'TRAINING_DASHBOARD'
  | 'TACTICAL_MANAGEMENT'
  | 'TOURNAMENT_HUB'
  | 'SEASON_HUB'
  | 'LIVE_MATCH'
  | 'MATCH_RESULT'
  | 'CLUB_MANAGEMENT';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [activeCareer, setActiveCareer] = useState<CareerSave | null>(null);

  // Pending career creation parameters
  const [pendingCareerConfig, setPendingCareerConfig] = useState<{
    careerName: string;
    tournamentName: string;
    difficulty: DifficultyLevel;
    squadMode: SquadMode;
    trainingMode?: 'Auto' | 'Manual';
    rules: CareerRules;
    targetSlot?: number;
  } | null>(null);

  // Modals
  const [isLoadCareerOpen, setIsLoadCareerOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFranchiseRosterOpen, setIsFranchiseRosterOpen] = useState(false);
  const [isMatchPrepOpen, setIsMatchPrepOpen] = useState(false);
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [playerDbFranchiseFilter, setPlayerDbFranchiseFilter] = useState<string | null>(null);
  const [matchValidationError, setMatchValidationError] = useState<SquadValidationResult | null>(null);
  const [exitConfirmMode, setExitConfirmMode] = useState<'LIVE_AUCTION' | 'LIVE_MATCH' | null>(null);

  // Live Match & World Season UI State
  const [activeMatchConfig, setActiveMatchConfig] = useState<MatchSimulationConfig | null>(null);
  const [activeMatchCompetitionId, setActiveMatchCompetitionId] = useState<CompetitionId>('IPL');
  const [activeMatchResult, setActiveMatchResult] = useState<MatchResultDetails | null>(null);
  const [activeMilestonesQueue, setActiveMilestonesQueue] = useState<PlayerMilestoneEvent[]>([]);
  const [trophyCelebrationQueue, setTrophyCelebrationQueue] = useState<CareerTrophy[]>([]);
  const [seasonHubSection, setSeasonHubSection] = useState<SeasonHubSection>('CALENDAR');

  // Auto-Save Toast state
  const [saveToastVisible, setSaveToastVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const handleSaveNotification = () => {
      setSaveToastVisible(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setSaveToastVisible(false);
      }, 2000);
    };

    window.addEventListener('app:game-saved', handleSaveNotification);
    return () => {
      window.removeEventListener('app:game-saved', handleSaveNotification);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Boot: Initialize LevelPlay Ads SDK (single-init guard), hydrate IndexedDB -> localStorage mirrors, load active career & draft
  useEffect(() => {
    let cancelled = false;
    LevelPlayService.initialize();

    const loadSavedCareer = () => {
      const saved = StorageService.getActiveCareer();
      if (saved && !cancelled) {
        if (!saved.tournament || !saved.tournament.fixtures || saved.tournament.fixtures.length !== 74) {
          saved.tournament = FixtureGenerator.generateSchedule(saved.currentGameYear || 2026);
        }
        if (!saved.clubProfile) {
          const franchise = FRANCHISES.find(f => f.id === saved.franchiseId) || FRANCHISES[0];
          saved.clubProfile = ClubEngine.generateInitialClubProfile(franchise, saved.id);
        }
        const hydrated = GlobalSeasonEngine.ensureCareerWorldSeason(saved, PLAYERS_DATABASE);
        setActiveCareer(hydrated);
      }
    };

    loadSavedCareer();
    DbPersistence.hydrateFromIndexedDb().then(() => {
      if (!cancelled) {
        loadSavedCareer();
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Update active career and sync storage
  const handleUpdateCareer = (updated: CareerSave, newTrophies?: CareerTrophy[]) => {
    setActiveCareer(updated);
    StorageService.saveCareer(updated);
    if (newTrophies && newTrophies.length > 0) {
      setTrophyCelebrationQueue(prev => [...prev, ...newTrophies]);
    }
  };

  // Update Tournament state (keeps IPL inside worldSeason synchronized)
  const handleUpdateTournament = (updatedTourn: TournamentState) => {
    if (!activeCareer) return;
    const base = GlobalSeasonEngine.ensureCareerWorldSeason(activeCareer, PLAYERS_DATABASE);
    const prevChamp = base.worldSeason?.domesticLeagues?.IPL?.playoffs?.championFranchiseId;
    const nextChamp = updatedTourn.playoffs?.championFranchiseId;
    const finalFix = updatedTourn.fixtures.find(f => f.playoffStage === 'FINAL');
    let trophies = [...(base.trophiesCollected || [])];
    const awarded: CareerTrophy[] = [];

    if (!prevChamp && nextChamp === base.franchiseId && finalFix) {
      const trophyKey = `trophy_IPL_${base.worldSeason!.currentGameYear}_${base.currentSeason}`;
      if (!trophies.some(t => t.id === trophyKey)) {
        const tObj: CareerTrophy = {
          id: trophyKey,
          competitionId: 'IPL',
          trophyName: 'IPL Champion Trophy',
          competitionName: 'Indian Premier League',
          seasonYear: base.worldSeason!.currentGameYear,
          seasonNumber: base.currentSeason,
          winningTeamId: base.franchiseId,
          winningTeamName: getGlobalTeamById(base.franchiseId).name,
          runnerUpTeamId: updatedTourn.playoffs?.runnerUpFranchiseId,
          finalMargin: finalFix.resultDescription,
          tier: 'PLATINUM',
          awardedAt: Date.now(),
        };
        trophies = [tObj, ...trophies];
        awarded.push(tObj);
      }
    }

    const iplLeagueDone = updatedTourn.fixtures
      .filter(f => f.playoffStage === 'NONE')
      .every(f => f.isCompleted);
    const completedDates = updatedTourn.fixtures
      .filter(f => f.isCompleted && f.matchDateIso)
      .map(f => f.matchDateIso!)
      .sort();
    const latestMatchIso = completedDates[completedDates.length - 1];
    const nextDateIso =
      latestMatchIso && latestMatchIso > base.worldSeason!.currentDateIso
        ? latestMatchIso
        : base.worldSeason!.currentDateIso;

    let nextPhase = base.seasonPhase;
    if (base.worldSeason?.championsLeague) {
      nextPhase =
        base.worldSeason.championsLeague.status === 'COMPLETED'
          ? 'Season End'
          : 'Champions League';
    } else if (iplLeagueDone || updatedTourn.playoffs?.championFranchiseId) {
      nextPhase = 'Playoffs';
    }

    const updatedCareer: CareerSave = {
      ...base,
      seasonPhase: nextPhase,
      currentCareerDate: new Date(`${nextDateIso}T12:00:00`).getTime(),
      tournament: updatedTourn,
      trophiesCollected: trophies,
      statsSummary: {
        ...base.statsSummary,
        trophies: Math.max(base.statsSummary.trophies, trophies.length),
      },
      worldSeason: {
        ...base.worldSeason!,
        currentDateIso: nextDateIso,
        domesticLeagues: {
          ...base.worldSeason!.domesticLeagues,
          IPL: updatedTourn,
        },
      },
      lastPlayedAt: Date.now(),
    };
    handleUpdateCareer(updatedCareer, awarded);
  };

  // Handle proceed from New Career to Franchise Selection
  const handleProceedToFranchise = (config: {
    careerName: string;
    tournamentName: string;
    difficulty: DifficultyLevel;
    squadMode: SquadMode;
    trainingMode?: 'Auto' | 'Manual';
    rules: CareerRules;
  }) => {
    setPendingCareerConfig(config);
    setCurrentView('FRANCHISE_SELECTION');
  };

  // Handle final franchise selection and career initialization
  const handleFinalizeCareer = (selectedFranchise: Franchise) => {
    const fallbackDraft = DbPersistence.getCareerDraft();
    const cfg = pendingCareerConfig || (fallbackDraft ? {
      careerName: fallbackDraft.careerName,
      tournamentName: fallbackDraft.tournamentName,
      difficulty: fallbackDraft.difficulty,
      squadMode: fallbackDraft.squadMode,
      trainingMode: fallbackDraft.trainingMode,
      rules: {
        allowRtmCards: true,
        overseasLimitInXI: 4,
        squadSizeMin: 18,
        squadSizeMax: 25,
        salaryCapCr: 100.0,
        tradeWindowEnabled: true,
        injuryFrequency: 'Realistic' as const,
      },
    } : null);
    if (!cfg) return;

    // Find next available slot or default to 1
    const allSlots = StorageService.getAllSlots();
    let targetSlot = pendingCareerConfig?.targetSlot || 1;
    if (!pendingCareerConfig?.targetSlot) {
      const emptyIdx = allSlots.findIndex(s => s === null);
      targetSlot = emptyIdx !== -1 ? emptyIdx + 1 : 1;
    }

    // Initialize squad players based on squad mode
    let initialSquadIds: string[] = [];
    if (cfg.squadMode === 'Real Squads Mode') {
      initialSquadIds = PLAYERS_DATABASE
        .filter(p => p.originalFranchiseId === selectedFranchise.id)
        .map(p => p.id);
    }

    const initialTournament = FixtureGenerator.generateSchedule(2026);
    const careerId = `career_${Date.now()}`;
    const initialClub = ClubEngine.generateInitialClubProfile(selectedFranchise, careerId);

    const baseCareer: CareerSave = {
      id: careerId,
      name: cfg.careerName,
      slotIndex: targetSlot,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      version: '1.0.0',
      tournamentName: cfg.tournamentName,
      difficulty: cfg.difficulty,
      squadMode: cfg.squadMode,
      trainingMode: cfg.trainingMode || 'Auto',
      rules: cfg.rules,
      franchiseId: selectedFranchise.id,
      currentSeason: 1,
      currentGameYear: 2026,
      seasonPhase: cfg.squadMode === 'Auction Mode' ? 'Retentions' : 'SEASON_ACTIVE',
      purseBalanceCr: selectedFranchise.startingPurseCr,
      squadPlayerIds: initialSquadIds,
      playingXiIds: initialSquadIds.slice(0, 11),
      captainId: initialSquadIds[0] || null,
      viceCaptainId: initialSquadIds[1] || null,
      wicketKeeperId: initialSquadIds[2] || null,
      tournament: initialTournament,
      clubProfile: initialClub,
      trophiesCollected: [],
      unlockedAchievementIds: [],
      recordedMatchIds: [],
      matchHistory: [],
      statsSummary: {
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        trophies: 0,
      },
    };

    const hydratedCareer = GlobalSeasonEngine.ensureCareerWorldSeason(baseCareer, PLAYERS_DATABASE);
    handleUpdateCareer(hydratedCareer);
    DbPersistence.clearCareerDraft();
    setPendingCareerConfig(null);
    setCurrentView(cfg.squadMode === 'Auction Mode' ? 'RETENTIONS' : 'CAREER_OVERVIEW');
  };

  // Reset all local storage
  const handleResetStorage = () => {
    for (let i = 1; i <= 5; i++) {
      StorageService.deleteSlot(i);
    }
    setActiveCareer(null);
    setCurrentView('DASHBOARD');
  };

  // Handle Auction Complete callback
  const handleAuctionComplete = (
    finalSquadIds: string[],
    finalPurseCr: number,
    allFranchiseSquads: Record<string, string[]>,
    allFranchisePurses: Record<string, number>,
    transactions: AuctionTransaction[]
  ) => {
    if (!activeCareer) return;

    const updatedCareer: CareerSave = {
      ...activeCareer,
      squadPlayerIds: finalSquadIds,
      playingXiIds: finalSquadIds.slice(0, 11),
      purseBalanceCr: finalPurseCr,
      allFranchiseSquads,
      allFranchisePurses,
      auctionTransactions: transactions,
      seasonPhase: 'SEASON_ACTIVE',
      lastPlayedAt: Date.now(),
    };

    handleUpdateCareer(updatedCareer);
    setCurrentView('SQUAD_MANAGEMENT');
  };

  // Directly hydrate and resume the exact previously saved unfinished match
  const handleContinueSavedMatch = () => {
    if (!activeCareer) return;
    const savedMatch = DbPersistence.getActiveLiveMatch();
    if (!savedMatch || savedMatch.status === 'COMPLETED') {
      handleStartLiveMatch();
      return;
    }

    if (savedMatch.careerId && savedMatch.careerId !== activeCareer.id) {
      handleStartLiveMatch();
      return;
    }

    const resolveXiPlayers = (ids: string[], franchiseId: string) => {
      const mapped = ids
        .map(id => {
          const base = PLAYERS_DATABASE.find(p => p.id === id);
          if (!base) return null;
          if (franchiseId === activeCareer.franchiseId && activeCareer.careerPlayerOverrides?.[id]) {
            return { ...base, ...activeCareer.careerPlayerOverrides[id] };
          }
          return base;
        })
        .filter(Boolean) as typeof PLAYERS_DATABASE;

      if (mapped.length === 11) return mapped;
      return getGlobalTeamSquad(franchiseId, PLAYERS_DATABASE, activeCareer);
    };

    const gclFixture = activeCareer.worldSeason?.championsLeague?.fixtures?.find(
      f => f.fixtureId === savedMatch.fixtureId
    );
    const currentTourn: TournamentState = activeCareer.tournament || FixtureGenerator.generateSchedule(2026);
    const savedFixture = gclFixture || currentTourn.fixtures.find(f => f.fixtureId === savedMatch.fixtureId);
    const homeFranchiseObj = getGlobalTeamById(savedMatch.homeFranchiseId);

    const isUserHome = savedMatch.homeFranchiseId === activeCareer.franchiseId;
    const isUserAway = savedMatch.awayFranchiseId === activeCareer.franchiseId;

    const resumedConfig: MatchSimulationConfig = {
      matchId: savedMatch.matchId,
      fixtureId: savedMatch.fixtureId,
      homeFranchiseId: savedMatch.homeFranchiseId,
      awayFranchiseId: savedMatch.awayFranchiseId,
      homePlayingXi: resolveXiPlayers(savedMatch.homePlayingXiIds || [], savedMatch.homeFranchiseId),
      awayPlayingXi: resolveXiPlayers(savedMatch.awayPlayingXiIds || [], savedMatch.awayFranchiseId),
      homeTactics: isUserHome ? activeCareer.tactics : undefined,
      awayTactics: isUserAway ? activeCareer.tactics : undefined,
      conditions: {
        pitchCondition: activeCareer.matchPreparationPlan?.pitchCondition || 'Balanced Surface',
        weatherCondition: 'Clear 28°C',
        venue: savedFixture?.venue || homeFranchiseObj?.homeStadium || 'Wankhede Stadium, Mumbai',
      },
    };

    setActiveMatchCompetitionId(gclFixture ? 'GCL_T20' : 'IPL');
    setActiveMatchConfig(resumedConfig);
    setActiveMatchResult(null);
    setIsMatchPrepOpen(false);
    setCurrentView('LIVE_MATCH');
  };

  // Launch Live Match Simulation across IPL or Global Champions League T20
  const handleStartLiveMatch = (fixture?: Fixture, competitionId?: CompetitionId) => {
    if (!activeCareer) return;

    const careerHydrated = GlobalSeasonEngine.ensureCareerWorldSeason(activeCareer, PLAYERS_DATABASE);
    let currentTourn: TournamentState = careerHydrated.tournament || FixtureGenerator.generateSchedule(2026);

    const gclPending = careerHydrated.worldSeason?.championsLeague?.fixtures?.find(
      f =>
        !f.isCompleted &&
        !f.homeFranchiseId.startsWith('TBD') &&
        !f.awayFranchiseId.startsWith('TBD') &&
        (f.homeFranchiseId === careerHydrated.franchiseId || f.awayFranchiseId === careerHydrated.franchiseId)
    );
    const iplPending = currentTourn.fixtures.find(
      f =>
        !f.isCompleted &&
        !f.homeFranchiseId.startsWith('TBD') &&
        !f.awayFranchiseId.startsWith('TBD') &&
        (f.homeFranchiseId === careerHydrated.franchiseId || f.awayFranchiseId === careerHydrated.franchiseId)
    );

    const targetFixture = fixture || iplPending || gclPending;
    if (!targetFixture || targetFixture.isCompleted) {
      const stepRes = GlobalSeasonEngine.advanceToNextPlayableStep(careerHydrated, PLAYERS_DATABASE);
      handleUpdateCareer(stepRes.updatedCareer, stepRes.newlyAwardedTrophies);
      return;
    }

    const resolvedCompId: CompetitionId =
      competitionId ||
      (targetFixture.competitionId === 'GCL_T20' ? 'GCL_T20' : 'IPL');

    // If an unfinished saved match already exists for this career & fixture, resume it instead of creating a new one
    const existingLiveMatch = DbPersistence.getActiveLiveMatch();
    if (
      existingLiveMatch &&
      existingLiveMatch.status !== 'COMPLETED' &&
      (!existingLiveMatch.careerId || existingLiveMatch.careerId === careerHydrated.id) &&
      existingLiveMatch.fixtureId === targetFixture.fixtureId
    ) {
      handleContinueSavedMatch();
      return;
    }

    // 1. Authoritative Squad Validation: Block starting match if user squad is empty or invalid
    const squadValidation = SquadValidationEngine.validateSquadForMatch(careerHydrated, targetFixture);
    if (!squadValidation.isValidForMatch) {
      setMatchValidationError(squadValidation);
      return;
    }

    if (existingLiveMatch) {
      DbPersistence.clearLiveMatch();
    }

    // Intervening AI fixtures auto-sim when starting an IPL or GCL match + advance calendar date cleanly
    let careerForMatch = careerHydrated;
    if (resolvedCompId === 'IPL') {
      currentTourn = TournamentEngine.simulateInterveningFixtures(
        currentTourn,
        targetFixture.matchNumber,
        PLAYERS_DATABASE,
        careerHydrated.allFranchiseSquads
      );
      const nextIso =
        targetFixture.matchDateIso && targetFixture.matchDateIso > careerHydrated.worldSeason!.currentDateIso
          ? targetFixture.matchDateIso
          : careerHydrated.worldSeason!.currentDateIso;
      careerForMatch = {
        ...careerHydrated,
        tournament: currentTourn,
        currentCareerDate: new Date(`${nextIso}T12:00:00`).getTime(),
        worldSeason: {
          ...careerHydrated.worldSeason!,
          currentDateIso: nextIso,
          domesticLeagues: {
            ...careerHydrated.worldSeason!.domesticLeagues,
            IPL: currentTourn,
          },
        },
        lastPlayedAt: Date.now(),
      };
      handleUpdateCareer(careerForMatch);
    } else if (resolvedCompId === 'GCL_T20' && careerHydrated.worldSeason?.championsLeague) {
      const protectedId = GlobalSeasonEngine.getActiveProtectedFixtureId();
      const pendingAiGcl = careerHydrated.worldSeason.championsLeague.fixtures
        .filter(
          f =>
            !f.isCompleted &&
            f.matchNumber < targetFixture.matchNumber &&
            !f.homeFranchiseId.startsWith('TBD') &&
            !f.awayFranchiseId.startsWith('TBD') &&
            f.fixtureId !== protectedId &&
            f.homeFranchiseId !== careerHydrated.franchiseId &&
            f.awayFranchiseId !== careerHydrated.franchiseId
        )
        .sort((a, b) => a.matchNumber - b.matchNumber);

      for (const aiGcl of pendingAiGcl) {
        const res = GlobalSeasonEngine.simulateSpecificFixture(
          careerForMatch,
          'GCL_T20',
          aiGcl.fixtureId,
          PLAYERS_DATABASE
        );
        careerForMatch = res.updatedCareer;
      }

      const nextIso =
        targetFixture.matchDateIso && targetFixture.matchDateIso > careerForMatch.worldSeason!.currentDateIso
          ? targetFixture.matchDateIso
          : careerForMatch.worldSeason!.currentDateIso;
      careerForMatch = {
        ...careerForMatch,
        currentCareerDate: new Date(`${nextIso}T12:00:00`).getTime(),
        worldSeason: {
          ...careerForMatch.worldSeason!,
          currentDateIso: nextIso,
        },
      };
      handleUpdateCareer(careerForMatch);
    }

    // 2. Select strict Playing XI for both franchises (supports both IPL and all 44 international teams)
    const isUserHome = targetFixture.homeFranchiseId === careerHydrated.franchiseId;
    const isUserAway = targetFixture.awayFranchiseId === careerHydrated.franchiseId;

    const homeXi = getGlobalTeamSquad(targetFixture.homeFranchiseId, PLAYERS_DATABASE, careerHydrated);
    const awayXi = getGlobalTeamSquad(targetFixture.awayFranchiseId, PLAYERS_DATABASE, careerHydrated);

    if (homeXi.length !== 11 || awayXi.length !== 11) {
      setMatchValidationError({
        isValidForSeason: false,
        isValidForMatch: false,
        isEmptySquad: careerHydrated.squadPlayerIds.length === 0,
        errors: [
          `Incomplete Playing XI: ${
            homeXi.length !== 11
              ? `Home team (${targetFixture.homeFranchiseId}) has ${homeXi.length}/11 players`
              : `Away team (${targetFixture.awayFranchiseId}) has ${awayXi.length}/11 players`
          }. 11 players required.`,
        ],
        warnings: [],
        squadCount: careerHydrated.squadPlayerIds.length,
        playingXiCount: careerHydrated.playingXiIds.length,
        overseasInXiCount: 0,
        hasWicketKeeper: false,
        hasCaptain: false,
        injuredInXi: [],
      });
      return;
    }

    const matchId = `mat_${targetFixture.fixtureId}_${careerHydrated.id}_${Date.now()}`;

    const matchConfig: MatchSimulationConfig = {
      matchId,
      fixtureId: targetFixture.fixtureId,
      homeFranchiseId: targetFixture.homeFranchiseId,
      awayFranchiseId: targetFixture.awayFranchiseId,
      homePlayingXi: homeXi,
      awayPlayingXi: awayXi,
      homeTactics: isUserHome ? careerHydrated.tactics : undefined,
      awayTactics: isUserAway ? careerHydrated.tactics : undefined,
      conditions: {
        pitchCondition: careerHydrated.matchPreparationPlan?.pitchCondition || 'Balanced Surface',
        weatherCondition: 'Clear 28°C',
        venue: targetFixture.venue,
      },
    };

    setActiveMatchCompetitionId(resolvedCompId);
    setActiveMatchConfig(matchConfig);
    setActiveMatchResult(null);
    setIsMatchPrepOpen(false);
    setCurrentView('LIVE_MATCH');
  };

  // When live match completes -> transition to Match Result Screen
  const handleMatchSimulationComplete = (result: MatchResultDetails) => {
    DbPersistence.clearLiveMatch();
    setActiveMatchResult(result);
    setCurrentView('MATCH_RESULT');
  };

  // From Match Result Screen -> commit result across worldSeason, award trophies & return to Hub
  const handleCommitMatchResult = () => {
    if (!activeCareer || !activeMatchResult) {
      setCurrentView('CAREER_OVERVIEW');
      return;
    }

    DbPersistence.clearLiveMatch();

    const { updatedCareer, newlyAwardedTrophies, newlyUnlockedMilestones } =
      GlobalSeasonEngine.recordCompetitionMatchResult(
        activeCareer,
        activeMatchCompetitionId,
        activeMatchResult,
        PLAYERS_DATABASE
      );

    handleUpdateCareer(updatedCareer, newlyAwardedTrophies);
    if (newlyUnlockedMilestones.length > 0) {
      setActiveMilestonesQueue(newlyUnlockedMilestones);
    }

    setActiveMatchResult(null);
    if (activeMatchCompetitionId === 'GCL_T20') {
      setSeasonHubSection('GCL');
      setCurrentView('SEASON_HUB');
    } else {
      setCurrentView('TOURNAMENT_HUB');
    }
  };

  // Optional Rewarded Ad Broadcast Bonus on Match Result Screen (idempotent per matchId + rewardToken)
  const handleClaimBroadcastBonus = (amountCr: number, rewardToken: string) => {
    if (!activeCareer || !activeMatchResult || !rewardToken) return;
    const matchKey = `match_bonus_${activeCareer.id}_${activeMatchResult.matchId}`;
    const tokenKey = `match_bonus_tok_${rewardToken}`;
    if (DbPersistence.hasProcessedEvent(matchKey) || DbPersistence.hasProcessedEvent(tokenKey)) {
      return;
    }
    DbPersistence.markEventProcessed(matchKey);
    DbPersistence.markEventProcessed(tokenKey);

    const profile = activeCareer.clubProfile;
    const updatedProfile = profile
      ? {
          ...profile,
          financialLedger: [
            {
              id: `tx_bcast_${Date.now()}`,
              careerId: activeCareer.id,
              seasonNumber: activeCareer.currentSeason,
              type: 'INCOME' as const,
              category: 'SPONSORSHIP' as const,
              amountCr,
              timestamp: Date.now(),
              dateStr: activeCareer.worldSeason?.currentDateIso || 'Match Day',
              description: `Post-Match Broadcast Sponsor Bonus (${activeMatchResult.fixtureId})`,
            },
            ...(profile.financialLedger || []),
          ],
        }
      : profile;

    handleUpdateCareer({
      ...activeCareer,
      purseBalanceCr: Number((activeCareer.purseBalanceCr + amountCr).toFixed(2)),
      clubProfile: updatedProfile,
      lastPlayedAt: Date.now(),
    });
  };

  // Active franchise reference
  const activeFranchise = activeCareer
    ? FRANCHISES.find(f => f.id === activeCareer.franchiseId)
    : null;

  return (
    <div className="min-h-screen bg-[#080E1A] text-white flex justify-center selection:bg-amber-500 selection:text-black">
      {/* Mobile-first centered frame container */}
      <div className="w-full max-w-md min-h-screen bg-[#0C1425] flex flex-col relative shadow-2xl border-x border-[#1E2D4A]/50">
        {/* Navigation Header */}
        {currentView !== 'TRAINING_DASHBOARD' &&
          currentView !== 'TACTICAL_MANAGEMENT' &&
          currentView !== 'LIVE_MATCH' &&
          currentView !== 'MATCH_RESULT' &&
          currentView !== 'TOURNAMENT_HUB' &&
          currentView !== 'SEASON_HUB' &&
          currentView !== 'CLUB_MANAGEMENT' && (
            <HeaderBar
              title={
                currentView === 'DASHBOARD'
                  ? 'Wicket Dynasty'
                  : currentView === 'NEW_CAREER'
                  ? 'New Career Setup'
                  : currentView === 'FRANCHISE_SELECTION'
                  ? 'Franchise Selection'
                  : currentView === 'CAREER_OVERVIEW'
                  ? 'Career Hub'
                  : currentView === 'AUCTION_HUB'
                  ? 'Auction Hub'
                  : currentView === 'RETENTIONS'
                  ? 'Player Retentions'
                  : currentView === 'LIVE_AUCTION'
                  ? 'Live Mega Auction'
                  : currentView === 'SQUAD_MANAGEMENT'
                  ? 'Squad Management'
                  : currentView === 'PLAYING_XI'
                  ? 'Playing XI Lineup'
                  : 'Player Database'
              }
              subtitle={
                currentView === 'DASHBOARD'
                  ? 'Cricket Franchise Simulator'
                  : currentView === 'PLAYER_DATABASE'
                  ? '320 Verified Players'
                  : undefined
              }
              showBack={currentView !== 'DASHBOARD'}
              onBack={() => {
                if (currentView === 'FRANCHISE_SELECTION') setCurrentView('NEW_CAREER');
                else if (currentView === 'NEW_CAREER') setCurrentView('DASHBOARD');
                else if (currentView === 'RETENTIONS') setCurrentView('AUCTION_HUB');
                else if (currentView === 'AUCTION_INTRO') setCurrentView('AUCTION_HUB');
                else if (currentView === 'LIVE_AUCTION') setExitConfirmMode('LIVE_AUCTION');
                else if (currentView === 'AUCTION_HUB') setCurrentView('CAREER_OVERVIEW');
                else if (currentView === 'SQUAD_MANAGEMENT') setCurrentView('CAREER_OVERVIEW');
                else if (currentView === 'PLAYING_XI') setCurrentView('SQUAD_MANAGEMENT');
                else if (currentView === 'PLAYER_DATABASE') {
                  if (activeCareer) setCurrentView('CAREER_OVERVIEW');
                  else setCurrentView('DASHBOARD');
                } else if (currentView === 'CAREER_OVERVIEW') setCurrentView('DASHBOARD');
              }}
              activeFranchise={currentView === 'CAREER_OVERVIEW' ? activeFranchise : null}
              onOpenAudit={() => setIsAuditModalOpen(true)}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          )}

        {/* View Router */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {currentView === 'DASHBOARD' && (() => {
            const savedMatch = DbPersistence.getActiveLiveMatch();
            const savedAuction = DbPersistence.getActiveLiveAuction();
            const hasSavedMatch = Boolean(
              activeCareer &&
              savedMatch &&
              savedMatch.status !== 'COMPLETED' &&
              (!savedMatch.careerId || savedMatch.careerId === activeCareer.id)
            );
            const hasSavedAuction = Boolean(activeCareer && savedAuction && savedAuction.careerId === activeCareer.id);

            return (
              <MainDashboard
                activeCareer={activeCareer}
                hasActiveAuction={hasSavedAuction}
                hasActiveMatch={hasSavedMatch}
                onResumeAuction={() => setCurrentView('LIVE_AUCTION')}
                onResumeMatch={handleContinueSavedMatch}
                onContinueCareer={() => setCurrentView('CAREER_OVERVIEW')}
                onNewCareer={() => {
                  setPendingCareerConfig(null);
                  setCurrentView('NEW_CAREER');
                }}
                onLoadCareer={() => setIsLoadCareerOpen(true)}
                onOpenPlayerDB={franchiseFilter => {
                  setPlayerDbFranchiseFilter(franchiseFilter || null);
                  setCurrentView('PLAYER_DATABASE');
                }}
                onOpenAudit={() => setIsAuditModalOpen(true)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onBrowseFranchises={() => setIsFranchiseRosterOpen(true)}
              />
            );
          })()}

          {currentView === 'NEW_CAREER' && (
            <NewCareerScreen
              onBack={() => setCurrentView('DASHBOARD')}
              onProceedToFranchise={handleProceedToFranchise}
            />
          )}

          {currentView === 'FRANCHISE_SELECTION' && (
            <FranchiseSelectionScreen
              onBack={() => setCurrentView('NEW_CAREER')}
              onSelectFranchise={handleFinalizeCareer}
            />
          )}

          {currentView === 'CAREER_OVERVIEW' && activeCareer && (
            <CareerOverviewScreen
              career={activeCareer}
              onUpdateCareer={handleUpdateCareer}
              onPlayNextMatch={(fix, compId) => handleStartLiveMatch(fix, compId)}
              onResumeLiveMatch={handleContinueSavedMatch}
              onResumeLiveAuction={() => setCurrentView('LIVE_AUCTION')}
              onOpenPlayerDB={() => setCurrentView('PLAYER_DATABASE')}
              onOpenAudit={() => setIsAuditModalOpen(true)}
              onOpenTraining={() => setCurrentView('TRAINING_DASHBOARD')}
              onOpenTactics={() => setCurrentView('TACTICAL_MANAGEMENT')}
              onOpenMatchPrep={() => setIsMatchPrepOpen(true)}
              onOpenTournament={() => setCurrentView('TOURNAMENT_HUB')}
              onOpenSeasonHub={sec => {
                setSeasonHubSection(sec || 'CALENDAR');
                setCurrentView('SEASON_HUB');
              }}
              onOpenClubHQ={() => setCurrentView('CLUB_MANAGEMENT')}
              onOpenSquad={() => setCurrentView('SQUAD_MANAGEMENT')}
              onOpenPlayingXI={() => setCurrentView('PLAYING_XI')}
              onOpenAuctionHub={() => setCurrentView('AUCTION_HUB')}
              onBackToDashboard={() => setCurrentView('DASHBOARD')}
            />
          )}

          {/* Phase 04 / Phase 05: Tournament Hub */}
          {currentView === 'TOURNAMENT_HUB' && activeCareer && (
            <TournamentHubScreen
              career={activeCareer}
              tournament={activeCareer.tournament || FixtureGenerator.generateSchedule(2026)}
              allPlayers={PLAYERS_DATABASE}
              onUpdateTournament={handleUpdateTournament}
              onPlayLiveMatch={fix => handleStartLiveMatch(fix, 'IPL')}
              onOpenChampionsLeague={() => {
                const base = GlobalSeasonEngine.ensureCareerWorldSeason(activeCareer, PLAYERS_DATABASE);
                if (!base.worldSeason?.championsLeague && base.worldSeason?.domesticLeagues.IPL.playoffs?.championFranchiseId) {
                  const res = GlobalSeasonEngine.advanceToNextPlayableStep(base, PLAYERS_DATABASE);
                  handleUpdateCareer(res.updatedCareer, res.newlyAwardedTrophies);
                }
                setSeasonHubSection('GCL');
                setCurrentView('SEASON_HUB');
              }}
              onOpenQAModal={() => setIsQAModalOpen(true)}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* World Year-Round Calendar, 8 Domestic Leagues, Global Champions League, Trophy Room & Match History */}
          {currentView === 'SEASON_HUB' && activeCareer && (
            <SeasonCalendarHub
              career={activeCareer}
              allPlayers={PLAYERS_DATABASE}
              initialSection={seasonHubSection}
              onUpdateCareer={handleUpdateCareer}
              onPlayLiveMatch={(fix, compId) => handleStartLiveMatch(fix, compId)}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* Phase 05: 2D Live Match Screen */}
          {currentView === 'LIVE_MATCH' && (activeMatchConfig || activeMatchResult) && (
            <LiveMatchScreen
              careerId={activeCareer?.id}
              matchConfig={activeMatchConfig || undefined}
              matchResult={activeMatchResult || undefined}
              difficulty={
                activeCareer?.difficulty === 'Easy'
                  ? 'EASY'
                  : activeCareer?.difficulty === 'Hard' || activeCareer?.difficulty === 'Expert'
                  ? 'HARD'
                  : 'MEDIUM'
              }
              userFranchiseId={activeCareer?.franchiseId}
              onMatchComplete={handleMatchSimulationComplete}
              onExit={() => setExitConfirmMode('LIVE_MATCH')}
            />
          )}

          {/* Phase 05: Match Result Screen */}
          {currentView === 'MATCH_RESULT' && activeMatchResult && (
            <MatchResultScreen
              matchResult={activeMatchResult}
              onContinue={handleCommitMatchResult}
              onClaimBroadcastBonus={handleClaimBroadcastBonus}
              bonusClaimed={Boolean(
                activeCareer &&
                  DbPersistence.hasProcessedEvent(
                    `match_bonus_${activeCareer.id}_${activeMatchResult.matchId}`
                  )
              )}
            />
          )}

          {/* Phase 06: Club Headquarters & Dynasty */}
          {currentView === 'CLUB_MANAGEMENT' && activeCareer && (
            <ClubManagementScreen
              career={activeCareer}
              allPlayers={PLAYERS_DATABASE}
              tournament={activeCareer.tournament || FixtureGenerator.generateSchedule(2026)}
              onUpdateCareer={handleUpdateCareer}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* Phase 03: Training & Development Centre */}
          {currentView === 'TRAINING_DASHBOARD' && activeCareer && (
            <TrainingDashboard
              career={activeCareer}
              allPlayers={PLAYERS_DATABASE}
              onUpdateCareer={handleUpdateCareer}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* Phase 03: Tactical Management & Strategy */}
          {currentView === 'TACTICAL_MANAGEMENT' && activeCareer && (
            <TacticalManagementScreen
              career={activeCareer}
              allPlayers={PLAYERS_DATABASE}
              onUpdateCareer={handleUpdateCareer}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* Phase 02: Auction Hub */}
          {currentView === 'AUCTION_HUB' && activeCareer && (
            <AuctionHubScreen
              career={activeCareer}
              onStartAuction={() => setCurrentView('AUCTION_INTRO')}
              onResumeLiveAuction={() => setCurrentView('LIVE_AUCTION')}
              onOpenRetentions={() => setCurrentView('RETENTIONS')}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* Phase 02: Auction Briefing & Set Introduction */}
          {currentView === 'AUCTION_INTRO' && activeCareer && (
            <AuctionIntroScreen
              career={activeCareer}
              onEnterAuction={() => setCurrentView('LIVE_AUCTION')}
              onBack={() => setCurrentView('AUCTION_HUB')}
            />
          )}

          {/* Phase 02: Retentions */}
          {currentView === 'RETENTIONS' && activeCareer && (
            <RetentionScreen
              career={activeCareer}
              onAutoSaveRetentions={(retainedIds, remainingPurseCr) => {
                handleUpdateCareer({
                  ...activeCareer,
                  squadPlayerIds: retainedIds,
                  playingXiIds: retainedIds.slice(0, 11),
                  purseBalanceCr: remainingPurseCr,
                  lastPlayedAt: Date.now(),
                });
              }}
              onConfirmRetentions={(retainedIds, remainingPurseCr) => {
                const updated: CareerSave = {
                  ...activeCareer,
                  squadPlayerIds: retainedIds,
                  playingXiIds: retainedIds.slice(0, 11),
                  purseBalanceCr: remainingPurseCr,
                  seasonPhase: 'Auction',
                  lastPlayedAt: Date.now(),
                };
                handleUpdateCareer(updated);
                setCurrentView('AUCTION_INTRO');
              }}
              onBack={() => setCurrentView('AUCTION_HUB')}
            />
          )}

          {/* Phase 02: Live Auction Room */}
          {currentView === 'LIVE_AUCTION' && activeCareer && (
            <LiveAuctionScreen
              career={activeCareer}
              onAuctionComplete={handleAuctionComplete}
              onExitAuction={() => setExitConfirmMode('LIVE_AUCTION')}
            />
          )}

          {/* Phase 02: Squad Management */}
          {currentView === 'SQUAD_MANAGEMENT' && activeCareer && (
            <SquadManagementScreen
              career={activeCareer}
              onSelectPlayingXI={() => setCurrentView('PLAYING_XI')}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* Phase 02: Playing XI Pitch */}
          {currentView === 'PLAYING_XI' && activeCareer && (
            <PlayingXiScreen
              career={activeCareer}
              onAutoSavePlayingXI={(playingXiIds, captainId, viceCaptainId, wicketKeeperId, impactPlayerId) => {
                handleUpdateCareer({
                  ...activeCareer,
                  playingXiIds,
                  captainId,
                  viceCaptainId,
                  wicketKeeperId,
                  impactPlayerId,
                  lastPlayedAt: Date.now(),
                });
              }}
              onConfirmPlayingXI={(playingXiIds, captainId, viceCaptainId, wicketKeeperId, impactPlayerId) => {
                const updated: CareerSave = {
                  ...activeCareer,
                  playingXiIds,
                  captainId,
                  viceCaptainId,
                  wicketKeeperId,
                  impactPlayerId,
                  lastPlayedAt: Date.now(),
                };
                handleUpdateCareer(updated);
                setCurrentView('CAREER_OVERVIEW');
              }}
              onBack={() => setCurrentView('SQUAD_MANAGEMENT')}
            />
          )}

          {currentView === 'PLAYER_DATABASE' && (
            <PlayerDatabaseScreen
              onBack={() => {
                if (activeCareer) setCurrentView('CAREER_OVERVIEW');
                else setCurrentView('DASHBOARD');
              }}
              initialFranchiseFilter={playerDbFranchiseFilter}
            />
          )}
        </main>

        {/* Global Modals */}
        <LoadCareerModal
          isOpen={isLoadCareerOpen}
          onClose={() => setIsLoadCareerOpen(false)}
          onSelectCareer={career => {
            const hydrated = GlobalSeasonEngine.ensureCareerWorldSeason(career, PLAYERS_DATABASE);
            setActiveCareer(hydrated);
            setCurrentView('CAREER_OVERVIEW');
          }}
          onNewCareerInSlot={slotNum => {
            setPendingCareerConfig({
              careerName: `Career Slot ${slotNum}`,
              tournamentName: 'T20 Franchise League',
              difficulty: 'Normal',
              squadMode: 'Auction Mode',
              rules: {
                allowRtmCards: true,
                overseasLimitInXI: 4,
                squadSizeMin: 18,
                squadSizeMax: 25,
                salaryCapCr: 100.0,
                tradeWindowEnabled: true,
                injuryFrequency: 'Realistic',
              },
              targetSlot: slotNum,
            });
            setCurrentView('FRANCHISE_SELECTION');
          }}
        />

        <DatabaseAuditModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onOpenAudit={() => setIsAuditModalOpen(true)}
          onResetStorage={handleResetStorage}
        />

        <FranchiseRosterModal
          isOpen={isFranchiseRosterOpen}
          onClose={() => setIsFranchiseRosterOpen(false)}
        />

        {/* Phase 03: Match Preparation Modal */}
        {isMatchPrepOpen && activeCareer && (() => {
          const savedMatch = DbPersistence.getActiveLiveMatch();
          const hasSavedLiveMatch = Boolean(
            savedMatch &&
            savedMatch.status !== 'COMPLETED' &&
            (!savedMatch.careerId || savedMatch.careerId === activeCareer.id)
          );
          return (
            <MatchPreparationModal
              career={activeCareer}
              allPlayers={PLAYERS_DATABASE}
              hasSavedLiveMatch={hasSavedLiveMatch}
              onUpdateCareer={handleUpdateCareer}
              onStartMatch={() => handleStartLiveMatch()}
              onContinueMatch={handleContinueSavedMatch}
              onOpenTactics={() => {
                setIsMatchPrepOpen(false);
                setCurrentView('TACTICAL_MANAGEMENT');
              }}
              onClose={() => setIsMatchPrepOpen(false)}
            />
          );
        })()}

        {/* Phase 04 / Phase 05: Match Engine QA Suite Modal */}
        <MatchEngineAuditModal
          isOpen={isQAModalOpen}
          onClose={() => setIsQAModalOpen(false)}
        />

        {/* Squad & Playing XI Match Validation Modal */}
        <MatchValidationModal
          isOpen={matchValidationError !== null}
          validationResult={matchValidationError}
          onReturnToAuction={() => {
            setMatchValidationError(null);
            setCurrentView('LIVE_AUCTION');
          }}
          onConfigurePlayingXi={() => {
            setMatchValidationError(null);
            setCurrentView('PLAYING_XI');
          }}
          onClose={() => setMatchValidationError(null)}
        />

        {/* Non-intrusive 'Game Saved' Auto-Save Toast */}
        {saveToastVisible && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl shadow-black/80 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Game Saved</span>
            </div>
          </div>
        )}

        {/* Back Confirmation Modal for Live Auction / Live Match */}
        {exitConfirmMode && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-[#0C1425] border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-2xl">
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                {exitConfirmMode === 'LIVE_AUCTION' ? 'Pause & Save Auction?' : 'Pause & Save Live Match?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {exitConfirmMode === 'LIVE_AUCTION'
                  ? 'Your current lot, bid history, and all 10 franchise purses are auto-saved. You can resume from this exact lot anytime.'
                  : 'Your match progress, ball-by-ball scorecard, and tactical settings are auto-saved. Resume from this exact ball anytime.'}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setExitConfirmMode(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] text-xs font-bold text-slate-300"
                >
                  Stay Here
                </button>
                <button
                  onClick={() => {
                    if (activeCareer) {
                      StorageService.saveCareer(activeCareer);
                    }
                    const mode = exitConfirmMode;
                    setExitConfirmMode(null);
                    setCurrentView(mode === 'LIVE_AUCTION' ? 'AUCTION_HUB' : 'TOURNAMENT_HUB');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase"
                >
                  Save & Exit
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Milestone Celebration Popup Modal */}
        <MilestonePopupModal
          milestones={activeMilestonesQueue}
          allPlayers={PLAYERS_DATABASE}
          onDismiss={() => setActiveMilestonesQueue([])}
        />

        {/* Championship Trophy Celebration Modal */}
        <TrophyCelebrationModal
          trophies={trophyCelebrationQueue}
          onDismiss={() => setTrophyCelebrationQueue(prev => prev.slice(1))}
        />
      </div>
    </div>
  );
}
