/**
 * WICKET DYNASTY - Tactical Management & Strategy Screen (SCR_14)
 * Phase 03 Architecture
 */
import React, { useState } from 'react';
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import {
  BattingAggressionLevel,
  BattingStrategyType,
  BowlingAggressionLevel,
  FieldingPresetType,
  BattingTacticsConfig,
  BowlingTacticsConfig,
  FieldingTacticsConfig,
  MatchupDossier,
} from '../types/tactics';
import { TacticsEngine } from '../services/tacticsEngine';
import {
  ArrowLeft,
  Swords,
  Shield,
  Zap,
  Flame,
  Target,
  Users,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Sliders,
  Eye,
  Crosshair,
} from 'lucide-react';

interface TacticalManagementScreenProps {
  career: CareerSave;
  allPlayers: Player[];
  onUpdateCareer: (updated: CareerSave) => void;
  onBack: () => void;
}

type TabType = 'MATCH_PLAN' | 'BATTING' | 'BOWLING' | 'FIELDING' | 'MATCHUPS';

export const TacticalManagementScreen: React.FC<TacticalManagementScreenProps> = ({
  career,
  allPlayers,
  onUpdateCareer,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('MATCH_PLAN');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Load existing tactics or defaults
  const playingXiIds = career.playingXiIds && career.playingXiIds.length === 11
    ? career.playingXiIds
    : career.squadPlayerIds.slice(0, 11);

  const squadPlayers = career.squadPlayerIds.map(id => {
    const base = allPlayers.find(p => p.id === id);
    const override = career.careerPlayerOverrides?.[id];
    if (!base) return null as any;
    return override ? { ...base, ...override } : base;
  }).filter(Boolean);

  const [battingTactics, setBattingTactics] = useState<BattingTacticsConfig>(
    career.tactics?.batting || TacticsEngine.generateDefaultBattingTactics(playingXiIds)
  );

  const [bowlingTactics, setBowlingTactics] = useState<BowlingTacticsConfig>(
    career.tactics?.bowling || TacticsEngine.generateDefaultBowlingTactics(playingXiIds, squadPlayers)
  );

  const [fieldingTactics, setFieldingTactics] = useState<FieldingTacticsConfig>(
    career.tactics?.fielding || TacticsEngine.generateDefaultFieldingTactics()
  );

  // Match Plan high-level strategy state (hydrated from saved career tactics if present)
  const [overallStrategy, setOverallStrategy] = useState<'Attack' | 'Balanced' | 'Defend'>(() => {
    const saved = career.tactics?.overallStrategy;
    if (saved === 'Attack' || saved === 'Aggressive' || saved === 'Pace Attack') return 'Attack';
    if (saved === 'Defend' || saved === 'Defensive') return 'Defend';
    return 'Balanced';
  });
  const [battingApproach, setBattingApproach] = useState<string>(
    () => career.tactics?.matchPlan?.battingApproach || 'Aggressive with Freedom'
  );
  const [bowlingPlan, setBowlingPlan] = useState<string>(
    () => career.tactics?.matchPlan?.bowlingPlan || 'Mix with Death Overs Focus'
  );
  const [fieldingStrategyPreset, setFieldingStrategyPreset] = useState<string>(
    () => career.tactics?.matchPlan?.fieldingStrategy || 'Standard (T20)'
  );
  const [keyFocus, setKeyFocus] = useState({
    powerplay: career.tactics?.matchPlan?.powerplayFocus ?? true,
    middleOvers: career.tactics?.matchPlan?.middleOversFocus ?? true,
    deathOvers: career.tactics?.matchPlan?.deathOversFocus ?? true,
  });

  const buildUpdatedTacticsCareer = (
    nextBatting = battingTactics,
    nextBowling = bowlingTactics,
    nextFielding = fieldingTactics,
    nextOverall = overallStrategy,
    nextPlan = {
      battingApproach,
      bowlingPlan,
      fieldingStrategy: fieldingStrategyPreset,
      powerplayFocus: keyFocus.powerplay,
      middleOversFocus: keyFocus.middleOvers,
      deathOversFocus: keyFocus.deathOvers,
    }
  ): CareerSave => ({
    ...career,
    tactics: {
      batting: nextBatting,
      bowling: nextBowling,
      fielding: nextFielding,
      overallStrategy: nextOverall,
      matchPlan: nextPlan,
    },
    lastPlayedAt: Date.now(),
  });

  // Reorder Batting Lineup
  const handleMoveBattingOrder = (index: number, direction: 'UP' | 'DOWN') => {
    const currentOrder = [...battingTactics.battingOrderIds];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;

    const nextBat = {
      ...battingTactics,
      battingOrderIds: currentOrder,
    };
    setBattingTactics(nextBat);
    onUpdateCareer(buildUpdatedTacticsCareer(nextBat));
  };

  // Save changes to career
  const handleSaveTactics = () => {
    onUpdateCareer(buildUpdatedTacticsCareer());
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const xiPlayersInOrder: Player[] = battingTactics.battingOrderIds
    .map(id => squadPlayers.find(p => p.id === id))
    .filter((p): p is Player => p !== undefined);

  // Matchups generation for the XI
  const bowlerCandidates = xiPlayersInOrder.filter(
    p => p.primaryRole.includes('Bowler') || p.primaryRole.includes('All-rounder')
  );

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100 flex flex-col font-sans pb-20">
      {/* Toast */}
      {showSavedToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-black px-4 py-2.5 rounded-full shadow-2xl text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>Tactics & Match Strategy Locked Successfully!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-[#0C1527]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              onUpdateCareer(buildUpdatedTacticsCareer());
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-wide uppercase flex items-center space-x-2">
              <span>Tactics & Strategy</span>
            </h1>
            <p className="text-[11px] text-amber-400/90 font-medium">
              100% Manager Direction • Autonomous Player Execution
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveTactics}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Save Plan</span>
        </button>
      </div>

      {/* Top Navigation Tabs */}
      <div className="bg-[#0F1A30] border-b border-slate-800 px-3 py-2 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'MATCH_PLAN', label: 'Match Plan' },
          { id: 'BATTING', label: 'Batting' },
          { id: 'BOWLING', label: 'Bowling' },
          { id: 'FIELDING', label: 'Field' },
          { id: 'MATCHUPS', label: 'Matchups' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="p-4 max-w-3xl mx-auto w-full space-y-4">
        {/* ==================== TAB 1: MATCH PLAN (Reference Screen Replica) ==================== */}
        {activeTab === 'MATCH_PLAN' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Match Strategy Radio Cards */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Match Strategy
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Attack */}
                <button
                  type="button"
                  onClick={() => {
                    const nextBat = { ...battingTactics, macroAggression: 'Very Aggressive' as const };
                    const nextBowl = { ...bowlingTactics, macroAggression: 'Attacking Stumps & Slips' as const };
                    setOverallStrategy('Attack');
                    setBattingTactics(nextBat);
                    setBowlingTactics(nextBowl);
                    onUpdateCareer(buildUpdatedTacticsCareer(nextBat, nextBowl, fieldingTactics, 'Attack'));
                  }}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    overallStrategy === 'Attack'
                      ? 'bg-red-500/20 border-red-500 text-white shadow-lg ring-1 ring-red-500/50'
                      : 'bg-[#0F1A30] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-2">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase">Attack</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">High Risk, Max Boundary</span>
                </button>

                {/* Balanced */}
                <button
                  type="button"
                  onClick={() => {
                    const nextBat = { ...battingTactics, macroAggression: 'Balanced' as const };
                    const nextBowl = { ...bowlingTactics, macroAggression: 'Balanced Line & Length' as const };
                    setOverallStrategy('Balanced');
                    setBattingTactics(nextBat);
                    setBowlingTactics(nextBowl);
                    onUpdateCareer(buildUpdatedTacticsCareer(nextBat, nextBowl, fieldingTactics, 'Balanced'));
                  }}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    overallStrategy === 'Balanced'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50'
                      : 'bg-[#0F1A30] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase">Balanced</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Adaptive Strike Rate</span>
                </button>

                {/* Defend */}
                <button
                  type="button"
                  onClick={() => {
                    const nextBat = { ...battingTactics, macroAggression: 'Defensive' as const };
                    const nextBowl = { ...bowlingTactics, macroAggression: 'Containment / Defensive' as const };
                    setOverallStrategy('Defend');
                    setBattingTactics(nextBat);
                    setBowlingTactics(nextBowl);
                    onUpdateCareer(buildUpdatedTacticsCareer(nextBat, nextBowl, fieldingTactics, 'Defend'));
                  }}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    overallStrategy === 'Defend'
                      ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg ring-1 ring-blue-500/50'
                      : 'bg-[#0F1A30] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-2">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase">Defend</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Preserve Wickets</span>
                </button>
              </div>
            </div>

            {/* Batting Approach */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Batting Approach
              </label>
              <select
                value={battingApproach}
                onChange={e => setBattingApproach(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Aggressive with Freedom">Aggressive with Freedom (Clear the ropes)</option>
                <option value="Calculated Anchor & Accelerate">Calculated Anchor & Accelerate (Build base)</option>
                <option value="Steady Strike Rotation">Steady Strike Rotation (Manoeuvre gaps)</option>
                <option value="Conservative Wicket Preservation">Conservative Wicket Preservation (Bat 20 overs)</option>
              </select>
            </div>

            {/* Bowling Plan */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Bowling Plan
              </label>
              <select
                value={bowlingPlan}
                onChange={e => setBowlingPlan(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Mix with Death Overs Focus">Mix with Death Overs Focus (Save 5 overs for death)</option>
                <option value="All-Out Wicket Taking Pace Attack">All-Out Wicket Taking Pace Attack (Attack stumps)</option>
                <option value="Stump-to-Stump Spin Stranglehold">Stump-to-Stump Spin Stranglehold (Middle strangle)</option>
                <option value="Defensive Boundary Containment">Defensive Boundary Containment (Deep sweepers)</option>
              </select>
            </div>

            {/* Fielding Strategy */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Fielding Strategy
              </label>
              <select
                value={fieldingStrategyPreset}
                onChange={e => setFieldingStrategyPreset(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Standard (T20)">Standard (T20)</option>
                <option value="Attacking Slips & Close Catchers">Attacking Slips & Close Catchers</option>
                <option value="Deep Boundary Patrol">Deep Boundary Patrol</option>
                <option value="Death-Overs Ring Protection">Death-Overs Ring Protection</option>
              </select>
            </div>

            {/* Key Focus Checkboxes (Matching Reference) */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Key Focus Areas
              </span>
              <div className="space-y-2.5">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keyFocus.powerplay}
                    onChange={e => setKeyFocus({ ...keyFocus, powerplay: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-200 font-medium">Powerplay Advantage (Maximise 1-6 overs fielding restrictions)</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keyFocus.middleOvers}
                    onChange={e => setKeyFocus({ ...keyFocus, middleOvers: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-200 font-medium">Middle Overs Control (Strike rotation & spin strangulation)</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keyFocus.deathOvers}
                    onChange={e => setKeyFocus({ ...keyFocus, deathOvers: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-200 font-medium">Death Overs Execution (Pinpoint yorkers & maximum boundary strikes)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: BATTING ==================== */}
        {activeTab === 'BATTING' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Batting Order List with Reorder Controls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Batting Order (1 - 11)
                </label>
                <span className="text-[11px] text-amber-400 font-medium">Use ▲ / ▼ to adjust positions</span>
              </div>

              <div className="space-y-2">
                {xiPlayersInOrder.map((player, idx) => (
                  <div
                    key={player.id}
                    className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{player.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {idx < 2 ? 'OPENER' : idx < 4 ? 'TOP-ORDER' : idx < 7 ? 'MIDDLE' : 'TAIL'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {player.battingHand || 'N/A'} • {player.primaryRole} • Bat OVR {player.overallRating}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveBattingOrder(idx, 'UP')}
                        disabled={idx === 0}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          idx === 0 ? 'text-slate-700' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveBattingOrder(idx, 'DOWN')}
                        disabled={idx === xiPlayersInOrder.length - 1}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          idx === xiPlayersInOrder.length - 1 ? 'text-slate-700' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Instructions */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Phase-Specific Batting Instructions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Powerplay (1-6)</span>
                  <select
                    value={battingTactics.powerplayApproach}
                    onChange={e => setBattingTactics({ ...battingTactics, powerplayApproach: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="High Risk Boundaries">High Risk Boundaries</option>
                    <option value="Balanced Rotation">Balanced Rotation</option>
                    <option value="Cautious Consolidation">Cautious Consolidation</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Middle (7-15)</span>
                  <select
                    value={battingTactics.middleOversApproach}
                    onChange={e => setBattingTactics({ ...battingTactics, middleOversApproach: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="Strike Rotation">Strike Rotation</option>
                    <option value="Target Weaker Bowlers">Target Weaker Bowlers</option>
                    <option value="Conserve Wickets">Conserve Wickets</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Death (16-20)</span>
                  <select
                    value={battingTactics.deathOversApproach}
                    onChange={e => setBattingTactics({ ...battingTactics, deathOversApproach: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="All-Out Boundary Hitting">All-Out Boundary Hitting</option>
                    <option value="Calculated Acceleration">Calculated Acceleration</option>
                    <option value="Run Hard">Run Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: BOWLING ==================== */}
        {activeTab === 'BOWLING' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Opening Bowlers */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Opening Bowler Pair (Overs 1 & 2)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Opening Bowler 1</span>
                  <select
                    value={bowlingTactics.openingBowlerIds[0] || ''}
                    onChange={e => {
                      const updated = [...bowlingTactics.openingBowlerIds];
                      updated[0] = e.target.value;
                      setBowlingTactics({ ...bowlingTactics, openingBowlerIds: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  >
                    {bowlerCandidates.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Opening Bowler 2</span>
                  <select
                    value={bowlingTactics.openingBowlerIds[1] || ''}
                    onChange={e => {
                      const updated = [...bowlingTactics.openingBowlerIds];
                      updated[1] = e.target.value;
                      setBowlingTactics({ ...bowlingTactics, openingBowlerIds: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  >
                    {bowlerCandidates.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Death Overs Specialists */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                Death Overs Specialists (Overs 18 - 20)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Death Specialist 1</span>
                  <select
                    value={bowlingTactics.deathOversSpecialistIds[0] || ''}
                    onChange={e => {
                      const updated = [...bowlingTactics.deathOversSpecialistIds];
                      updated[0] = e.target.value;
                      setBowlingTactics({ ...bowlingTactics, deathOversSpecialistIds: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  >
                    {bowlerCandidates.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Death Specialist 2</span>
                  <select
                    value={bowlingTactics.deathOversSpecialistIds[1] || ''}
                    onChange={e => {
                      const updated = [...bowlingTactics.deathOversSpecialistIds];
                      updated[1] = e.target.value;
                      setBowlingTactics({ ...bowlingTactics, deathOversSpecialistIds: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white"
                  >
                    {bowlerCandidates.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bowling Aggression & Strict 4-over rule */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase text-slate-300 block">
                    Strict 4-Over T20 Limitation
                  </span>
                  <p className="text-[10px] text-slate-400">Ensures at least 5 distinct bowlers take the ball</p>
                </div>
                <input
                  type="checkbox"
                  checked={bowlingTactics.enforceFourOverLimit}
                  onChange={e => setBowlingTactics({ ...bowlingTactics, enforceFourOverLimit: e.target.checked })}
                  className="w-5 h-5 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: FIELDING ==================== */}
        {activeTab === 'FIELDING' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Fielding Presets */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Fielding Presets
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Attacking Slips & Ring', desc: '2 slips, 6 in inner ring, aggressive catchers' },
                  { id: 'Balanced Standard T20', desc: '1 slip, standard sweepers at deep cover & mid-wicket' },
                  { id: 'Defensive Boundary Patrol', desc: '5 outfield riders saving boundaries' },
                  { id: 'Death-over Pocket Prevent', desc: 'Deep backward point, long-on, long-off deep' },
                ].map(preset => {
                  const isSelected = fieldingTactics.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFieldingTactics({ ...fieldingTactics, preset: preset.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white'
                          : 'bg-[#0F1A30] border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">{preset.id}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slip Cordon Density */}
            <div className="bg-[#0F1A30] border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Slip Catchers in Cordon</span>
                <span className="text-xs font-black text-amber-400 font-mono">{fieldingTactics.slipCount} Slips</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={fieldingTactics.slipCount}
                onChange={e => setFieldingTactics({ ...fieldingTactics, slipCount: parseInt(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-900"
              />
            </div>
          </div>
        )}

        {/* ==================== TAB 5: MATCHUPS ==================== */}
        {activeTab === 'MATCHUPS' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div>
              <h3 className="text-sm font-black text-white uppercase">Head-to-Head Tactical Matchups</h3>
              <p className="text-[11px] text-slate-400">
                Batter strengths & vulnerabilities vs opposing bowler archetypes
              </p>
            </div>

            <div className="space-y-2.5">
              {xiPlayersInOrder.slice(0, 6).map(batter => {
                const dummyBowler = bowlerCandidates[0] || squadPlayers[0];
                const dossier = TacticsEngine.generateMatchupDossier(batter, dummyBowler);

                return (
                  <div
                    key={batter.id}
                    className="bg-[#0F1A30] border border-slate-800 rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{batter.name}</span>
                        <span className="text-[10px] text-slate-400 block">{batter.battingHand || 'N/A'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Target: {dossier.recommendedBowlerType}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-center text-[10px]">
                      <div className="bg-slate-900/80 p-1.5 rounded">
                        <span className="text-slate-400 block">vs Pace</span>
                        <span className="font-bold text-slate-200">{dossier.vsPaceRating}</span>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded">
                        <span className="text-slate-400 block">vs Spin</span>
                        <span className="font-bold text-slate-200">{dossier.vsSpinRating}</span>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded">
                        <span className="text-slate-400 block">vs Left-Arm</span>
                        <span className="font-bold text-slate-200">{dossier.vsLeftArmRating}</span>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded">
                        <span className="text-slate-400 block">vs Right-Arm</span>
                        <span className="font-bold text-slate-200">{dossier.vsRightArmRating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0C1527]/95 backdrop-blur-md border-t border-slate-800 p-3 flex items-center justify-center">
        <button
          onClick={handleSaveTactics}
          className="w-full max-w-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-6 rounded-xl shadow-xl uppercase tracking-wider text-xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm & Lock Tactics for Next Match</span>
        </button>
      </div>
    </div>
  );
};
