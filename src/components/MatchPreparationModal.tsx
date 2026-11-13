/**
 * WICKET DYNASTY - Match Preparation & Match Day Manager Screen (SCR_18)
 * Phase 03 Architecture
 */
import React, { useState } from 'react';
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import { FRANCHISES } from '../data/franchises';
import { getGlobalTeamById, getGlobalTeamSquad } from '../data/globalLeagues';
import { MatchPreparationPlan } from '../types/tactics';
import { TacticsEngine } from '../services/tacticsEngine';
import { FranchiseLogo } from './FranchiseLogo';
import {
  ArrowLeft,
  Swords,
  CloudSun,
  ShieldAlert,
  CheckCircle2,
  Trophy,
  ChevronRight,
  Flame,
  Info,
  PlayCircle,
} from 'lucide-react';

interface MatchPreparationModalProps {
  career: CareerSave;
  allPlayers: Player[];
  hasSavedLiveMatch?: boolean;
  onUpdateCareer: (updated: CareerSave) => void;
  onOpenTactics: () => void;
  onStartMatch: () => void;
  onContinueMatch?: () => void;
  onClose: () => void;
}

export const MatchPreparationModal: React.FC<MatchPreparationModalProps> = ({
  career,
  allPlayers,
  hasSavedLiveMatch = false,
  onUpdateCareer,
  onOpenTactics,
  onStartMatch,
  onContinueMatch,
  onClose,
}) => {
  const currentFranchise = getGlobalTeamById(career.franchiseId) || FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];
  
  // Find upcoming fixture from active IPL tournament or Champions League
  const upcomingIplFixture = career.tournament?.fixtures?.find(
    (f: any) => !f.isCompleted && (f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId)
  );
  const upcomingGclFixture = !upcomingIplFixture
    ? career.worldSeason?.championsLeague?.fixtures?.find(
        (f: any) => !f.isCompleted && (f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId)
      )
    : undefined;
  const upcomingFixture = upcomingIplFixture || upcomingGclFixture;

  const opponentId = upcomingFixture
    ? upcomingFixture.homeFranchiseId === career.franchiseId
      ? upcomingFixture.awayFranchiseId
      : upcomingFixture.homeFranchiseId
    : FRANCHISES.find(f => f.id !== career.franchiseId)?.id || 'CSK';

  const opponentFranchise = getGlobalTeamById(opponentId) || FRANCHISES.find(f => f.id === opponentId) || FRANCHISES[1];

  const opponentSquad = getGlobalTeamSquad(opponentId, allPlayers);

  // Match preparation plan
  const [matchPlan, setMatchPlan] = useState<MatchPreparationPlan>(() => {
    if (career.matchPreparationPlan && career.matchPreparationPlan.opponentFranchiseId === opponentId) {
      return career.matchPreparationPlan;
    }
    return TacticsEngine.createDefaultMatchPrepPlan(
      upcomingFixture?.id || 'fix_01',
      opponentId,
      career.playingXiIds.length === 11 ? career.playingXiIds : career.squadPlayerIds.slice(0, 11),
      allPlayers.filter(p => career.squadPlayerIds.includes(p.id)),
      career.captainId || career.playingXiIds[0] || 'REAL_0001',
      career.viceCaptainId || career.playingXiIds[1] || 'REAL_0002',
      career.wicketKeeperId || career.playingXiIds[2] || 'REAL_0003',
      opponentSquad
    );
  });

  const [tossStrategy, setTossStrategy] = useState<'Bat First' | 'Bowl First' | 'Auto'>(
    matchPlan.tossChoice || 'Bat First'
  );
  const [showConfirmSuccess, setShowConfirmSuccess] = useState(false);

  // Playing XI verification
  const playingXiPlayers = matchPlan.confirmedPlayingXiIds.map(id => allPlayers.find(p => p.id === id)).filter(Boolean) as Player[];
  const overseasCount = playingXiPlayers.filter(p => p.isOverseas).length;
  const isXiValid = playingXiPlayers.length === 11 && overseasCount <= 4;

  const handleConfirmPlan = () => {
    const updatedPlan: MatchPreparationPlan = {
      ...matchPlan,
      tossChoice: tossStrategy,
      isPlanConfirmed: true,
      confirmedAtTimestamp: Date.now(),
    };

    const updatedCareer: CareerSave = {
      ...career,
      matchPreparationPlan: updatedPlan,
      lastPlayedAt: Date.now(),
    };

    onUpdateCareer(updatedCareer);
    setShowConfirmSuccess(true);
  };

  const handleStartMatch = () => {
    const updatedPlan: MatchPreparationPlan = {
      ...matchPlan,
      tossChoice: tossStrategy,
      isPlanConfirmed: true,
      confirmedAtTimestamp: Date.now(),
    };

    const updatedCareer: CareerSave = {
      ...career,
      matchPreparationPlan: updatedPlan,
      lastPlayedAt: Date.now(),
    };

    onUpdateCareer(updatedCareer);
    onStartMatch();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#0F172A] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header (Reference: MATCH DAY MANAGER) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#141E33]">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {career.tournamentName || 'T20 League'} • Match Day
              </h2>
              <p className="text-[10px] text-amber-400 font-medium">Pre-Match Tactical Briefing</p>
            </div>
          </div>
          <span className="text-xs font-black text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            20 OVERS
          </span>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Team Matchup Banner (Reference Design) */}
          <div className="bg-gradient-to-r from-[#172545] via-[#0E1A33] to-[#172545] border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between text-center">
            {/* User Franchise */}
            <div className="flex flex-col items-center flex-1">
              <FranchiseLogo franchiseId={currentFranchise.id} size={48} className="mb-1.5 shadow-lg" />
              <span className="font-black text-white text-xs">{currentFranchise.shortName} (You)</span>
              <span className="text-[10px] text-slate-400">{currentFranchise.homeCity}</span>
            </div>

            {/* VS Crest */}
            <div className="px-3 flex flex-col items-center">
              <span className="text-sm font-black text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                VS
              </span>
            </div>

            {/* Opponent Franchise */}
            <div className="flex flex-col items-center flex-1">
              <FranchiseLogo franchiseId={opponentFranchise.id} size={48} className="mb-1.5 shadow-lg" />
              <span className="font-black text-white text-xs">{opponentFranchise.shortName}</span>
              <span className="text-[10px] text-slate-400">{opponentFranchise.homeCity}</span>
            </div>
          </div>

          {/* Match Conditions (Pitch, Weather, Overs) */}
          <div className="bg-[#121E36] border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Match Conditions
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Pitch</span>
                <span className="font-bold text-amber-400 text-xs">{matchPlan.pitchCondition}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Weather</span>
                <span className="font-bold text-slate-200 text-xs">{matchPlan.weatherCondition}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Overs</span>
                <span className="font-bold text-slate-200 text-xs">20 per side</span>
              </div>
            </div>
          </div>

          {/* Toss Strategy */}
          <div className="bg-[#121E36] border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Toss Strategy
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Bat First', 'Bowl First', 'Auto'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTossStrategy(option)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    tossStrategy === option
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-black'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Final Strategy Summary Card */}
          <div className="bg-[#121E36] border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Final Strategy
              </span>
              <span className="text-xs font-black text-white flex items-center space-x-1.5 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{matchPlan.battingTactics.macroAggression} • {matchPlan.battingTactics.strategy}</span>
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenTactics();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              Edit Tactics
            </button>
          </div>

          {/* Opponent Scouting Brief */}
          <div className="bg-[#121E36] border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Opponent Intelligence ({opponentFranchise.shortName})
            </span>
            <div className="space-y-1.5">
              {matchPlan.opponentStrengths.map((str, i) => (
                <div key={i} className="text-[11px] text-amber-300 flex items-start space-x-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{str}</span>
                </div>
              ))}
              {matchPlan.opponentWeaknesses.map((weak, i) => (
                <div key={i} className="text-[11px] text-emerald-400 flex items-start space-x-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{weak}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 04 Simulation Notification */}
          {showConfirmSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 text-center space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
              <p className="text-xs font-black text-emerald-300">Match Tactical Dossier Verified & Confirmed!</p>
              <p className="text-[10px] text-slate-300">
                Squad directives locked for Phase 04 / Phase 05 match engine execution.
              </p>
            </div>
          )}
        </div>

        {/* Footer (Reference Design: MATCH DAY MANAGER -> Start Match) */}
        <div className="p-4 border-t border-slate-800 bg-[#141E33] space-y-2">
          <button
            onClick={hasSavedLiveMatch && onContinueMatch ? onContinueMatch : handleStartMatch}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 fill-current text-slate-950" />
            <span>{hasSavedLiveMatch ? 'Continue Match' : 'Start Match'}</span>
          </button>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <button
              onClick={onClose}
              className="px-2 py-1 text-slate-400 hover:text-white transition-colors"
            >
              Cancel / Back
            </button>
            <button
              onClick={handleConfirmPlan}
              className="px-2 py-1 text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Save Directives Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
