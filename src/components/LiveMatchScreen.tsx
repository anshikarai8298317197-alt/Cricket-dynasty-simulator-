/**
 * WICKET DYNASTY - Live 2D Match Presentation (Phase 05 Master Redesign)
 * 100% Manager-Only Live Presentation matching Reference Image 1 & Modules 3, 4, 5, 6:
 * - Dynamic Delivery-by-Delivery Live Engine (NO pre-decided score or winner)
 * - 5 Distinct Scorecard States: Scheduled, Live 1st Inn, Innings Break, Live 2nd Inn, Completed
 * - Live Scorecard hides future deliveries, hides 2nd innings until started, and reconciles perfectly
 * - Difficulty, Form, Stamina, Matchups, Pitch, and Tactics directly influence each ball outcome
 * - Exactly TWO Batter Cards (Striker & Non-Striker with live stats)
 * - Thin Bowler Strip (Overs-Maidens-Runs-Wickets, Style, Stamina, Economy)
 * - 6-Ball Over Timeline
 * - Large 2D Cricket Ground with white glowing ball and franchise jersey colors
 * - Bottom Bar: Play/Pause, Tactics, Full Scorecard, Speed controls
 */
import React, { useState, useEffect, useRef } from 'react';
import { MatchResultDetails, BallEvent, InningsScorecard } from '../types/match';
import { Pitch2DView } from './Pitch2DView';
import { AudioManager } from '../services/audioManager';
import { FRANCHISES } from '../data/franchises';
import { getGlobalTeamById } from '../data/globalLeagues';
import { FranchiseLogo } from './FranchiseLogo';
import {
  LiveMatchSession,
  MatchSessionStatus,
  MatchSimulationConfig,
  LiveTacticsInput,
} from '../services/cricketMatchEngine';
import { DbPersistence } from '../services/dbPersistence';
import {
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  Swords,
  ChevronRight,
  Shield,
  Flame,
  Award,
  ArrowLeft,
  FileText,
  Sliders,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { BattingAggressionLevel, FieldingPresetType } from '../types/tactics';

interface LiveMatchScreenProps {
  careerId?: string;
  matchConfig?: MatchSimulationConfig;
  matchResult?: MatchResultDetails;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  userFranchiseId?: string;
  onMatchComplete: (result: MatchResultDetails) => void;
  onExit: () => void;
}

type TacticsTab = 'TACTICS' | 'COMMENTARY';
type TacticsMode = 'SIMPLE' | 'ADVANCED';
type BatterApproach = 'Defend' | 'Build' | 'Attack' | 'Slog' | 'Assistant Choice';
type BowlingDirective = 'Yorker / Full' | 'Hard Good Length' | 'Bouncer / Short' | 'Slow / Cutters';

export const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({
  careerId,
  matchConfig,
  matchResult,
  difficulty = 'MEDIUM',
  userFranchiseId,
  onMatchComplete,
  onExit,
}) => {
  // Initialize or Re-hydrate Authoritative Live Match Session
  const sessionRef = useRef<LiveMatchSession | null>(null);
  const initialSavedStateRef = useRef(DbPersistence.getActiveLiveMatch());

  if (!sessionRef.current) {
    const savedDeliveryState = initialSavedStateRef.current;
    if (matchConfig) {
      const fullConfig = {
        ...matchConfig,
        difficulty,
        userFranchiseId,
      };

      if (
        savedDeliveryState &&
        savedDeliveryState.matchId === matchConfig.matchId &&
        savedDeliveryState.status !== 'COMPLETED'
      ) {
        sessionRef.current = LiveMatchSession.hydrateFromState(fullConfig, savedDeliveryState);
      } else {
        sessionRef.current = new LiveMatchSession(fullConfig);
      }
    } else if (matchResult) {
      const dummyConfig: MatchSimulationConfig = {
        matchId: matchResult.matchId,
        fixtureId: matchResult.fixtureId,
        homeFranchiseId: matchResult.homeFranchiseId,
        awayFranchiseId: matchResult.awayFranchiseId,
        homePlayingXi: [],
        awayPlayingXi: [],
      };
      const completedSession = new LiveMatchSession({
        ...dummyConfig,
        difficulty,
        userFranchiseId,
      });
      completedSession.status = 'COMPLETED';
      completedSession.completedResultDetails = matchResult;
      completedSession.winnerFranchiseId = matchResult.winnerFranchiseId;
      completedSession.loserFranchiseId = matchResult.loserFranchiseId;
      completedSession.marginDescription = matchResult.marginDescription;
      sessionRef.current = completedSession;
    }
  }

  const session = sessionRef.current!;
  const matchedSaved =
    initialSavedStateRef.current && initialSavedStateRef.current.matchId === session.matchId
      ? initialSavedStateRef.current
      : null;

  // Reactive UI State
  const [matchStatus, setMatchStatus] = useState<MatchSessionStatus>(session.status);
  const [currentBall, setCurrentBall] = useState<BallEvent | null>(() => {
    if (matchedSaved?.currentDelivery) return matchedSaved.currentDelivery as BallEvent;
    const activeInn = session.currentInningsNumber === 1 ? session.innings1 : session.innings2;
    return activeInn?.allBalls?.[activeInn.allBalls.length - 1] || null;
  });
  const [isPlaying, setIsPlaying] = useState(() => !matchResult && session.status !== 'COMPLETED');
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(2);
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [isTacticsOpen, setIsTacticsOpen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [scorecardActiveInnings, setScorecardActiveInnings] = useState<1 | 2>(session.currentInningsNumber);

  // Tactics States
  const [tacticsTab, setTacticsTab] = useState<TacticsTab>('TACTICS');
  const [tacticsMode, setTacticsMode] = useState<TacticsMode>('SIMPLE');
  const [liveAggression, setLiveAggression] = useState<BattingAggressionLevel>(
    () => matchedSaved?.tactics?.battingAggression || 'Balanced'
  );
  const [liveFielding, setLiveFielding] = useState<FieldingPresetType>(
    () => matchedSaved?.tactics?.fieldingPreset || 'Balanced Standard T20'
  );
  const [strikerApproach, setStrikerApproach] = useState<BatterApproach>(
    () => matchedSaved?.tactics?.strikerApproach || 'Attack'
  );
  const [bowlingDirective, setBowlingDirective] = useState<BowlingDirective>(
    () => matchedSaved?.tactics?.bowlingDirective || 'Hard Good Length'
  );
  const [ringPressure, setRingPressure] = useState<'Packed Ring' | 'Boundary Patrol' | 'Balanced'>(
    () => matchedSaved?.tactics?.ringPressure || 'Balanced'
  );

  // Impact Player substitution
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
  const [impactUsed, setImpactUsed] = useState<boolean>(() => Boolean(matchedSaved?.impactUsed));
  const [selectedSubPlayer, setSelectedSubPlayer] = useState<string | null>(() => matchedSaved?.selectedSubPlayer || null);

  const persistLiveMatchSnapshot = (latestBall: BallEvent | null = currentBall) => {
    if (matchResult || session.status === 'COMPLETED') {
      DbPersistence.clearLiveMatch();
      return;
    }
    DbPersistence.saveLiveMatchDelivery(
      session.serializeState({
        careerId,
        currentDelivery: latestBall,
        impactUsed,
        selectedSubPlayer,
        tactics: {
          battingAggression: liveAggression,
          fieldingPreset: liveFielding,
          strikerApproach,
          bowlingDirective,
          ringPressure,
        },
      })
    );
  };

  const persistSnapshotRef = useRef(persistLiveMatchSnapshot);
  persistSnapshotRef.current = persistLiveMatchSnapshot;

  // Ensure started match is immediately persisted even before ball 1 or on refresh/unload
  useEffect(() => {
    if (matchResult || session.status === 'COMPLETED') return;
    persistSnapshotRef.current();

    const handleBeforeUnload = () => {
      persistSnapshotRef.current();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [matchResult, session]);

  const homeFranchise = getGlobalTeamById(session.homeFranchiseId) || FRANCHISES.find(f => f.id === session.homeFranchiseId) || FRANCHISES[0];
  const awayFranchise = getGlobalTeamById(session.awayFranchiseId) || FRANCHISES.find(f => f.id === session.awayFranchiseId) || FRANCHISES[1];

  // Tick: Execute Delivery-by-Delivery Simulation
  useEffect(() => {
    if (!isPlaying) return;

    if (session.status === 'COMPLETED') {
      const timer = setTimeout(() => {
        onMatchComplete(session.completedResultDetails!);
      }, 1200);
      return () => clearTimeout(timer);
    }

    const intervalTime = Math.max(250, 1800 / playbackSpeed);

    const interval = setInterval(() => {
      if (!session.battingFirstXi.length || !session.bowlingFirstXi.length) {
        setIsPlaying(false);
        return;
      }

      const tacticsInput: LiveTacticsInput = {
        battingAggression: liveAggression as any,
        strikerApproach,
        bowlingDirective,
        ringPressure,
      };

      const ball = session.simulateNextDelivery(tacticsInput);
      if (ball) {
        setCurrentBall(ball);
        setMatchStatus(session.status);

        // Authoritative Auto-save after EVERY completed delivery (including RNG seedState & full state)
        if (session.status === 'COMPLETED') {
          DbPersistence.clearLiveMatch();
        } else {
          persistLiveMatchSnapshot(ball);
        }

        // Sound feedback
        if (ball.totalRuns === 6) AudioManager.playBoundarySix();
        else if (ball.totalRuns === 4) AudioManager.playBoundaryFour();
        else if (ball.isWicket) AudioManager.playWicket();
        else if (ball.totalRuns > 0) AudioManager.playBatCrack();
        else AudioManager.playBallBounce();
      } else if (session.status === 'COMPLETED' && session.completedResultDetails) {
        DbPersistence.clearLiveMatch();
        setMatchStatus('COMPLETED');
        setIsPlaying(false);
        onMatchComplete(session.completedResultDetails);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    playbackSpeed,
    liveAggression,
    liveFielding,
    strikerApproach,
    bowlingDirective,
    ringPressure,
    impactUsed,
    selectedSubPlayer,
    onMatchComplete,
  ]);

  // Audio mute toggle
  const toggleAudio = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    AudioManager.setMuted(nextMuted);
  };

  // Instant finish / fast forward to completion
  const handleInstantFinish = () => {
    setIsPlaying(false);
    const finalResult = session.fastForwardToEnd();
    DbPersistence.clearLiveMatch();
    setMatchStatus('COMPLETED');
    const lastBall = finalResult.innings2.allBalls.slice(-1)[0] || finalResult.innings1.allBalls.slice(-1)[0];
    if (lastBall) setCurrentBall(lastBall);
    onMatchComplete(finalResult);
  };

  // Current active innings details
  const activeInningsNum = session.currentInningsNumber;
  const currentInningsState = activeInningsNum === 1 ? session.innings1 : session.innings2 || session.innings1;
  const battingTeamId = currentInningsState.battingFranchiseId;
  const bowlingTeamId = currentInningsState.bowlingFranchiseId;
  const battingFranchise = getGlobalTeamById(battingTeamId) || FRANCHISES.find(f => f.id === battingTeamId) || homeFranchise;
  const bowlingFranchise = getGlobalTeamById(bowlingTeamId) || FRANCHISES.find(f => f.id === bowlingTeamId) || awayFranchise;

  // Compute live current run rate
  const liveLegalBalls = currentInningsState.legalBallsFaced;
  const liveCrr = liveLegalBalls > 0
    ? ((currentInningsState.totalRuns) / (liveLegalBalls / 6)).toFixed(2)
    : '0.00';

  // Over timeline balls
  const currentOverBalls = currentInningsState.currentOverBalls;

  // Striker & Non-Striker details
  const striker = currentBall
    ? {
        name: currentBall.strikerName,
        number: currentBall.strikerNumber || 1,
        hand: currentBall.strikerHand || 'Right Hand',
        runs: currentBall.strikerRuns,
        balls: currentBall.strikerBalls,
        fours: currentBall.strikerFours || 0,
        sixes: currentBall.strikerSixes || 0,
        sr: currentBall.strikerBalls > 0
          ? ((currentBall.strikerRuns / currentBall.strikerBalls) * 100).toFixed(1)
          : '0.0',
      }
    : {
        name: currentInningsState.batters[0]?.playerName || 'Opener 1',
        number: 1,
        hand: 'Right Hand',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        sr: '0.0',
      };

  const nonStriker = currentBall
    ? {
        name: currentBall.nonStrikerName,
        number: currentBall.nonStrikerNumber || 2,
        hand: currentBall.nonStrikerHand || 'Right Hand',
        runs: currentBall.nonStrikerRuns,
        balls: currentBall.nonStrikerBalls,
        fours: currentBall.nonStrikerFours || 0,
        sixes: currentBall.nonStrikerSixes || 0,
        sr: currentBall.nonStrikerBalls > 0
          ? ((currentBall.nonStrikerRuns / currentBall.nonStrikerBalls) * 100).toFixed(1)
          : '0.0',
      }
    : {
        name: currentInningsState.batters[1]?.playerName || 'Opener 2',
        number: 2,
        hand: 'Right Hand',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        sr: '0.0',
      };

  // Bowler details
  const bowler = currentBall
    ? {
        name: currentBall.bowlerName,
        style: currentBall.bowlerStyle || 'RFM',
        stamina: currentBall.bowlerStamina ?? 85,
        overs: currentBall.bowlerOversDisplay || '0.0',
        maidens: currentBall.bowlerMaidens || 0,
        runsConceded: currentBall.bowlerRunsConceded || 0,
        wickets: currentBall.bowlerWickets || 0,
        economy: currentBall.bowlerEconomy?.toFixed(1) || '0.0',
      }
    : {
        name: currentInningsState.currentBowler?.name || 'Bowler',
        style: 'RFM',
        stamina: 100,
        overs: '0.0',
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        economy: '0.0',
      };

  // Ball event trajectory for 2D field
  const ballTrajectory = currentBall?.trajectory
    ? {
        ...currentBall.trajectory,
        shotType: currentBall.trajectory.shotType as any,
      }
    : undefined;

  // Live Scorecard snapshot (reveals ONLY what has been completed so far!)
  const liveScorecard = session.getLiveScorecardState();
  const scInnings = scorecardActiveInnings === 1 ? liveScorecard.innings1 : liveScorecard.innings2;

  return (
    <div className="flex flex-col h-screen w-full bg-[#070D19] text-white select-none overflow-hidden max-w-md mx-auto relative font-sans">
      {/* ================= COMPACT TOP HEADER (Reference Image 1) ================= */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0A1224]/95 border-b border-slate-800/80 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              persistLiveMatchSnapshot();
              onExit();
            }}
            className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1.5">
            <FranchiseLogo franchiseId={homeFranchise.id} size="sm" />
            <span className="text-xs font-black text-slate-200">{homeFranchise.shortName}</span>
            <span className="text-[10px] text-slate-500 font-bold">vs</span>
            <span className="text-xs font-black text-slate-200">{awayFranchise.shortName}</span>
            <FranchiseLogo franchiseId={awayFranchise.id} size="sm" />
          </div>
        </div>

        {/* 2D View & Venue Tag */}
        <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-[9px] font-bold text-amber-400">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>2D BROADCAST</span>
        </div>

        {/* Audio, Speeds & Simulation Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleAudio}
            className="p-1 rounded bg-slate-900 text-slate-300 hover:text-white"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Speed Pills: 1x, 2x, 4x */}
          <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800 text-[10px] font-bold">
            {([1, 2, 4] as const).map(spd => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  playbackSpeed === spd
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Pause / Play */}
          <button
            onClick={() => {
              const nextPlaying = !isPlaying;
              if (!nextPlaying) persistLiveMatchSnapshot();
              setIsPlaying(nextPlaying);
            }}
            className="p-1 rounded bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Instant Auto Finish */}
          <button
            onClick={handleInstantFinish}
            className="px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 border border-blue-500 text-[10px] font-bold text-blue-200 transition-colors"
          >
            Auto
          </button>
        </div>
      </div>

      {/* ================= TEAM SCOREBOARD (Reference Image 1) ================= */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-[#0C1527] via-[#0E1A33] to-[#0C1527] border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <FranchiseLogo franchiseId={battingFranchise.id} size="md" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-black text-white tracking-wide">
                {battingFranchise.shortName}
              </span>
              <span className="text-xl font-black text-amber-400 font-mono tracking-tight">
                {currentInningsState.totalRuns}/{currentInningsState.totalWickets}
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">
                ({currentInningsState.oversDisplay} ov)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center space-x-2">
              <span>CRR: <strong className="text-slate-200">{liveCrr}</strong></span>
              {session.target ? (
                <span>
                  Target: <strong className="text-amber-400">{session.target}</strong> (Req:{' '}
                  <strong className="text-slate-200 font-mono">
                    {Math.max(0, session.target - currentInningsState.totalRuns)}
                  </strong>{' '}
                  from{' '}
                  <strong className="text-slate-200 font-mono">
                    {Math.max(0, 120 - liveLegalBalls)}
                  </strong>{' '}
                  b)
                </span>
              ) : (
                <span>1st Innings · 20 Overs Max</span>
              )}
            </div>
          </div>
        </div>

        {/* Match State Badge */}
        <div className="text-right">
          <span
            className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
              matchStatus === 'COMPLETED'
                ? 'bg-emerald-500 text-slate-950'
                : matchStatus === 'INNINGS_BREAK'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}
          >
            {matchStatus === 'COMPLETED'
              ? 'MATCH OVER'
              : matchStatus === 'INNINGS_BREAK'
              ? 'INNINGS BREAK'
              : `LIVE · INN ${activeInningsNum}`}
          </span>
          <span className="block text-[9px] text-slate-400 mt-0.5 truncate max-w-[120px]">
            {session.venue.split(',')[0]}
          </span>
        </div>
      </div>

      {/* ================= TWO BATTER CARDS (STRIKER & NON-STRIKER) ================= */}
      <div className="grid grid-cols-2 gap-2 px-3 py-1.5 bg-[#091122]/90 border-b border-slate-800/80 shrink-0">
        {/* Striker Card (Highlighted with active badge) */}
        <div className="bg-[#101B33] border-2 border-amber-400/80 rounded-xl p-2 relative shadow-md">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-black text-white truncate max-w-[100px]">
                {striker.name}
              </span>
            </div>
            <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/30">
              STRIKER
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-base font-black text-amber-400 font-mono leading-none">
              {striker.runs}{' '}
              <span className="text-[11px] text-slate-400 font-normal">({striker.balls})</span>
            </div>
            <div className="text-[10px] text-slate-400 space-x-1.5 font-mono">
              <span>4s: <strong className="text-slate-200">{striker.fours}</strong></span>
              <span>6s: <strong className="text-slate-200">{striker.sixes}</strong></span>
              <span>SR: <strong className="text-slate-200">{striker.sr}</strong></span>
            </div>
          </div>
        </div>

        {/* Non-Striker Card */}
        <div className="bg-[#0B1426] border border-slate-800 rounded-xl p-2 relative">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-bold text-slate-300 truncate max-w-[110px]">
              {nonStriker.name}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Non-Striker</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-base font-black text-slate-200 font-mono leading-none">
              {nonStriker.runs}{' '}
              <span className="text-[11px] text-slate-500 font-normal">({nonStriker.balls})</span>
            </div>
            <div className="text-[10px] text-slate-400 space-x-1.5 font-mono">
              <span>4s: <strong className="text-slate-300">{nonStriker.fours}</strong></span>
              <span>6s: <strong className="text-slate-300">{nonStriker.sixes}</strong></span>
              <span>SR: <strong className="text-slate-300">{nonStriker.sr}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= THIN BOWLER STRIP (Reference Image 1) ================= */}
      <div className="px-3 py-1 bg-[#070D1A] border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Bowler:</span>
          <span className="font-bold text-white text-xs">{bowler.name}</span>
          <span className="px-1 py-0.2 rounded bg-slate-800 text-[9px] font-mono text-cyan-300">
            {bowler.style}
          </span>
          {/* Live Stamina Bar */}
          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1 hidden sm:block">
            <div
              className={`h-full rounded-full ${
                bowler.stamina > 70 ? 'bg-emerald-400' : bowler.stamina > 40 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${bowler.stamina}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-300">
          <span>{bowler.overs}-{bowler.maidens}-{bowler.runsConceded}-{bowler.wickets}</span>
          <span className="text-slate-500">|</span>
          <span className="text-[10px] text-slate-400">Econ: <strong className="text-slate-200">{bowler.economy}</strong></span>
        </div>
      </div>

      {/* ================= 6-BALL OVER TIMELINE ================= */}
      <div className="px-3 py-1 bg-[#0A1222] border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Over {currentInningsState.currentOverNumber + 1}
        </span>
        <div className="flex items-center space-x-1.5">
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const ball = currentOverBalls[idx];
            let label = '-';
            let bgClass = 'bg-slate-900 border-slate-800 text-slate-600';

            if (ball) {
              if (ball.isWicket) {
                label = 'W';
                bgClass = 'bg-red-600 border-red-500 text-white font-black animate-bounce';
              } else if (ball.extrasType === 'WIDE') {
                label = 'wd';
                bgClass = 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold';
              } else if (ball.extrasType === 'NO_BALL') {
                label = 'nb';
                bgClass = 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold';
              } else if (ball.totalRuns === 6) {
                label = '6';
                bgClass = 'bg-purple-600 border-purple-400 text-white font-black';
              } else if (ball.totalRuns === 4) {
                label = '4';
                bgClass = 'bg-amber-500 border-amber-400 text-slate-950 font-black';
              } else if (ball.totalRuns === 0) {
                label = '•';
                bgClass = 'bg-slate-800 border-slate-700 text-slate-400';
              } else {
                label = String(ball.totalRuns);
                bgClass = 'bg-blue-600/30 border-blue-500/50 text-blue-200 font-bold';
              }
            }

            return (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono transition-transform ${bgClass}`}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= LARGE 2D CRICKET GROUND ================= */}
      <div className="flex-1 min-h-0 relative bg-emerald-950 overflow-hidden flex items-center justify-center">
        <Pitch2DView
          currentBall={currentBall}
          fieldingPreset={liveFielding}
          isSimulating={isPlaying}
          bowlerName={bowler.name}
          strikerName={striker.name}
          bowlingFranchiseColor={bowlingFranchise.primaryColor}
          battingFranchiseColor={battingFranchise.primaryColor}
        />

        {/* Live Delivery Commentary Floating Strip */}
        <div className="absolute bottom-2 left-2 right-2 z-20">
          <div className="bg-[#0A1224]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl flex items-center space-x-2">
            <span className="font-mono text-amber-400 text-xs font-bold shrink-0">
              {currentBall ? currentBall.ballDisplay : `${currentInningsState.oversDisplay}`}
            </span>
            <p className="text-[11px] text-slate-200 font-medium truncate flex-1 leading-snug">
              {currentBall?.commentary || 'Bowler marks their run-up at the top of the mark...'}
            </p>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM MATCH CONTROL BAR (Reference Image 1) ================= */}
      <div className="bg-[#0A1224] border-t border-slate-800 px-3 py-2 flex items-center justify-between z-30 shrink-0">
        {/* Play/Pause Button */}
        <button
          onClick={() => {
            const nextPlaying = !isPlaying;
            if (!nextPlaying) persistLiveMatchSnapshot();
            setIsPlaying(nextPlaying);
          }}
          className={`flex-1 py-2 px-2 rounded-xl font-black text-xs uppercase flex items-center justify-center space-x-1.5 mr-1.5 transition-all ${
            isPlaying
              ? 'bg-slate-900 border border-slate-700 text-slate-300'
              : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        {/* Tactics Button */}
        <button
          onClick={() => setIsTacticsOpen(true)}
          className="flex-1 py-2 px-2 rounded-xl bg-[#121E36] hover:bg-[#182949] border border-amber-500/40 text-amber-400 font-black text-xs uppercase flex items-center justify-center space-x-1.5 mr-1.5 shadow"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>TACTICS</span>
        </button>

        {/* Full Scorecard Button */}
        <button
          onClick={() => {
            setScorecardActiveInnings(session.currentInningsNumber);
            setIsScorecardOpen(true);
          }}
          className="flex-1 py-2 px-2 rounded-xl bg-[#121E36] hover:bg-[#182949] border border-blue-500/40 text-blue-300 font-black text-xs uppercase flex items-center justify-center space-x-1.5 mr-1.5 shadow"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>SCORECARD</span>
        </button>

        {/* Speed Quick Selector */}
        <button
          onClick={() => {
            if (playbackSpeed === 1) setPlaybackSpeed(2);
            else if (playbackSpeed === 2) setPlaybackSpeed(4);
            else setPlaybackSpeed(1);
          }}
          className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-black text-xs uppercase flex items-center space-x-1"
        >
          <FastForward className="w-3.5 h-3.5 text-amber-400" />
          <span>{playbackSpeed}x</span>
        </button>
      </div>

      {/* ================= FULL INTERACTIVE SCORECARD MODAL (Module 3 Fixes) ================= */}
      {isScorecardOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0C1527] border-2 border-amber-500/70 rounded-3xl p-5 space-y-3.5 max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Live Match Scorecard
                </span>
              </div>
              <button
                onClick={() => setIsScorecardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Innings Tabs with Status Awareness */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setScorecardActiveInnings(1)}
                className={`py-1.5 rounded-lg font-bold text-center transition-all ${
                  scorecardActiveInnings === 1
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1st Inn: {session.innings1.battingFranchiseId} ({session.innings1.totalRuns}/{session.innings1.totalWickets})
              </button>

              <button
                disabled={!session.innings2 && session.status !== 'INNINGS_BREAK' && session.status !== 'COMPLETED'}
                onClick={() => session.innings2 && setScorecardActiveInnings(2)}
                className={`py-1.5 rounded-lg font-bold text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  scorecardActiveInnings === 2
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {session.innings2 ? (
                  `2nd Inn: ${session.innings2.battingFranchiseId} (${session.innings2.totalRuns}/${session.innings2.totalWickets})`
                ) : session.target ? (
                  `2nd Inn: Target ${session.target}`
                ) : (
                  '2nd Inn: Yet to Start'
                )}
              </button>
            </div>

            {/* Scorecard Table Content */}
            {scInnings ? (
              <div className="overflow-y-auto space-y-3 text-xs pr-1 divide-y divide-slate-800/80">
                {/* Batting Table */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase py-1 border-b border-slate-800">
                    <span>Batter</span>
                    <div className="flex space-x-3 font-mono">
                      <span className="w-6 text-right">R</span>
                      <span className="w-6 text-right">B</span>
                      <span className="w-5 text-right">4s</span>
                      <span className="w-5 text-right">6s</span>
                      <span className="w-10 text-right">SR</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800/40">
                    {scInnings.batters.map((b, idx) => {
                      const activeInningsStateObj = scorecardActiveInnings === 1 ? session.innings1 : session.innings2;
                      const hasBatted = idx < (activeInningsStateObj?.nextBatterIdx || 2);
                      const isAtCrease = !b.isOut && hasBatted;

                      return (
                        <div key={b.playerId} className="py-1.5 flex justify-between items-center text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white block truncate">
                              {b.playerName} {isAtCrease ? '*' : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {hasBatted
                                ? b.isOut
                                  ? b.dismissalSummary || 'Out'
                                  : 'not out'
                                : 'Yet to Bat'}
                            </span>
                          </div>
                          <div className="flex space-x-3 font-mono text-slate-300 shrink-0">
                            <span className="w-6 text-right font-bold text-amber-400">
                              {hasBatted ? b.runs : '-'}
                            </span>
                            <span className="w-6 text-right">{hasBatted ? b.balls : '-'}</span>
                            <span className="w-5 text-right text-slate-400">{hasBatted ? b.fours : '-'}</span>
                            <span className="w-5 text-right text-slate-400">{hasBatted ? b.sixes : '-'}</span>
                            <span className="w-10 text-right text-slate-300">
                              {hasBatted ? b.strikeRate.toFixed(1) : '-'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bowling Table */}
                <div className="pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase py-1 border-b border-slate-800">
                    <span>Bowler</span>
                    <div className="flex space-x-3 font-mono">
                      <span className="w-8 text-right">O</span>
                      <span className="w-5 text-right">M</span>
                      <span className="w-6 text-right">R</span>
                      <span className="w-5 text-right">W</span>
                      <span className="w-10 text-right">Econ</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-800/40">
                    {scInnings.bowlers.length === 0 ? (
                      <div className="py-2 text-center text-slate-500 text-[11px]">
                        No overs bowled yet in this innings.
                      </div>
                    ) : (
                      scInnings.bowlers.map(bw => (
                        <div key={bw.playerId} className="py-1.5 flex justify-between items-center text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-white block truncate">{bw.playerName}</span>
                            <span className="text-[10px] text-slate-400">{bw.bowlingRole}</span>
                          </div>
                          <div className="flex space-x-3 font-mono text-slate-300 shrink-0">
                            <span className="w-8 text-right">{bw.oversDisplay}</span>
                            <span className="w-5 text-right">{bw.maidens}</span>
                            <span className="w-6 text-right">{bw.runsConceded}</span>
                            <span className="w-5 text-right font-bold text-blue-400">{bw.wickets}</span>
                            <span className="w-10 text-right text-slate-300">{bw.economy.toFixed(1)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Fall of Wickets */}
                {scInnings.fallOfWickets.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Fall of Wickets
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scInnings.fallOfWickets.map(fow => (
                        <span
                          key={fow.wicketNumber}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {fow.score}/{fow.wicketNumber} ({fow.playerDismissedName}, {fow.oversDisplay})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Innings has not yet commenced.
              </div>
            )}

            {/* If completed -> show Final Winner announcement */}
            {session.status === 'COMPLETED' && session.completedResultDetails && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/40 text-center space-y-1">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  🏆 {session.marginDescription}
                </span>
                <span className="text-[11px] text-slate-300 block">
                  Player of the Match: <strong>{session.completedResultDetails.playerOfTheMatch.playerName}</strong> ({session.completedResultDetails.playerOfTheMatch.performanceSummary})
                </span>
              </div>
            )}

            <button
              onClick={() => setIsScorecardOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
            >
              Close Scorecard
            </button>
          </div>
        </div>
      )}

      {/* ================= IN-MATCH TACTICS & DIRECTIVES DRAWER ================= */}
      {isTacticsOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0F1A30] border-2 border-amber-500/50 rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTacticsTab('TACTICS')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    tacticsTab === 'TACTICS'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Tactics Panel
                </button>
                <button
                  onClick={() => setTacticsTab('COMMENTARY')}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    tacticsTab === 'COMMENTARY'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Commentary Stream
                </button>
              </div>

              <button
                onClick={() => setIsTacticsOpen(false)}
                className="text-xs text-slate-400 hover:text-white font-bold p-1"
              >
                Close ✕
              </button>
            </div>

            {tacticsTab === 'TACTICS' && (
              <div className="overflow-y-auto space-y-4 text-xs pr-1">
                {/* Mode Selector */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTacticsMode('SIMPLE')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                      tacticsMode === 'SIMPLE' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    Simple Mode
                  </button>
                  <button
                    onClick={() => setTacticsMode('ADVANCED')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                      tacticsMode === 'ADVANCED' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    Advanced Mode
                  </button>
                </div>

                {tacticsMode === 'SIMPLE' ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
                        Batting Aggression Directive
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {(['Defensive', 'Balanced', 'Very Aggressive'] as BattingAggressionLevel[]).map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setLiveAggression(lvl)}
                            className={`py-2 rounded-xl border text-center font-bold text-[11px] ${
                              liveAggression === lvl
                                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
                        Field Placement Strategy
                      </label>
                      <select
                        value={liveFielding}
                        onChange={e => setLiveFielding(e.target.value as FieldingPresetType)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="Balanced Standard T20">Balanced Standard T20</option>
                        <option value="Attacking Slips & Ring">Attacking Slips & Ring</option>
                        <option value="Defensive Boundary Patrol">Defensive Boundary Patrol</option>
                        <option value="Death-over Pocket Prevent">Death-over Pocket Prevent</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
                        Individual Striker Approach ({striker.name})
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {(['Defend', 'Build', 'Attack', 'Slog', 'Assistant Choice'] as BatterApproach[]).map(app => (
                          <button
                            key={app}
                            onClick={() => setStrikerApproach(app)}
                            className={`py-1.5 px-2 rounded-xl border text-center font-bold ${
                              strikerApproach === app
                                ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
                        Bowling Line & Length Target
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {(['Yorker / Full', 'Hard Good Length', 'Bouncer / Short', 'Slow / Cutters'] as BowlingDirective[]).map(d => (
                          <button
                            key={d}
                            onClick={() => setBowlingDirective(d)}
                            className={`py-2 px-2 rounded-xl border text-center font-bold ${
                              bowlingDirective === d
                                ? 'bg-blue-500 text-white border-blue-400 font-black'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
                        Field Ring Pressure
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {(['Packed Ring', 'Boundary Patrol', 'Balanced'] as const).map(p => (
                          <button
                            key={p}
                            onClick={() => setRingPressure(p)}
                            className={`py-1.5 rounded-xl border text-center font-bold ${
                              ringPressure === p
                                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Impact Player Substitution */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Impact Player Substitution</span>
                    <span className="text-[10px] text-slate-400">
                      {impactUsed ? `Active: ${selectedSubPlayer}` : '1 Substitution Available'}
                    </span>
                  </div>
                  <button
                    disabled={impactUsed}
                    onClick={() => setIsImpactModalOpen(true)}
                    className="py-1.5 px-3 rounded-xl bg-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase"
                  >
                    {impactUsed ? 'Used' : 'Substitute'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    persistLiveMatchSnapshot();
                    setIsTacticsOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider"
                >
                  Apply Tactical Directives Immediately
                </button>
              </div>
            )}

            {tacticsTab === 'COMMENTARY' && (
              <div className="overflow-y-auto space-y-2 max-h-[50vh] pr-1 divide-y divide-slate-800">
                {currentInningsState.allBalls.slice().reverse().map((b, idx) => (
                  <div key={idx} className="pt-2 text-xs flex items-start space-x-2">
                    <span className="font-mono text-amber-400 font-bold shrink-0">{b.ballDisplay}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 font-medium leading-relaxed">{b.commentary}</p>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {b.bowlerName} to {b.strikerName}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        b.isWicket
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : b.totalRuns >= 4
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {b.isWicket ? 'WKT' : `${b.totalRuns}r`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Impact Player Modal */}
      {isImpactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#0F1A30] border-2 border-amber-500/80 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Select Impact Player Substitute
            </h3>
            <p className="text-xs text-slate-300">
              Substitute any active player on the field with a specialist from the dugout bench.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {['R. Shepherd (All-Rounder)', 'S. Gopal (Leg Spinner)', 'A. Raghuvanshi (Top Order Batter)', 'M. Sharma (Death Bowler)'].map(name => (
                <button
                  key={name}
                  onClick={() => {
                    setImpactUsed(true);
                    setSelectedSubPlayer(name);
                    setIsImpactModalOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex justify-between items-center"
                >
                  <span>{name}</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsImpactModalOpen(false)}
              className="w-full py-2 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
