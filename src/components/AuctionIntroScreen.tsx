import React from 'react';
import { ArrowLeft, Gavel, Shield, Sparkles, Trophy, Users, Zap, DollarSign, CheckCircle2 } from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';
import { FranchiseLogo } from './FranchiseLogo';

interface AuctionIntroScreenProps {
  career: CareerSave;
  onEnterAuction: () => void;
  onBack: () => void;
}

export const AuctionIntroScreen: React.FC<AuctionIntroScreenProps> = ({
  career,
  onEnterAuction,
  onBack,
}) => {
  const franchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];
  const retainedCount = career.squadPlayerIds?.length || 0;
  const remainingPurseCr = career.purseBalanceCr ?? 100.0;
  const spentCr = Math.max(0, 100.0 - remainingPurseCr);

  return (
    <div className="flex-1 flex flex-col bg-[#070D18] text-white select-none overflow-y-auto">
      {/* Top Bar */}
      <div className="bg-[#0C1527] border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white">Mega Auction Briefing</h1>
            <p className="text-[10px] text-amber-400 font-medium">BCCI Official IPL 2026 Draft Regulations</p>
          </div>
        </div>

        <FranchiseLogo franchiseId={franchise.id} size={36} />
      </div>

      {/* Main Container */}
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Hero Card */}
        <div className="card-game-3d rounded-3xl p-5 relative overflow-hidden text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.3)]">
            <Gavel className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black uppercase tracking-wider text-white font-serif">
            Welcome to the Live Mega Auction
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Represent <span className="font-bold text-amber-400">{franchise.name}</span> on the auction table. Build your championship roster across 17 structured draft sets.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-3 rounded-2xl bg-[#0F1A30] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Purse</span>
              <span className="text-base font-black text-emerald-400 font-mono">₹{remainingPurseCr.toFixed(2)} Cr</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1A30] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Retained</span>
              <span className="text-base font-black text-amber-400 font-mono">{retainedCount} / 6</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1A30] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">RTM Cards</span>
              <span className="text-base font-black text-blue-400 font-mono">2 Available</span>
            </div>
          </div>
        </div>

        {/* Set Organization Schedule */}
        <div className="card-game-3d rounded-3xl p-5 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>17-Set Auction Draft Order</span>
          </h3>

          <div className="space-y-2">
            {[
              { set: 'Set 1', tier: 'Platinum (Mixed)', ovr: '90–99 OVR', count: '13 Players', desc: 'Marquee legends across all roles in one marquee pool', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20' },
              { set: 'Sets 2–5', tier: 'Diamond (Bat · Bowl · AR · WK)', ovr: '85–89 OVR', count: '27 Players', desc: 'Diamond Batter, Bowler, All-rounder & Wicketkeeper sets', color: 'border-blue-500/40 text-blue-400 bg-blue-950/20' },
              { set: 'Sets 6–9', tier: 'Gold (Bat · Bowl · AR · WK)', ovr: '80–84 OVR', count: '80 Players', desc: 'Gold Batter, Bowler, All-rounder & Wicketkeeper sets', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
              { set: 'Sets 10–13', tier: 'Silver (Bat · Bowl · AR · WK)', ovr: '70–79 OVR', count: '100 Players', desc: 'Silver Batter, Bowler, All-rounder & Wicketkeeper sets', color: 'border-slate-500/40 text-slate-300 bg-slate-900/40' },
              { set: 'Sets 14–17', tier: 'Bronze (Bat · Bowl · AR · WK)', ovr: '60–69 OVR', count: '100 Players', desc: 'Bronze Batter, Bowler, All-rounder & Wicketkeeper sets', color: 'border-orange-500/40 text-orange-400 bg-orange-950/20' },
            ].map(item => (
              <div key={item.tier} className={`p-3 rounded-2xl border ${item.color} flex items-center justify-between gap-2`}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{item.set}</span>
                    <span className="text-xs font-black uppercase tracking-wide">{item.tier}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10">{item.ovr}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <span className="text-xs font-mono font-bold shrink-0">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rules & Safeguards */}
        <div className="card-game-3d rounded-3xl p-4 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Auction Table Safeguards
          </h3>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            <li><span className="text-white font-medium">No Self-Bidding:</span> You can never bid against yourself; opposition AI will counter-bid if interested.</li>
            <li><span className="text-white font-medium">Automatic Set Previews:</span> Between each tier set, an interactive roster preview will appear.</li>
            <li><span className="text-white font-medium">Instant Auto-Save:</span> Every bid and player acquisition is persistently saved in real time.</li>
          </ul>
        </div>

        {/* Enter Auction Button */}
        <div className="pt-2 pb-6">
          <button
            onClick={onEnterAuction}
            className="w-full py-4 px-6 rounded-2xl btn-game-gold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-[0_6px_20px_rgba(245,158,11,0.4)] active:scale-[0.98]"
          >
            <Gavel className="w-5 h-5 stroke-[2.5]" />
            <span className="text-sm font-black">Enter Live Mega Auction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
