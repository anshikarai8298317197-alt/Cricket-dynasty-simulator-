/**
 * WICKET DYNASTY - New Career Screen (SCR_03)
 * Dark navy & gold configuration: Career Name, League, Squad Mode, 3-Tier Difficulty with stat bars,
 * Squad Training Mode (Auto/Manual), Franchise Regulations, and immediate Draft Autosave.
 */
import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Sparkles, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { SquadMode, DifficultyLevel, CareerRules } from '../types/career';
import { CareerDraftState, DbPersistence } from '../services/dbPersistence';

interface NewCareerScreenProps {
  onBack: () => void;
  initialDraft?: CareerDraftState | null;
  onProceedToFranchise: (config: {
    careerName: string;
    tournamentName: string;
    difficulty: DifficultyLevel;
    squadMode: SquadMode;
    trainingMode: 'Auto' | 'Manual';
    rules: CareerRules;
  }) => void;
}

const DIFFICULTY_META: {
  id: 'Easy' | 'Medium' | 'Hard';
  label: string;
  tag?: string;
  desc: string;
  gameplay: number;
  opposition: number;
  rewards: number;
}[] = [
  {
    id: 'Easy',
    label: 'Easy',
    desc: 'Forgiving match AI, generous purse & softer auction rivals.',
    gameplay: 35,
    opposition: 40,
    rewards: 65,
  },
  {
    id: 'Medium',
    label: 'Medium',
    tag: 'Recommended',
    desc: 'Authentic IPL auction wars, balanced tactical & injury curves.',
    gameplay: 65,
    opposition: 70,
    rewards: 85,
  },
  {
    id: 'Hard',
    label: 'Hard',
    desc: 'Cutthroat AI bidding, ruthless death bowling & strict form swings.',
    gameplay: 92,
    opposition: 95,
    rewards: 100,
  },
];

