/**
 * WICKET DYNASTY - Franchise Team Transfer Modal (Part 10)
 * Unlocks all 10 IPL franchises inside an active career with ZERO level/tier restrictions.
 * Confirms transfer cleanly while preserving coach stats, trophies, records, and seasons.
 */
import React, { useState } from 'react';
import { CareerSave } from '../types/career';
import { Player } from '../types/player';
import { FRANCHISES } from '../data/franchises';
import { FranchiseLogo } from './FranchiseLogo';
import { TeamTransferService } from '../services/teamTransferService';
import { X, ArrowLeftRight, ShieldCheck, CheckCircle2, MapPin, Coins, AlertTriangle } from 'lucide-react';

interface TeamTransferModalProps {
  isOpen: boolean;
  career: CareerSave;
  allPlayers: Player[];
  onClose: () => void;
  onTransferComplete: (updatedCareer: CareerSave, destinationName: string) => void;
}

export const TeamTransferModal: React.FC<TeamTransferModalProps> = ({
  isOpen,
  career,
  allPlayers,
  onClose,
  onTransferComplete,
}) => {
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetFranchise = confirmTargetId ? FRANCHISES.find(f => f.id === confirmTargetId) : null;
  const currentFranchise = FRANCHISES.find(f => f.id === career.franchiseId);

  const handleConfirmTransfer = () => {
    if (!confirmTargetId) return;
    try {
      const { updatedCareer } = TeamTransferService.transferCoachToFranchise(
        career,
        confirmTargetId,
        allPlayers
      );
      setConfirmTargetId(null);
      setErrorMsg(null);
      onTransferComplete(updatedCareer, targetFranchise?.name || confirmTargetId);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to complete team transfer.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0C1425] border-2 border-amber-500/40 rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0F1930]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {targetFranchise ? 'Confirm Team Transfer' : 'Change Team / Join Franchise'}
              </h3>
              <p className="text-[10px] text-amber-400 font-semibold">
                All 10 IPL Teams Unlocked • No Level Lock
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmTargetId(null);
              setErrorMsg(null);
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {!targetFranchise ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start space-x-2 text-[11px] text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Switching franchises keeps all your career trophies, match records, seasons, and club history intact while archiving your outgoing squad.
              </span>
            </div>

            <div className="space-y-2">
              {FRANCHISES.map(f => {
                const isCurrent = f.id === career.franchiseId;
                const savedSquadLen = (career.allFranchiseSquads?.[f.id] || []).length;
                const cachedPurse = career.allFranchisePurses?.[f.id] ?? f.startingPurseCr;

                return (
                  <button
                    key={f.id}
                    disabled={isCurrent}
                    onClick={() => {
                      setErrorMsg(null);
                      setConfirmTargetId(f.id);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/50 cursor-default'
                        : 'bg-[#111B33] hover:bg-[#172444] border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <FranchiseLogo franchiseId={f.id} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-white text-xs truncate">{f.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black uppercase shrink-0">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center space-x-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{f.homeCity}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-0.5 font-mono text-amber-300">
                            <Coins className="w-3 h-3" />
                            <span>₹{Number(cachedPurse).toFixed(1)} Cr</span>
                          </span>
                          {savedSquadLen > 0 && (
                            <>
                              <span>•</span>
                              <span>{savedSquadLen} Players</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isCurrent && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black text-[10px] uppercase shrink-0 ml-2">
                        Join
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-center space-x-4 py-2">
              <div className="text-center">
                <FranchiseLogo franchiseId={career.franchiseId} size="lg" className="mx-auto" />
                <span className="text-[11px] font-bold text-slate-400 block mt-1">
                  {currentFranchise?.shortName || career.franchiseId}
                </span>
              </div>
              <ArrowLeftRight className="w-6 h-6 text-amber-400" />
              <div className="text-center">
                <FranchiseLogo franchiseId={targetFranchise.id} size="lg" className="mx-auto" />
                <span className="text-[11px] font-black text-amber-300 block mt-1">
                  {targetFranchise.shortName}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#111B33] border border-slate-800 space-y-2">
              <p className="font-black text-white text-xs">
                Transfer Coaching Contract to {targetFranchise.name}?
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Preserves {career.statsSummary.matchesPlayed} career matches, {career.statsSummary.trophies} trophies & history</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Archives {currentFranchise?.shortName || career.franchiseId} squad & loads {targetFranchise.shortName} XI, Captain & Keeper</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Home Venue shifts to {targetFranchise.homeStadium}</span>
                </li>
              </ul>
            </div>

            {errorMsg && (
              <p className="text-red-400 font-bold text-[11px] text-center">{errorMsg}</p>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setConfirmTargetId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold"
              >
                Back
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black uppercase tracking-wider"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
