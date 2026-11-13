/**
 * WICKET DYNASTY - Career Milestone Celebration Popup Modal
 * Appears whenever a squad cricketer crosses a landmark milestone (e.g., 500 career runs or 100 career wickets).
 */
import React from 'react';
import { Award, Sparkles, Trophy, X, ChevronRight } from 'lucide-react';
import { PlayerMilestoneEvent } from '../services/milestoneService';
import { Player } from '../types/player';
import { PlayerAvatar } from './PlayerAvatar';
import { FRANCHISES } from '../data/franchises';

interface MilestonePopupModalProps {
  milestones: PlayerMilestoneEvent[];
  allPlayers: Player[];
  onDismiss: () => void;
}

export const MilestonePopupModal: React.FC<MilestonePopupModalProps> = ({
  milestones,
  allPlayers,
  onDismiss,
}) => {
  if (!milestones || milestones.length === 0) return null;

  const primary = milestones[0];
  const player = allPlayers.find(p => p.id === primary.playerId);
  const franchise = FRANCHISES.find(f => f.id === primary.franchiseId) || FRANCHISES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#16233F] via-[#0F172A] to-[#080E1A] border-2 border-amber-400/70 shadow-[0_0_40px_rgba(245,158,11,0.3)] p-5 space-y-4 relative overflow-hidden">
        {/* Close */}
        <button
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-[#0C1527] border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          aria-label="Close milestone notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Header */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Career Milestone Reached</span>
          </div>

          {player ? (
            <div className="relative mb-2">
              <PlayerAvatar player={player} size={72} jerseyColor={franchise.primaryColor} />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-[#0F172A] flex items-center justify-center text-slate-950 shadow-lg">
                <Trophy className="w-3.5 h-3.5" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mb-2">
              <Award className="w-8 h-8" />
            </div>
          )}

          <h2 className="text-lg font-black text-white tracking-wide">{primary.playerName}</h2>
          <p className="text-[11px] text-slate-400 font-medium">
            {primary.playerRole} · {franchise.shortName}
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-[#091120] border border-amber-500/40 text-center space-y-1">
          <span className="text-xl font-black text-amber-300 uppercase tracking-wider block">
            {primary.title}
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">{primary.subtitle}</p>
          <div className="pt-1.5 flex items-center justify-center space-x-3 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              New Total: {primary.newTotal.toLocaleString()}
            </span>
            {primary.matchDelta > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                +{primary.matchDelta} this match
              </span>
            )}
          </div>
        </div>

        {/* Additional milestones achieved in same match */}
        {milestones.length > 1 && (
          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              More Landmarks ({milestones.length - 1})
            </span>
            {milestones.slice(1).map(m => (
              <div
                key={m.id}
                className="px-3 py-2 rounded-xl bg-[#0C1527] border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{m.playerName}</span>
                  <span className="text-[10px] text-amber-300">{m.title}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-[11px]">
                  {m.newTotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 px-4 rounded-2xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-1.5 shadow-xl cursor-pointer"
        >
          <span>Acknowledge Milestone</span>
          <ChevronRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