export const NewCareerScreen: React.FC<NewCareerScreenProps> = ({
  onBack,
  initialDraft,
  onProceedToFranchise,
}) => {
  const existingDraft = initialDraft || DbPersistence.getCareerDraft();

  const normalizeDiff = (d?: DifficultyLevel): 'Easy' | 'Medium' | 'Hard' => {
    if (d === 'Easy') return 'Easy';
    if (d === 'Hard' || d === 'Expert') return 'Hard';
    return 'Medium';
  };

  const [careerName, setCareerName] = useState(existingDraft?.careerName || 'Wicket Dynasty Career');
  const [tournamentName] = useState(existingDraft?.tournamentName || 'T20 Franchise League');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(normalizeDiff(existingDraft?.difficulty));
  const [squadMode, setSquadMode] = useState<SquadMode>(existingDraft?.squadMode || 'Auction Mode');
  const [trainingMode, setTrainingMode] = useState<'Auto' | 'Manual'>(existingDraft?.trainingMode || 'Auto');
  const [nameError, setNameError] = useState('');

  const [rules] = useState<CareerRules>({
    allowRtmCards: true,
    overseasLimitInXI: 4,
    squadSizeMin: 18,
    squadSizeMax: 25,
    salaryCapCr: 100.0,
    tradeWindowEnabled: true,
    injuryFrequency: 'Realistic',
  });

  // Immediate Draft Autosave on every form change
  useEffect(() => {
    DbPersistence.saveCareerDraft({
      id: existingDraft?.id || 'active_setup_draft',
      careerName: careerName.trim() || 'Wicket Dynasty Career',
      tournamentName,
      squadMode,
      difficulty,
      trainingMode,
      updatedAt: Date.now(),
    });
  }, [careerName, tournamentName, squadMode, difficulty, trainingMode]);

  const handleStart = () => {
    if (!careerName.trim()) {
      setNameError('Please enter a valid career name');
      return;
    }
    if (careerName.trim().length > 30) {
      setNameError('Career name must be under 30 characters');
      return;
    }
    setNameError('');
    onProceedToFranchise({
      careerName: careerName.trim(),
      tournamentName,
      difficulty,
      squadMode,
      trainingMode,
      rules,
    });
  };

  const activeDiffMeta = DIFFICULTY_META.find(d => d.id === difficulty) || DIFFICULTY_META[1];

  return (
    <div className="flex-1 flex flex-col bg-[#080E1A] text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Career Name Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
            Career Name
          </label>
          <input
            type="text"
            value={careerName}
            onChange={e => {
              setCareerName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="Enter career name..."
            className="w-full bg-[#101C34] border-2 border-[#1E2F52] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
          />
          {nameError && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{nameError}</span>
            </div>
          )}
        </div>

        {/* Tournament Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
            Tournament League
          </label>
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#101C34] to-[#142442] border border-[#243861] flex items-center justify-between shadow">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{tournamentName}</h4>
                <p className="text-[11px] text-slate-300 truncate">10 Franchises · 74 Matches · Page Playoffs</p>
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-400/30">
              Official
            </span>
          </div>
        </div>

        {/* Squad Mode Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
            Squad Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Auction Mode' as const, label: 'Auction', desc: 'Retain + Mega Auction' },
              { id: 'Real Squads Mode' as const, label: 'Real Squads', desc: '2026 IPL Rosters' },
              { id: 'Own Club Mode' as const, label: 'Own Club', desc: 'Custom Franchise' },
            ].map(m => {
              const selected = squadMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSquadMode(m.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all relative ${
                    selected
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300 text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                      : 'bg-[#101C34] border-[#1E2F52] text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black leading-tight">{m.label}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3] shrink-0" />}
                  </div>
                  <span className={`text-[10px] block mt-0.5 leading-tight ${selected ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Squad Training Mode (Auto / Manual) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
            Squad Training Control
          </label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'Auto' as const, label: 'Auto Training', desc: 'Coaches optimize workload & rest automatically' },
              { id: 'Manual' as const, label: 'Manual Control', desc: 'Full drill, intensity & physio management' },
            ]).map(tm => {
              const selected = trainingMode === tm.id;
              return (
                <button
                  key={tm.id}
                  onClick={() => setTrainingMode(tm.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? 'bg-[#162749] border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-[#101C34] border-[#1E2F52] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${selected ? 'text-amber-300' : 'text-slate-200'}`}>{tm.label}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{tm.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Tier Manager Difficulty with Dynamic Stat Bars */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
            Manager Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_META.map(d => {
              const selected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-2.5 rounded-xl border-2 text-center transition-all relative ${
                    selected
                      ? 'bg-[#17284B] border-[#F59E0B] text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.28)]'
                      : 'bg-[#101C34] border-[#1E2F52] text-slate-400 hover:text-white'
                  }`}
                >
                  {d.tag && (
                    <span className="block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 mb-1">
                      {d.tag}
                    </span>
                  )}
                  <span className="text-xs font-black block">{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Difficulty Detail & Stat Bars Card */}
          <div className="p-3 rounded-2xl bg-[#101C34] border border-[#243861] space-y-2.5">
            <p className="text-[11px] text-slate-300 leading-snug">{activeDiffMeta.desc}</p>
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between font-bold mb-0.5">
                  <span className="text-slate-400 uppercase">Gameplay Challenge</span>
                  <span className="text-amber-400 font-mono">{activeDiffMeta.gameplay}%</span>
                </div>
                <div className="h-1.5 bg-[#080E1A] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${activeDiffMeta.gameplay}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-0.5">
                  <span className="text-slate-400 uppercase">Opposition Growth</span>
                  <span className="text-blue-400 font-mono">{activeDiffMeta.opposition}%</span>
                </div>
                <div className="h-1.5 bg-[#080E1A] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${activeDiffMeta.opposition}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-0.5">
                  <span className="text-slate-400 uppercase">Dynasty Rewards</span>
                  <span className="text-emerald-400 font-mono">{activeDiffMeta.rewards}%</span>
                </div>
                <div className="h-1.5 bg-[#080E1A] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${activeDiffMeta.rewards}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Career Rules Card */}
        <div className="p-3.5 rounded-2xl bg-[#101C34] border border-[#1E2F52] space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Franchise Regulations</span>
            </h4>
            <span className="text-[10px] text-amber-400 font-black">OFFICIAL 2026</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/60">
              <span className="text-slate-400">Salary Purse Cap</span>
              <span className="font-mono font-bold text-emerald-400">₹100.0 Cr</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/60">
              <span className="text-slate-400">Playing XI Overseas Limit</span>
              <span className="font-mono font-bold text-white">Max 4 Players</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/60">
              <span className="text-slate-400">Squad Roster Size</span>
              <span className="font-mono font-bold text-white">18 - 25 Players</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Right-To-Match (RTM) Cards</span>
              <span className="font-bold text-emerald-400">Enabled (Up to 2)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA Footer */}
      <div className="p-4 bg-[#080E1A] border-t border-[#1E2D4A] flex gap-2.5">
        <button
          onClick={onBack}
          className="px-4 py-3.5 rounded-xl bg-[#101C34] border border-[#1E2F52] font-bold text-xs uppercase text-slate-300 hover:text-white active:scale-[0.98]"
        >
          Back
        </button>
        <button
          onClick={handleStart}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-transform"
        >
          <span>Pick Franchise</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
