/**
 * WICKET DYNASTY - Auction Hub Screen (SCR_07)
 * Purse telemetry, retentions preview, RTM status, and auction staging
 */
import React from 'react';
import { Gavel, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { FranchiseLogo } from './FranchiseLogo';
import { DbPersistence } from '../services/dbPersistence';

interface AuctionHubScreenProps {
  career: CareerSave;
  onStartAuction: () => void;
  onResumeLiveAuction?: () => void;
  onOpenRetentions: () => void;
  onBack: () => void;
}

export const AuctionHubScreen: React.FC<AuctionHubScreenProps> = ({
  career,
  onStartAuction,
  onResumeLiveAuction,
  onOpenRetentions,
  onBack,
}) => {
  const franchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];
  const retainedPlayers = PLAYERS_DATABASE.filter(p => career.squadPlayerIds.includes(p.id));
  const overseasCount = retainedPlayers.filter(p => p.isOverseas).length;
  const rtmCards = retainedPlayers.length >= 5 ? 1 : 2;
  const activeAuction = DbPersistence.getActiveLiveAuction();
  const hasSavedAuctionForCareer = activeAuction && activeAuction.careerId === career.id;

  return (
    <div className="flex-1 flex flex-col bg-[#0C1425] text-white">
      {/* Header Banner */}
      <div className="p-4 bg-[#121E36] border-b border-[#1E2D4A] relative overflow-hidden">
        <div
          className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: franchise.primaryColor }}
        />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <FranchiseLogo franchiseId={franchise.id} size={52} className="rounded-2xl shadow-lg" />

            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#080E1A] text-amber-400 border border-amber-500/30">
                MEGA AUCTION ROOM · SEASON {career.currentSeason}
              </span>
              <h2 className="text-lg font-black text-white mt-1">{franchise.name}</h2>
              <p className="text-xs text-slate-300 font-medium">{career.name}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Available Purse</span>
            <span className="font-mono text-xl font-black text-emerald-400">
              ₹{career.purseBalanceCr.toFixed(1)} Cr
            </span>
          </div>
        </div>
      </div>

      {/* Main Hub Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasSavedAuctionForCareer && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 block">
                AUCTION IN PROGRESS · AUTO-SAVED
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                Resume at Lot #{(activeAuction.currentLotIndex || 0) + 1} · {activeAuction.phase}
              </p>
            </div>
            <button
              onClick={onResumeLiveAuction || onStartAuction}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase shrink-0"
            >
              Resume
            </button>
          </div>
        )}

        {/* Squad Status Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Squad Count</span>
            <span className="font-mono text-lg font-bold text-white mt-0.5 block">
              {career.squadPlayerIds.length} <span className="text-xs text-slate-400">/ 25</span>
            </span>
            <span className="text-[9px] text-emerald-400 font-semibold">Min 18 required</span>
          </div>

          <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Overseas</span>
            <span className="font-mono text-lg font-bold text-amber-400 mt-0.5 block">
              {overseasCount} <span className="text-xs text-slate-400">/ 8</span>
            </span>
            <span className="text-[9px] text-slate-400 font-semibold">Max 8 allowed</span>
          </div>

          <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">RTM Cards</span>
            <span className="font-mono text-lg font-bold text-blue-400 mt-0.5 block">
              {rtmCards}
            </span>
            <span className="text-[9px] text-blue-300 font-semibold">Right-To-Match</span>
          </div>
        </div>

        {/* Retentions Tile */}
        <div
          onClick={onOpenRetentions}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#121E36] to-[#1A2846] border border-[#1E2D4A] hover:border-[#F59E0B] cursor-pointer flex items-center justify-between transition-all active:scale-[0.99] shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">Player Retentions & Releases</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {retainedPlayers.length} Retained
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Retain up to 5 core franchise players before the auction starts
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Retained Players List (if any) */}
        {retainedPlayers.length > 0 && (
          <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Currently Retained Stars ({retainedPlayers.length})
            </h4>
            <div className="space-y-1.5">
              {retainedPlayers.map(p => (
                <div
                  key={p.id}
                  className="p-2 rounded-lg bg-[#080E1A] border border-[#1E2D4A] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-400">({p.primaryRole})</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">OVR {p.overallRating}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auction Sets Overview (17 Authoritative Sets) */}
        <div className="p-3.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
              <span>17-Set Auction Order</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-400">320 PLAYERS READY</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/50">
              <span>Set 1: Platinum Marquee (Mixed Roles)</span>
              <span className="font-bold text-cyan-300">13 Players</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/50">
              <span>Sets 2–5: Diamond (BAT · BWL · AR · WK)</span>
              <span className="font-bold text-blue-300">27 Players</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/50">
              <span>Sets 6–9: Gold (BAT · BWL · AR · WK)</span>
              <span className="font-bold text-amber-400">80 Players</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]/50">
              <span>Sets 10–13: Silver (BAT · BWL · AR · WK)</span>
              <span className="font-bold text-slate-300">100 Players</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Sets 14–17: Bronze (BAT · BWL · AR · WK)</span>
              <span className="font-bold text-orange-400">100 Players</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Auction Bottom Bar */}
      <div className="p-4 bg-[#080E1A] border-t border-[#1E2D4A] space-y-2">
        <button
          onClick={hasSavedAuctionForCareer && onResumeLiveAuction ? onResumeLiveAuction : onStartAuction}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-sm uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.35)] active:scale-[0.98] transition-transform"
        >
          <Gavel className="w-5 h-5 fill-slate-950" />
          <span>{hasSavedAuctionForCareer ? 'Resume Live Auction Room' : 'Enter Live Auction Room'}</span>
        </button>
        <p className="text-[10px] text-center text-slate-400">
          All 10 IPL franchises participate simultaneously in live bidding.
        </p>
      </div>
    </div>
  );
};
