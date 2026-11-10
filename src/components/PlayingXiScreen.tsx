/**
 * WICKET DYNASTY - Playing XI Screen (SCR_12)
 * Master Reference Screen 4 Replica: 2D Green Cricket Ground Formation,
 * 11 Tactical Player Avatars with (C) & (WK) badges, and Glowing Team Balance Bars
 */
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, Shield, AlertTriangle, Sparkles, RefreshCw, Trophy, UserCheck, ArrowRight, Eye, List } from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { Player } from '../types/player';

interface PlayingXiScreenProps {
  career: CareerSave;
  onConfirmPlayingXI: (
    playingXiIds: string[],
    captainId: string,
    viceCaptainId: string,
    wicketKeeperId: string
  ) => void;
  onBack: () => void;
}

export const PlayingXiScreen: React.FC<PlayingXiScreenProps> = ({
  career,
  onConfirmPlayingXI,
  onBack,
}) => {
  const franchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];
  const squadPlayers = useMemo(() => {
    return PLAYERS_DATABASE.filter(p => career.squadPlayerIds.includes(p.id));
  }, [career.squadPlayerIds]);

  const [activeTab, setActiveTab] = useState<'PLAYING_XI' | 'ROLES' | 'LIST'>('PLAYING_XI');

  // Initial Selected 11
  const [selectedXiIds, setSelectedXiIds] = useState<string[]>(() => {
    if (career.playingXiIds && career.playingXiIds.length === 11) {
      return career.playingXiIds;
    }
    const domestic = squadPlayers.filter(p => !p.isOverseas).sort((a, b) => b.overallRating - a.overallRating);
    const overseas = squadPlayers.filter(p => p.isOverseas).sort((a, b) => b.overallRating - a.overallRating);
    const pickedOvs = overseas.slice(0, 4);
    const pickedDom = domestic.slice(0, 11 - pickedOvs.length);
    return [...pickedDom, ...pickedOvs].slice(0, 11).map(p => p.id);
  });

  const [captainId, setCaptainId] = useState<string>(() => {
    if (career.captainId && selectedXiIds.includes(career.captainId)) return career.captainId;
    return selectedXiIds[0] || '';
  });

  const [viceCaptainId, setViceCaptainId] = useState<string>(() => {
    if (career.viceCaptainId && selectedXiIds.includes(career.viceCaptainId)) return career.viceCaptainId;
    return selectedXiIds[1] || '';
  });

  const [wicketKeeperId, setWicketKeeperId] = useState<string>(() => {
    const keeper = squadPlayers.find(p => selectedXiIds.includes(p.id) && p.isWicketkeeper);
    return keeper ? keeper.id : selectedXiIds[selectedXiIds.length - 1] || '';
  });

  const [slotToSwap, setSlotToSwap] = useState<number | null>(null);

  // Active XI objects
  const playingXi = selectedXiIds.map(id => squadPlayers.find(p => p.id === id)).filter((p): p is Player => p !== undefined);
  const benchPlayers = squadPlayers.filter(p => !selectedXiIds.includes(p.id));

  // Telemetry
  const overseasInXi = playingXi.filter(p => p.isOverseas).length;
  const bowlingOptionsInXi = playingXi.filter(
    p => p.primaryRole.includes('Bowler') || p.primaryRole.includes('All-rounder') || p.primaryRole.includes('Specialist')
  ).length;

  // Team Balance Scores (Screen 4 reference calculations)
  const battingBalance = Math.min(99, Math.round(
    playingXi.slice(0, 7).reduce((acc, p) => acc + (p.batting?.timing || p.overallRating), 0) / 7
  ));
  const bowlingBalance = Math.min(99, Math.round(
    playingXi.slice(4, 11).reduce((acc, p) => acc + (p.paceBowling?.speed || p.spinBowling?.turn || p.overallRating), 0) / 7
  ));
  const allroundBalance = Math.min(99, Math.round(
    playingXi.reduce((acc, p) => acc + (p.batting?.power || p.overallRating), 0) / 11
  ));
  const fieldingBalance = Math.min(99, Math.round(
    playingXi.reduce((acc, p) => acc + (p.fielding?.catching || 88), 0) / 11
  ));

  // Validation
  const errors: string[] = [];
  if (selectedXiIds.length !== 11) errors.push(`Must select exactly 11 players (currently ${selectedXiIds.length}).`);
  if (overseasInXi > 4) errors.push(`Overseas limit exceeded in XI (${overseasInXi} / max 4).`);
  if (bowlingOptionsInXi < 5) errors.push(`Need at least 5 bowling options in XI (currently ${bowlingOptionsInXi}).`);
  if (!captainId || !selectedXiIds.includes(captainId)) errors.push('Captain must be part of Playing XI.');
  if (!wicketKeeperId || !selectedXiIds.includes(wicketKeeperId)) errors.push('Designated Wicketkeeper must be in Playing XI.');

  // Auto-Select Best XI
  const handleAutoSelect = () => {
    const keepers = squadPlayers.filter(p => p.isWicketkeeper).sort((a, b) => b.overallRating - a.overallRating);
    const bestKeeper = keepers[0];

    const pool = squadPlayers.filter(p => p.id !== bestKeeper?.id);
    const domestic = pool.filter(p => !p.isOverseas).sort((a, b) => b.overallRating - a.overallRating);
    const overseas = pool.filter(p => p.isOverseas).sort((a, b) => b.overallRating - a.overallRating);

    const picked: Player[] = [];
    if (bestKeeper) picked.push(bestKeeper);

    const ovsAllowed = 4 - (bestKeeper?.isOverseas ? 1 : 0);
    const pickedOvs = overseas.slice(0, ovsAllowed);
    picked.push(...pickedOvs);

    const needed = 11 - picked.length;
    picked.push(...domestic.slice(0, needed));

    const finalIds = picked.slice(0, 11).map(p => p.id);
    setSelectedXiIds(finalIds);
    setWicketKeeperId(bestKeeper ? bestKeeper.id : finalIds[finalIds.length - 1]);
    setCaptainId(finalIds[0]);
    setViceCaptainId(finalIds[1]);
  };

  const handleSwapWithBench = (benchPlayer: Player) => {
    if (slotToSwap === null) return;
    const newXi = [...selectedXiIds];
    newXi[slotToSwap] = benchPlayer.id;
    setSelectedXiIds(newXi);
    setSlotToSwap(null);
  };

  const handleConfirm = () => {
    if (errors.length > 0) return;
    onConfirmPlayingXI(selectedXiIds, captainId, viceCaptainId, wicketKeeperId);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070D18] text-white select-none">
      {/* Top Header */}
      <div className="bg-[#0C1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Squad Management</h1>
            <p className="text-[10px] text-amber-400 font-medium">Match Lineup & Formation</p>
          </div>
        </div>

        <button
          onClick={handleAutoSelect}
          className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 flex items-center space-x-1"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Auto Best XI</span>
        </button>
      </div>

      {/* Segmented Tabs (Reference: Squad | Playing XI | Roles) */}
      <div className="bg-[#0F1A30] border-b border-slate-800 px-3 py-1.5 flex items-center space-x-1">
        <button
          onClick={() => setActiveTab('LIST')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LIST' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-slate-900/50 text-slate-400'
          }`}
        >
          Squad List
        </button>
        <button
          onClick={() => setActiveTab('PLAYING_XI')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PLAYING_XI' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-slate-900/50 text-slate-400'
          }`}
        >
          Playing XI (Pitch)
        </button>
        <button
          onClick={() => setActiveTab('ROLES')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ROLES' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-slate-900/50 text-slate-400'
          }`}
        >
          Roles (C/VC/WK)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* ======================= PITCH VIEW (Reference Screen 4) ======================= */}
        {activeTab === 'PLAYING_XI' && (
          <div className="space-y-3">
            {/* 2D Green Cricket Ground Field Container */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-600/40 shadow-[0_8px_24px_rgba(0,0,0,0.8)] cricket-lawn-pattern p-3 min-h-[360px] flex flex-col justify-between">
              {/* White Boundary Oval Ring */}
              <div className="absolute inset-2 border-2 border-dashed border-white/25 rounded-[38px] pointer-events-none" />

              {/* 30-Yard Infield Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border border-white/30 rounded-full pointer-events-none" />

              {/* Clay Pitch Strip in Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-40 bg-[#c2a26d] border border-amber-800/40 rounded-sm shadow-inner pointer-events-none flex flex-col justify-between py-1.5 items-center">
                <div className="w-8 h-0.5 bg-white/80" />
                <div className="w-5 h-1 bg-white/60" />
                <div className="w-8 h-0.5 bg-white/80" />
              </div>

              {/* Row 1: Top Order Batsmen (2 Openers) */}
              <div className="relative z-10 flex justify-center space-x-10 pt-2">
                {playingXi.slice(0, 2).map((player, idx) => {
                  const isCapt = player.id === captainId;
                  const isWk = player.id === wicketKeeperId;
                  const isSelected = slotToSwap === idx;

                  return (
                    <div
                      key={player.id}
                      onClick={() => setSlotToSwap(isSelected ? null : idx)}
                      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-xl ${
                          isSelected ? 'border-amber-400 bg-amber-500/80 text-slate-950' : 'border-white/80 bg-slate-900/90 text-white'
                        }`}>
                          {player.shortName.charAt(0)}
                        </div>
                        {isCapt && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                            C
                          </span>
                        )}
                        {isWk && (
                          <span className="absolute -bottom-1 -right-1 px-1 rounded bg-purple-500 text-white font-black text-[8px] shadow">
                            WK
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5 text-center truncate max-w-[85px]">
                        {player.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Middle Order & All-Rounders (4 Players) */}
              <div className="relative z-10 flex justify-around px-1 py-3">
                {playingXi.slice(2, 6).map((player, idx) => {
                  const realIdx = idx + 2;
                  const isCapt = player.id === captainId;
                  const isWk = player.id === wicketKeeperId;
                  const isSelected = slotToSwap === realIdx;

                  return (
                    <div
                      key={player.id}
                      onClick={() => setSlotToSwap(isSelected ? null : realIdx)}
                      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-xl ${
                          isSelected ? 'border-amber-400 bg-amber-500/80 text-slate-950' : 'border-white/80 bg-slate-900/90 text-white'
                        }`}>
                          {player.shortName.charAt(0)}
                        </div>
                        {isCapt && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                            C
                          </span>
                        )}
                        {isWk && (
                          <span className="absolute -bottom-1 -right-1 px-1 rounded bg-purple-500 text-white font-black text-[8px] shadow">
                            WK
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5 text-center truncate max-w-[70px]">
                        {player.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Row 3: Wicketkeeper / Finisher (1 Player) */}
              <div className="relative z-10 flex justify-center py-1">
                {playingXi[6] && (() => {
                  const player = playingXi[6];
                  const isCapt = player.id === captainId;
                  const isWk = player.id === wicketKeeperId;
                  const isSelected = slotToSwap === 6;

                  return (
                    <div
                      onClick={() => setSlotToSwap(isSelected ? null : 6)}
                      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-xl ${
                          isSelected ? 'border-amber-400 bg-amber-500/80 text-slate-950' : 'border-white/80 bg-slate-900/90 text-white'
                        }`}>
                          {player.shortName.charAt(0)}
                        </div>
                        {isWk && (
                          <span className="absolute -top-1 -right-1 px-1 rounded bg-purple-500 text-white font-black text-[8px] shadow">
                            WK
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5 text-center truncate max-w-[80px]">
                        {player.shortName} {isWk ? '(WK)' : ''}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Row 4: Bowling Attack (4 Specialist Bowlers) */}
              <div className="relative z-10 flex justify-between px-2 pb-2">
                {playingXi.slice(7, 11).map((player, idx) => {
                  const realIdx = idx + 7;
                  const isCapt = player.id === captainId;
                  const isSelected = slotToSwap === realIdx;

                  return (
                    <div
                      key={player.id}
                      onClick={() => setSlotToSwap(isSelected ? null : realIdx)}
                      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-xl ${
                          isSelected ? 'border-amber-400 bg-amber-500/80 text-slate-950' : 'border-white/80 bg-slate-900/90 text-white'
                        }`}>
                          {player.shortName.charAt(0)}
                        </div>
                        {isCapt && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                            C
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5 text-center truncate max-w-[65px]">
                        {player.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Swap Prompt if node tapped */}
            {slotToSwap !== null && (
              <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3 animate-in fade-in space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">
                    Substitute Slot #{slotToSwap + 1} ({playingXi[slotToSwap]?.name})
                  </span>
                  <button
                    onClick={() => setSlotToSwap(null)}
                    className="text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {benchPlayers.map(bp => (
                    <button
                      key={bp.id}
                      onClick={() => handleSwapWithBench(bp)}
                      className="px-3 py-1.5 rounded-xl bg-[#121E36] hover:bg-[#1A2846] border border-slate-700 text-left shrink-0 text-xs flex items-center space-x-2"
                    >
                      <span className="font-bold text-white">{bp.shortName}</span>
                      <span className="text-[10px] text-amber-400 font-mono">({bp.overallRating})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Team Balance Card (Exact Reference Screen 4 Replica) */}
            <div className="card-game-3d rounded-2xl p-4 space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Team Balance
              </h3>
              
              <div className="space-y-2 text-xs">
                {/* Batting */}
                <div className="flex items-center justify-between">
                  <span className="w-20 text-slate-400 font-medium text-[11px]">Batting</span>
                  <div className="flex-1 mx-3 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      style={{ width: `${battingBalance}%` }}
                    />
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs w-6 text-right">
                    {battingBalance}
                  </span>
                </div>

                {/* Bowling */}
                <div className="flex items-center justify-between">
                  <span className="w-20 text-slate-400 font-medium text-[11px]">Bowling</span>
                  <div className="flex-1 mx-3 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      style={{ width: `${bowlingBalance}%` }}
                    />
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs w-6 text-right">
                    {bowlingBalance}
                  </span>
                </div>

                {/* All-round */}
                <div className="flex items-center justify-between">
                  <span className="w-20 text-slate-400 font-medium text-[11px]">All-round</span>
                  <div className="flex-1 mx-3 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      style={{ width: `${allroundBalance}%` }}
                    />
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs w-6 text-right">
                    {allroundBalance}
                  </span>
                </div>

                {/* Fielding */}
                <div className="flex items-center justify-between">
                  <span className="w-20 text-slate-400 font-medium text-[11px]">Fielding</span>
                  <div className="flex-1 mx-3 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      style={{ width: `${fieldingBalance}%` }}
                    />
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs w-6 text-right">
                    {fieldingBalance}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= LIST & ROLES VIEW ======================= */}
        {(activeTab === 'LIST' || activeTab === 'ROLES') && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
              Lineup Order (1 to 11)
            </span>
            {playingXi.map((player, idx) => {
              const isCapt = player.id === captainId;
              const isVice = player.id === viceCaptainId;
              const isWk = player.id === wicketKeeperId;

              return (
                <div
                  key={player.id}
                  className="card-game-3d rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-950 font-mono text-xs font-bold text-amber-400 flex items-center justify-center border border-slate-800">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white">{player.name}</h4>
                      <span className="text-[10px] text-slate-400">{player.primaryRole} · {player.battingHand}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCaptainId(player.id)}
                      className={`px-2 py-0.5 text-[10px] font-black rounded border transition-colors ${
                        isCapt ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      C
                    </button>
                    <button
                      onClick={() => setViceCaptainId(player.id)}
                      className={`px-2 py-0.5 text-[10px] font-black rounded border transition-colors ${
                        isVice ? 'bg-blue-400 text-slate-950 border-blue-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      VC
                    </button>
                    <button
                      onClick={() => setWicketKeeperId(player.id)}
                      className={`px-2 py-0.5 text-[10px] font-black rounded border transition-colors ${
                        isWk ? 'bg-purple-400 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      WK
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-1">
            {errors.map((err, idx) => (
              <p key={idx}>• {err}</p>
            ))}
          </div>
        )}
      </div>

      {/* Footer Confirm 3D Button */}
      <div className="p-3 bg-[#080E1A] border-t border-[#1E2D4A]">
        <button
          onClick={handleConfirm}
          disabled={errors.length > 0}
          className={`w-full py-3.5 px-4 rounded-2xl btn-game-gold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 ${
            errors.length > 0 ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98] cursor-pointer'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Confirm Playing XI Lineup</span>
        </button>
      </div>
    </div>
  );
};
