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

  // Live Match State
  const [activeMatchConfig, setActiveMatchConfig] = useState<MatchSimulationConfig | null>(null);
  const [activeMatchResult, setActiveMatchResult] = useState<MatchResultDetails | null>(null);

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

  // Boot: Load active career from storage
  useEffect(() => {
    const saved = StorageService.getActiveCareer();
    if (saved) {
      // Ensure tournament schedule exists (official 74-match IPL format)
      if (!saved.tournament || !saved.tournament.fixtures || saved.tournament.fixtures.length !== 74) {
        saved.tournament = FixtureGenerator.generateSchedule(2026);
      }
      // Ensure club profile exists
      if (!saved.clubProfile) {
        const franchise = FRANCHISES.find(f => f.id === saved.franchiseId) || FRANCHISES[0];
        saved.clubProfile = ClubEngine.generateInitialClubProfile(franchise, saved.id);
      }
      setActiveCareer(saved);

      // Check for crash recovery: Interrupted live match state
      const interruptedMatch = DbPersistence.getActiveLiveMatch();
      if (interruptedMatch && interruptedMatch.status !== 'COMPLETED') {
        console.log('[DbPersistence] Active match delivery state recovered:', interruptedMatch.matchId);
      }
    }
  }, []);

  // Update active career and sync storage
  const handleUpdateCareer = (updated: CareerSave) => {
    setActiveCareer(updated);
    StorageService.saveCareer(updated);
    DbPersistence.saveCareer(updated).catch(() => {});
  };

  // Update Tournament state
  const handleUpdateTournament = (updatedTourn: TournamentState) => {
    if (!activeCareer) return;
    const updatedCareer: CareerSave = {
      ...activeCareer,
      tournament: updatedTourn,
      lastPlayedAt: Date.now(),
    };
    handleUpdateCareer(updatedCareer);
  };

  // Handle proceed from New Career to Franchise Selection
  const handleProceedToFranchise = (config: {
    careerName: string;
    tournamentName: string;
    difficulty: DifficultyLevel;
    squadMode: SquadMode;
    rules: CareerRules;
  }) => {
    setPendingCareerConfig(config);
    setCurrentView('FRANCHISE_SELECTION');
  };

  // Handle final franchise selection and career initialization
  const handleFinalizeCareer = (selectedFranchise: Franchise) => {
    if (!pendingCareerConfig) return;

    // Find next available slot or default to 1
    const allSlots = StorageService.getAllSlots();
    let targetSlot = pendingCareerConfig.targetSlot || 1;
    if (!pendingCareerConfig.targetSlot) {
      const emptyIdx = allSlots.findIndex(s => s === null);
      targetSlot = emptyIdx !== -1 ? emptyIdx + 1 : 1;
    }

    // Initialize squad players based on squad mode
    let initialSquadIds: string[] = [];
    if (pendingCareerConfig.squadMode === 'Real Squads Mode') {
      initialSquadIds = PLAYERS_DATABASE
        .filter(p => p.originalFranchiseId === selectedFranchise.id)
        .map(p => p.id);
    }

    const initialTournament = FixtureGenerator.generateSchedule(2026);
    const careerId = `career_${Date.now()}`;
    const initialClub = ClubEngine.generateInitialClubProfile(selectedFranchise, careerId);

    const newCareer: CareerSave = {
      id: careerId,
      name: pendingCareerConfig.careerName,
      slotIndex: targetSlot,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      version: '1.0.0',
      tournamentName: pendingCareerConfig.tournamentName,
      difficulty: pendingCareerConfig.difficulty,
      squadMode: pendingCareerConfig.squadMode,
      rules: pendingCareerConfig.rules,
      franchiseId: selectedFranchise.id,
      currentSeason: 1,
      seasonPhase: pendingCareerConfig.squadMode === 'Auction Mode' ? 'Auction' : 'SEASON_ACTIVE',
      purseBalanceCr: selectedFranchise.startingPurseCr,
      squadPlayerIds: initialSquadIds,
      playingXiIds: initialSquadIds.slice(0, 11),
      captainId: initialSquadIds[0] || null,
      viceCaptainId: initialSquadIds[1] || null,
      wicketKeeperId: initialSquadIds[2] || null,
      tournament: initialTournament,
      clubProfile: initialClub,
      statsSummary: {
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        trophies: 0,
      },
    };

    handleUpdateCareer(newCareer);
    setPendingCareerConfig(null);
    setCurrentView(pendingCareerConfig.squadMode === 'Auction Mode' ? 'AUCTION_HUB' : 'CAREER_OVERVIEW');
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

  // Launch Live Match Simulation with Strict Squad Validation
  const handleStartLiveMatch = (fixture?: Fixture) => {
    if (!activeCareer) return;

    let currentTourn: TournamentState = activeCareer.tournament || FixtureGenerator.generateSchedule(2026);
    const targetFixture =
      fixture ||
      currentTourn.fixtures.find(
        f =>
          !f.isCompleted &&
          (f.homeFranchiseId === activeCareer.franchiseId || f.awayFranchiseId === activeCareer.franchiseId)
      ) ||
      currentTourn.fixtures[0];

    // 1. Authoritative Squad Validation: Block starting match if squad is empty or invalid
    const squadValidation = SquadValidationEngine.validateSquadForMatch(activeCareer, targetFixture);
    if (!squadValidation.isValidForMatch) {
      setMatchValidationError(squadValidation);
      return;
    }

    // Background simulate all intervening fixtures chronologically before the user's match
    currentTourn = TournamentEngine.simulateInterveningFixtures(
      currentTourn,
      targetFixture.matchNumber,
      PLAYERS_DATABASE,
      activeCareer.allFranchiseSquads
    );

    const updatedCareerWithSim: CareerSave = {
      ...activeCareer,
      tournament: currentTourn,
      lastPlayedAt: Date.now(),
    };
    handleUpdateCareer(updatedCareerWithSim);

    // 2. Select strict Playing XI for both franchises
    const isUserHome = targetFixture.homeFranchiseId === activeCareer.franchiseId;
    const isUserAway = targetFixture.awayFranchiseId === activeCareer.franchiseId;

    const userSelectedXi = (activeCareer.playingXiIds || [])
      .map(id => PLAYERS_DATABASE.find(p => p.id === id))
      .filter(Boolean) as typeof PLAYERS_DATABASE;

    const getAiXi = (franchiseId: string) => {
      const rosterIds = activeCareer.allFranchiseSquads?.[franchiseId];
      if (rosterIds && rosterIds.length >= 11) {
        return rosterIds
          .slice(0, 11)
          .map(id => PLAYERS_DATABASE.find(p => p.id === id))
          .filter(Boolean) as typeof PLAYERS_DATABASE;
      }
      return PLAYERS_DATABASE.filter(p => p.originalFranchiseId === franchiseId).slice(0, 11);
    };

    const homeXi = isUserHome ? userSelectedXi : getAiXi(targetFixture.homeFranchiseId);
    const awayXi = isUserAway ? userSelectedXi : getAiXi(targetFixture.awayFranchiseId);

    // Hard check: Both teams must have strictly 11 players
    if (homeXi.length !== 11 || awayXi.length !== 11) {
      setMatchValidationError({
        isValidForSeason: false,
        isValidForMatch: false,
        isEmptySquad: activeCareer.squadPlayerIds.length === 0,
        errors: [
          `Incomplete Playing XI: ${
            homeXi.length !== 11
              ? `Home team (${targetFixture.homeFranchiseId}) has ${homeXi.length}/11 players`
              : `Away team (${targetFixture.awayFranchiseId}) has ${awayXi.length}/11 players`
          }. 11 players required.`,
        ],
        warnings: [],
        squadCount: activeCareer.squadPlayerIds.length,
        playingXiCount: activeCareer.playingXiIds.length,
        overseasInXiCount: 0,
        hasWicketKeeper: false,
        hasCaptain: false,
        injuredInXi: [],
      });
      return;
    }

    const matchConfig: MatchSimulationConfig = {
      matchId: `mat_${targetFixture.fixtureId}_${Date.now()}`,
      fixtureId: targetFixture.fixtureId,
      homeFranchiseId: targetFixture.homeFranchiseId,
      awayFranchiseId: targetFixture.awayFranchiseId,
      homePlayingXi: homeXi,
      awayPlayingXi: awayXi,
      homeTactics: isUserHome ? activeCareer.tactics : undefined,
      awayTactics: isUserAway ? activeCareer.tactics : undefined,
      conditions: {
        pitchCondition: activeCareer.matchPreparationPlan?.pitchCondition || 'Balanced Surface',
        weatherCondition: 'Clear 28°C',
        venue: targetFixture.venue,
      },
    };

    setActiveMatchConfig(matchConfig);
    setActiveMatchResult(null);
    setIsMatchPrepOpen(false);
    setCurrentView('LIVE_MATCH');
  };

  // When live match completes -> transition to Match Result Screen
  const handleMatchSimulationComplete = (result: MatchResultDetails) => {
    setActiveMatchResult(result);
    setCurrentView('MATCH_RESULT');
  };

  // From Match Result Screen -> commit result to tournament and return to Tournament Hub
  const handleCommitMatchResult = () => {
    if (!activeCareer || !activeMatchResult) {
      setCurrentView('CAREER_OVERVIEW');
      return;
    }

    const currentTourn: TournamentState = activeCareer.tournament || FixtureGenerator.generateSchedule(2026);
    const updatedTourn = TournamentEngine.recordMatchResult(currentTourn, activeMatchResult);

    const updatedCareer: CareerSave = {
      ...activeCareer,
      tournament: updatedTourn,
      lastPlayedAt: Date.now(),
    };

    handleUpdateCareer(updatedCareer);
    setActiveMatchResult(null);
    setCurrentView('TOURNAMENT_HUB');
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
                else if (currentView === 'LIVE_AUCTION') setCurrentView('AUCTION_HUB');
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
          {currentView === 'DASHBOARD' && (
            <MainDashboard
              activeCareer={activeCareer}
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
          )}

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
              onPlayNextMatch={() => handleStartLiveMatch()}
              onOpenPlayerDB={() => setCurrentView('PLAYER_DATABASE')}
              onOpenAudit={() => setIsAuditModalOpen(true)}
              onOpenTraining={() => setCurrentView('TRAINING_DASHBOARD')}
              onOpenTactics={() => setCurrentView('TACTICAL_MANAGEMENT')}
              onOpenMatchPrep={() => setIsMatchPrepOpen(true)}
              onOpenTournament={() => setCurrentView('TOURNAMENT_HUB')}
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
              onPlayLiveMatch={handleStartLiveMatch}
              onOpenQAModal={() => setIsQAModalOpen(true)}
              onBack={() => setCurrentView('CAREER_OVERVIEW')}
            />
          )}

          {/* Phase 05: 2D Live Match Screen */}
          {currentView === 'LIVE_MATCH' && (activeMatchConfig || activeMatchResult) && (
            <LiveMatchScreen
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
              onExit={() => setCurrentView('TOURNAMENT_HUB')}
            />
          )}

          {/* Phase 05: Match Result Screen */}
          {currentView === 'MATCH_RESULT' && activeMatchResult && (
            <MatchResultScreen
              matchResult={activeMatchResult}
              onContinue={handleCommitMatchResult}
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
              onExitAuction={() => setCurrentView('AUCTION_HUB')}
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
              onConfirmPlayingXI={(playingXiIds, captainId, viceCaptainId, wicketKeeperId) => {
                const updated: CareerSave = {
                  ...activeCareer,
                  playingXiIds,
                  captainId,
                  viceCaptainId,
                  wicketKeeperId,
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
            setActiveCareer(career);
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
        {isMatchPrepOpen && activeCareer && (
          <MatchPreparationModal
            career={activeCareer}
            allPlayers={PLAYERS_DATABASE}
            onUpdateCareer={handleUpdateCareer}
            onStartMatch={() => handleStartLiveMatch()}
            onOpenTactics={() => {
              setIsMatchPrepOpen(false);
              setCurrentView('TACTICAL_MANAGEMENT');
            }}
            onClose={() => setIsMatchPrepOpen(false)}
          />
        )}

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
      </div>
    </div>
  );
}
