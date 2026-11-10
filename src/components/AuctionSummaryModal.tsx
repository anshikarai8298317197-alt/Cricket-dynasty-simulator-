/**
 * WICKET DYNASTY - Auction Summary Modal (SCR_13)
 * Financial review, squad balance breakdown, and transaction history
 */
import React, { useState } from 'react';
import { Award, Trophy, Users, Wallet, ArrowRight, CheckCircle, History, Layers } from 'lucide-react';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { AuctionTransaction } from '../types/auction';
import { Player } from '../types/player';

interface AuctionSummaryModalProps {
  isOpen: boolean;
  franchiseId: string;
  userSquadIds: string[];
  userPurseCr: number;
  allFranchiseSquads: Record<string, string[]>;
  allFranchisePurses: Record<string, number>;
  transactions: AuctionTransaction[];
  onProceedToSquad: () => void;
}

export const AuctionSummaryModal: React.FC<AuctionSummaryModalProps> = ({
  isOpen,
  franchiseId,
  userSquadIds,
  userPurseCr,
  allFranchiseSquads,
  allFranchisePurses,
  transactions,
  onProceedToSquad,
}) => {
  const [activeTab, setActiveTab] = useState<'MY_SQUAD' | 'TRANSACTIONS' | 'AI_SQUADS'>('MY_SQUAD');

  if (!isOpen) return null;

  const franchise = FRANCHISES.find(f => f.id === franchiseId) || FRANCHISES[0];
  const userSquad = PLAYERS_DATABASE.filter(p => userSquadIds.includes(p.id));
  const overseasCount = userSquad.filter(p => p.isOverseas).length;
  const indianCount = userSquad.length - overseasCount;
  const totalSpentCr = Math.max(0, Number((franchise.startingPurseCr - userPurseCr).toFixed(2)));

  // Highest purchase
  const userPurchases = transactions.filter(t => t.franchiseId === franchiseId);
  userPurchases.sort((a, b) => b.amountCr - a.amountCr);
  const highestBuy = userPurchases[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0C1425] border border-[#1E2D4A] rounded-2xl shadow-2xl max-h-[92vh] flex flex-col p-4 text-xs">
        {/* Header */}
        <div className="text-center pb-3 border-b border-[#1E2D4A] space-y-1">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">
            Auction Draft Concluded!
          </h2>
          <p className="text-[11px] text-slate-400">
            {franchise.name} has finalized its official season roster
          </p>
        </div>

        {/* Telemetry Highlight Banner */}
        <div className="grid grid-cols-3 gap-2 my-3 text-center">
          <div className="p-2.5 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
            <span className="text-[10px] text-slate-400 block uppercase">Final Squad</span>
            <span className="font-mono text-base font-black text-white mt-0.5 block">
              {userSquad.length} <span className="text-xs text-slate-400">Players</span>
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">
              {indianCount} Ind · {overseasCount} Ovs
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
            <span className="text-[10px] text-slate-400 block uppercase">Total Spent</span>
            <span className="font-mono text-base font-black text-red-400 mt-0.5 block">
              ₹{totalSpentCr.toFixed(1)} Cr
            </span>
            <span className="text-[9px] text-slate-400">of ₹100.0 Cr</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
            <span className="text-[10px] text-slate-400 block uppercase">Purse Left</span>
            <span className="font-mono text-base font-black text-emerald-400 mt-0.5 block">
              ₹{userPurseCr.toFixed(1)} Cr
            </span>
            <span className="text-[9px] text-blue-400">Club Reserve</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1E2D4A] mb-3 gap-1">
          {(['MY_SQUAD', 'TRANSACTIONS', 'AI_SQUADS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-2 text-[11px] font-bold uppercase transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-[#F59E0B] text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {activeTab === 'MY_SQUAD' && (
            <div className="space-y-2">
              {highestBuy && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-amber-400 block">
                      Marquee Acquisition
                    </span>
                    <h4 className="font-bold text-white text-xs">{highestBuy.playerName}</h4>
                  </div>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    ₹{highestBuy.amountCr.toFixed(2)} Cr
                  </span>
                </div>
              )}

              <div className="space-y-1">
                {userSquad.map(player => (
                  <div
                    key={player.id}
                    className="p-2 rounded-lg bg-[#121E36] border border-[#1E2D4A] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#080E1A] flex items-center justify-center font-bold text-xs text-white">
                        {player.shortName.charAt(0)}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-white">{player.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {player.primaryRole} · {player.nationality}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-400">
                      OVR {player.overallRating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-1.5">
              {transactions.slice(0, 30).map((t, idx) => {
                const buyer = FRANCHISES.find(f => f.id === t.franchiseId);
                return (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#121E36] border border-[#1E2D4A] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">{t.playerName}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: buyer?.primaryColor }}
                        />
                        <span className="text-[10px] text-slate-300 font-semibold">{buyer?.name}</span>
                        {t.type === 'RETENTION' && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">Retained</span>
                        )}
                        {t.type === 'RTM_MATCH' && (
                          <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300">RTM</span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      ₹{t.amountCr.toFixed(2)} Cr
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'AI_SQUADS' && (
            <div className="space-y-2">
              {FRANCHISES.filter(f => f.id !== franchiseId).map(f => {
                const count = allFranchiseSquads[f.id]?.length || 0;
                const purse = allFranchisePurses[f.id] || 0;
                return (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-lg bg-[#121E36] border border-[#1E2D4A] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-white text-xs"
                        style={{
                          backgroundColor: `${f.primaryColor}25`,
                          borderColor: f.primaryColor,
                        }}
                      >
                        {f.shortName}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">{f.name}</h4>
                        <span className="text-[10px] text-slate-400">{count} Players Assembled</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-300 text-xs">
                      ₹{purse.toFixed(1)} Cr Left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="pt-3 border-t border-[#1E2D4A]">
          <button
            onClick={onProceedToSquad}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
          >
            <span>Proceed to Squad & Playing XI</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
