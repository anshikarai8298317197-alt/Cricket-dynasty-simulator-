/**
 * WICKET DYNASTY - New Career Screen (SCR_03)
 * Tournament, difficulty, squad mode, and rule configuration
 */
import React, { useState } from 'react';
import { Trophy, Shield, Settings2, Sparkles, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { SquadMode, DifficultyLevel, CareerRules } from '../types/career';

interface NewCareerScreenProps {
  onBack: () => void;
  onProceedToFranchise: (config: {
    careerName: string;
    tournamentName: string;
    difficulty: DifficultyLevel;
    squadMode: SquadMode;
    rules: CareerRules;
  }) => void;
}

export const NewCareerScreen: React.FC<NewCareerScreenProps> = ({
  onBack,
  onProceedToFranchise,
}) => {
  const [careerName, setCareerName] = useState('Wicket Dynasty Career');
  const [tournamentName, setTournamentName] = useState('T20 Franchise League');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Normal');
  const [squadMode, setSquadMode] = useState<SquadMode>('Auction Mode');
  const [nameError, setNameError] = useState('');

  // Rules
  const [rules, setRules] = useState<CareerRules>({
    allowRtmCards: true,
    overseasLimitInXI: 4,
    squadSizeMin: 18,
    squadSizeMax: 25,
    salaryCapCr: 100.0,
    tradeWindowEnabled: true,
    injuryFrequency: 'Realistic',
  });

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
      rules,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0C1425] text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Career Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Career Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={careerName}
              onChange={e => {
                setCareerName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="Enter career name..."
              className="w-full bg-[#121E36] border border-[#1E2D4A] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
          {nameError && (
            <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{nameError}</span>
            </div>
          )}
        </div>

        {/* Tournament Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Tournament League
          </label>
          <div className="p-3.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{tournamentName}</h4>
                <p className="text-[11px] text-slate-400">10 Franchises · 74 Matches · Page Playoffs</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">
              Official
            </span>
          </div>
        </div>

        {/* Squad Mode Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Squad Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Auction Mode' as const, label: 'Auction', desc: 'Mega Auction Draft' },
              { id: 'Real Squads Mode' as const, label: 'Real Squads', desc: '2026 IPL Rosters' },
              { id: 'Own Club Mode' as const, label: 'Own Club', desc: 'Custom Franchise' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSquadMode(m.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  squadMode === m.id
                    ? 'bg-[#F59E0B] border-[#F59E0B] text-slate-950 shadow-md font-bold'
                    : 'bg-[#121E36] border-[#1E2D4A] text-slate-300 hover:text-white'
                }`}
              >
                <span className="block text-xs font-bold">{m.label}</span>
                <span className={`text-[10px] block mt-0.5 ${squadMode === m.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {m.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Manager Difficulty
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['Easy', 'Normal', 'Hard', 'Expert'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${
                  difficulty === d
                    ? 'bg-[#1A2846] border-[#F59E0B] text-amber-400 font-bold shadow'
                    : 'bg-[#121E36] border-[#1E2D4A] text-slate-400 hover:text-white text-xs'
                }`}
              >
                <span className="text-xs font-semibold">{d}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Career Rules Card */}
        <div className="p-3.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Franchise Regulations
            </h4>
            <span className="text-[10px] text-amber-400 font-bold">LOCKED RULES</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/50">
              <span className="text-slate-400">Salary Purse Cap</span>
              <span className="font-mono font-bold text-emerald-400">₹100.0 Cr</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/50">
              <span className="text-slate-400">Playing XI Overseas Limit</span>
              <span className="font-mono font-bold text-white">Max 4 Players</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/50">
              <span className="text-slate-400">Squad Roster Size</span>
              <span className="font-mono font-bold text-white">18 - 25 Players</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Right-To-Match (RTM) Cards</span>
              <span className="font-bold text-emerald-400">Enabled (2 per club)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA Footer */}
      <div className="p-4 bg-[#080E1A] border-t border-[#1E2D4A]">
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-transform"
        >
          <span>Pick Franchise</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
