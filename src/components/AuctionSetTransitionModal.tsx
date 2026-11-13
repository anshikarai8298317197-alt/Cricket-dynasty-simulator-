import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Trophy, ChevronRight } from 'lucide-react';
import { Player } from '../types/player';
import { PlayerAvatar } from './PlayerAvatar';

interface AuctionSetTransitionModalProps {
  completedTier: string;
  nextTier: string;
  nextTierPlayers: Player[];
  onContinue: () => void;
}

export const AuctionSetTransitionModal: React.FC<AuctionSetTransitionModalProps> = ({
  completedTier,
  nextTier,
  nextTierPlayers,
  onContinue,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'text-cyan-300 border-cyan-400/40 bg-cyan-950/40';
      case 'Diamond':
        return 'text-blue-300 border-blue-400/40 bg-blue-950/40';
      case 'Gold':
        return 'text-amber-300 border-amber-400/40 bg-amber-950/40';
      case 'Silver':
        return 'text-slate-300 border-slate-400/40 bg-slate-900/60';
      case 'Bronze':
        return 'text-orange-400 border-orange-500/40 bg-orange-950/40';
      default:
        return 'text-white border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0C1527] border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0C1527] via-[#162544] to-[#0C1527] border-b border-slate-800 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{completedTier} Set Completed</span>
          </div>

          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            Upcoming Category: <span className="text-amber-400">{nextTier}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {nextTierPlayers.length} elite cricketers entering the bidding arena
          </p>
        </div>

        {/* Players List in this upcoming set */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {nextTierPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[#121E36] border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-mono text-xs text-slate-500 font-bold">
                  #{idx + 1}
                </span>
                <PlayerAvatar player={player} size={36} showRoleBadge={false} />
                <div>
                  <h4 className="text-xs font-bold text-white">{player.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{player.primaryRole}</span>
                    <span>·</span>
                    <span>{player.country || (player.nationality && player.nationality !== 'N/A' ? player.nationality : 'N/A')}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getTierColor(player.tier || player.ratingTier || 'Bronze')}`}>
                  {player.tier || player.ratingTier} · {player.overallRating}
                </span>
                <span className="block text-[10px] text-emerald-400 font-mono font-bold mt-1">
                  ₹{(player.contract?.baseAuctionPriceCr ?? 0.20).toFixed(2)} Cr
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-[#080E1A] border-t border-slate-800">
          <button
            onClick={onContinue}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.3)] active:scale-[0.98] transition-all"
          >
            <span>Continue to {nextTier} Auction</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
