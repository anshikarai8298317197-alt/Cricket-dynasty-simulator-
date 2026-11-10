/**
 * WICKET DYNASTY - Player Retention & Release Screen (SCR_09)
 * Manage franchise retentions, cost deductions, and RTM card allocation
 */
import React, { useState } from 'react';
import { ArrowLeft, Check, X, Shield, Wallet, AlertCircle, Info, ChevronRight, RotateCcw } from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { Player } from '../types/player';

interface RetentionScreenProps {
  career: CareerSave;
  onConfirmRetentions: (retainedIds: string[], remainingPurseCr: number) => void;
  onBack: () => void;
}

export const RetentionScreen: React.FC<RetentionScreenProps> = ({
  career,
  onConfirmRetentions,
  onBack,
}) => {
  const franchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];

  // Original squad pool belonging to this franchise
  const originalSquad = PLAYERS_DATABASE.filter(p => p.originalFranchiseId === franchise.id);

  // Initial selected retentions (defaulting to previous or empty)
  const [retainedPlayerIds, setRetainedPlayerIds] = useState<string[]>(
    career.squadPlayerIds.length > 0 ? career.squadPlayerIds : []
  );

  // Standard retention price deduction brackets
  const RETENTION_BRACKETS = [18.0, 14.0, 11.0, 18.0, 14.0]; // Cr

  // Calculate total deduction based on count of retentions
  const totalDeductionCr = retainedPlayerIds.reduce((sum, _, index) => {
    return sum + (RETENTION_BRACKETS[index] || 10.0);
  }, 0);

  const remainingPurseCr = Math.max(0, Number((franchise.startingPurseCr - totalDeductionCr).toFixed(2)));
  const rtmCards = retainedPlayerIds.length >= 5 ? 1 : 2;

  const togglePlayer = (player: Player) => {
    if (retainedPlayerIds.includes(player.id)) {
      setRetainedPlayerIds(retainedPlayerIds.filter(id => id !== player.id));
    } else {
      if (retainedPlayerIds.length >= 5) {
        return; // Max 5 retentions allowed
      }
      setRetainedPlayerIds([...retainedPlayerIds, player.id]);
    }
  };

  const handleConfirm = () => {
    onConfirmRetentions(retainedPlayerIds, remainingPurseCr);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0C1425] text-white">
      {/* Retention Header Tracker */}
      <div className="p-3.5 bg-[#121E36] border-b border-[#1E2D4A] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              PRE-AUCTION RETENTIONS
            </span>
            <h2 className="text-base font-bold text-white">{franchise.name} Squad</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Auction Purse Remaining</span>
            <span className="font-mono text-base font-black text-emerald-400">
              ₹{remainingPurseCr.toFixed(1)} Cr
            </span>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-[#080E1A] border border-[#1E2D4A]">
            <span className="text-[10px] text-slate-400 block">Retentions</span>
            <span className="font-mono font-bold text-amber-400">
              {retainedPlayerIds.length} <span className="text-slate-500">/ 5 MAX</span>
            </span>
          </div>
          <div className="p-2 rounded-lg bg-[#080E1A] border border-[#1E2D4A]">
            <span className="text-[10px] text-slate-400 block">Purse Deducted</span>
            <span className="font-mono font-bold text-red-400">
              -₹{totalDeductionCr.toFixed(1)} Cr
            </span>
          </div>
          <div className="p-2 rounded-lg bg-[#080E1A] border border-[#1E2D4A]">
            <span className="text-[10px] text-slate-400 block">RTM Cards Awarded</span>
            <span className="font-mono font-bold text-blue-400">
              {rtmCards} Cards
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 bg-[#080E1A] p-2 rounded border border-[#1E2D4A]/50 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Released players enter the open auction pool. You can use your {rtmCards} RTM cards to match rival winning bids.
          </span>
        </p>
      </div>

      {/* Original Players List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Select Players to Retain (Tap to toggle)
        </h3>

        {originalSquad.map(player => {
          const isRetained = retainedPlayerIds.includes(player.id);
          const retentionIndex = retainedPlayerIds.indexOf(player.id);
          const deductionCost = isRetained ? RETENTION_BRACKETS[retentionIndex] : null;

          return (
            <div
              key={player.id}
              onClick={() => togglePlayer(player)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isRetained
                  ? 'bg-[#121E36] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-[#0E182D] border-[#1E2D4A] hover:border-slate-500 opacity-80'
              }`}
            >
              {/* Player Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs text-white shrink-0"
                  style={{
                    backgroundColor: `${franchise.primaryColor}30`,
                    borderColor: franchise.primaryColor,
                  }}
                >
                  {player.shortName.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white truncate">{player.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 px-1 rounded bg-[#080E1A]">
                      {player.nationality}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {player.primaryRole} · {player.age} yrs
                  </p>
                  {isRetained && (
                    <span className="text-[10px] font-bold text-amber-400 mt-0.5 block">
                      Retention Slot #{retentionIndex + 1} (-₹{deductionCost} Cr)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button & OVR */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-[#080E1A] text-amber-400 border border-[#F59E0B]/30 block">
                    {player.overallRating} OVR
                  </span>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    isRetained
                      ? 'border-[#F59E0B] bg-[#F59E0B] text-slate-950 font-bold'
                      : 'border-[#1E2D4A] bg-[#080E1A] text-slate-500'
                  }`}
                >
                  {isRetained ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs">+</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Bottom Bar */}
      <div className="p-4 bg-[#080E1A] border-t border-[#1E2D4A] flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-[#121E36] hover:bg-[#1A2846] border border-[#1E2D4A] font-bold text-xs uppercase tracking-wider text-slate-300"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-bold text-xs uppercase tracking-wider text-slate-950 shadow-md active:scale-[0.98]"
        >
          Confirm {retainedPlayerIds.length} Retentions
        </button>
      </div>
    </div>
  );
};
