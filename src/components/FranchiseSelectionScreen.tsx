/**
 * WICKET DYNASTY - Franchise Selection Screen (SCR_05)
 * 10 Official IPL Franchises with authentic identities and squad strengths
 */
import React, { useState } from 'react';
import { Trophy, MapPin, Shield, Check, Star, User, ChevronRight } from 'lucide-react';
import { FRANCHISES } from '../data/franchises';
import { Franchise } from '../types/franchise';
import { FranchiseLogo } from './FranchiseLogo';
import { DbPersistence } from '../services/dbPersistence';

interface FranchiseSelectionScreenProps {
  onBack: () => void;
  onSelectFranchise: (franchise: Franchise) => void;
}

export const FranchiseSelectionScreen: React.FC<FranchiseSelectionScreenProps> = ({
  onBack,
  onSelectFranchise,
}) => {
  const existingDraft = DbPersistence.getCareerDraft();
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(existingDraft?.franchiseId || 'RCB');

  const selectedFranchise = FRANCHISES.find(f => f.id === selectedFranchiseId) || FRANCHISES[0];

  const handleChooseFranchise = (id: string) => {
    setSelectedFranchiseId(id);
    if (existingDraft) {
      DbPersistence.saveCareerDraft({
        ...existingDraft,
        franchiseId: id,
        updatedAt: Date.now(),
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0C1425] text-white">
      {/* Subheader Instruction */}
      <div className="p-3 bg-[#121E36] border-b border-[#1E2D4A] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Select Your Franchise
          </h2>
          <p className="text-[11px] text-slate-400">
            Lead your chosen team to multi-season T20 glory
          </p>
        </div>
        <span className="font-mono text-xs px-2 py-1 rounded bg-[#080E1A] text-amber-400 border border-amber-500/30 font-bold">
          10 IPL TEAMS
        </span>
      </div>

      {/* Franchise List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {FRANCHISES.map(franchise => {
          const isSelected = franchise.id === selectedFranchiseId;

          return (
            <div
              key={franchise.id}
              onClick={() => handleChooseFranchise(franchise.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-[#121E36] border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.01]'
                  : 'bg-[#0E182D] border-[#1E2D4A] hover:border-slate-500'
              }`}
            >
              {/* Franchise Accent Header Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: franchise.primaryColor }}
              />

              <div className="flex items-start justify-between gap-3 mt-1">
                {/* Official Franchise Logo Crest & Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <FranchiseLogo franchiseId={franchise.id} size={48} className="rounded-2xl shadow-lg" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white truncate">{franchise.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{franchise.homeCity}</span>
                      <span>·</span>
                      <span className="text-slate-300">{franchise.homeStadium.split('(')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Trophy Count & Radio Check */}
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#080E1A] border border-[#1E2D4A] text-amber-400 text-xs font-bold font-mono">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{franchise.championshipsWon}</span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#F59E0B] bg-[#F59E0B] text-slate-950'
                        : 'border-[#1E2D4A] bg-[#080E1A]'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Team Identity Bio */}
              <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed bg-[#080E1A]/60 p-2 rounded-lg border border-[#1E2D4A]/60">
                "{franchise.teamIdentity}"
              </p>

              {/* Squad Strength Meters */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-[#1E2D4A]">
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Batting</span>
                  <span className="font-mono text-xs font-black text-amber-400">
                    {franchise.squadStrength.batting}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Bowling</span>
                  <span className="font-mono text-xs font-black text-blue-400">
                    {franchise.squadStrength.bowling}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">All-Round</span>
                  <span className="font-mono text-xs font-black text-purple-400">
                    {franchise.squadStrength.allRound}
                  </span>
                </div>
                <div className="text-center bg-[#080E1A] rounded p-0.5 border border-[#1E2D4A]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">OVR</span>
                  <span className="font-mono text-xs font-black text-emerald-400">
                    {franchise.squadStrength.overall}
                  </span>
                </div>
              </div>

              {/* Captain & Coach Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-[#1E2D4A]/50">
                <span>Captain: <strong className="text-slate-200">{franchise.captainName}</strong></span>
                <span>Coach: <strong className="text-slate-200">{franchise.headCoach}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Bottom Bar */}
      <div className="p-4 bg-[#080E1A] border-t border-[#1E2D4A] space-y-2">
        <button
          onClick={() => onSelectFranchise(selectedFranchise)}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-transform"
        >
          <span>Confirm {selectedFranchise.name}</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
        <p className="text-[10px] text-center text-slate-400">
          Your franchise choice is permanently locked for the career save.
        </p>
      </div>
    </div>
  );
};
