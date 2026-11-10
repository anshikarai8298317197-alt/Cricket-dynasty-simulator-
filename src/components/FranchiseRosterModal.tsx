/**
 * WICKET DYNASTY - Franchise Roster Modal
 * Inspect verified 2026 IPL rosters across all 10 franchises
 */
import React, { useState } from 'react';
import { X, Trophy, MapPin, Users, ChevronRight, Shield } from 'lucide-react';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { Player } from '../types/player';
import { PlayerProfileModal } from './PlayerProfileModal';

interface FranchiseRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FranchiseRosterModal: React.FC<FranchiseRosterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('RCB');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  if (!isOpen) return null;

  const activeFranchise = FRANCHISES.find(f => f.id === selectedFranchiseId) || FRANCHISES[0];
  const squad = PLAYERS_DATABASE.filter(p => p.originalFranchiseId === activeFranchise.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0C1425] border border-[#1E2D4A] rounded-2xl shadow-2xl max-h-[92vh] flex flex-col p-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4A]">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              10 IPL Franchises (2026 Roster)
            </h2>
            <p className="text-[11px] text-slate-400">Official verified IPL 2026 squads</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#121E36] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Franchise Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-[#1E2D4A] scrollbar-none text-[11px]">
          {FRANCHISES.map(f => {
            const isSelected = f.id === selectedFranchiseId;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFranchiseId(f.id)}
                className={`px-3 py-1 rounded-lg font-bold uppercase transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'shadow-md text-white'
                    : 'bg-[#121E36] text-slate-400 border-[#1E2D4A] hover:text-white'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: f.primaryColor,
                        borderColor: f.primaryColor,
                        color: f.textColor,
                      }
                    : {}
                }
              >
                {f.shortName}
              </button>
            );
          })}
        </div>

        {/* Selected Franchise Summary Banner */}
        <div className="p-3 my-2 rounded-xl bg-[#121E36] border border-[#1E2D4A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-white"
              style={{
                backgroundColor: `${activeFranchise.primaryColor}25`,
                borderColor: activeFranchise.primaryColor,
              }}
            >
              {activeFranchise.shortName}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{activeFranchise.name}</h3>
              <p className="text-[10px] text-slate-400">
                Captain: {activeFranchise.captainName} · Coach: {activeFranchise.headCoach}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-sm font-black text-amber-400">{squad.length}</span>
            <span className="text-[10px] text-slate-400 block uppercase">Players</span>
          </div>
        </div>

        {/* Roster List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {squad.map(player => (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="p-2.5 rounded-lg bg-[#121E36] border border-[#1E2D4A] hover:border-[#F59E0B]/50 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#080E1A] border border-[#1E2D4A] flex items-center justify-center font-bold text-xs text-white">
                  {player.shortName.charAt(0)}
                </span>
                <div>
                  <h4 className="font-bold text-xs text-white">{player.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    {player.primaryRole} · {player.age} yrs · {player.nationality}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-300">
                  ₹{player.contract.salaryExpectationCr.toFixed(1)} Cr
                </span>
                <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-[#080E1A] text-amber-400 border border-[#F59E0B]/30">
                  {player.overallRating}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1E2D4A]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#121E36] hover:bg-[#1A2846] text-white font-bold uppercase tracking-wider"
          >
            Close Roster
          </button>
        </div>

        {/* Player Profile Modal */}
        <PlayerProfileModal
          player={selectedPlayer}
          isOpen={selectedPlayer !== null}
          onClose={() => setSelectedPlayer(null)}
        />
      </div>
    </div>
  );
};
