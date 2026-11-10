import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, X, Hammer, Users } from 'lucide-react';
import { SquadValidationResult } from '../services/squadValidationEngine';

interface MatchValidationModalProps {
  isOpen: boolean;
  validationResult: SquadValidationResult | null;
  onReturnToAuction: () => void;
  onConfigurePlayingXi: () => void;
  onClose: () => void;
}

export const MatchValidationModal: React.FC<MatchValidationModalProps> = ({
  isOpen,
  validationResult,
  onReturnToAuction,
  onConfigurePlayingXi,
  onClose,
}) => {
  if (!isOpen || !validationResult) return null;

  const { isEmptySquad, errors, squadCount, playingXiCount } = validationResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121E36] border-2 border-red-500/70 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-[#1C1628] to-[#121E36] p-4 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              {isEmptySquad ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : <ShieldAlert className="w-5 h-5 text-red-400" />}
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">
                {isEmptySquad ? 'YOUR SQUAD IS EMPTY' : 'SQUAD VALIDATION FAILED'}
              </h3>
              <p className="text-[11px] text-red-300 font-medium">
                {isEmptySquad ? 'Mega Auction incomplete' : 'Playing XI does not satisfy match rules'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0C1527] border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isEmptySquad ? (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-2">
              <p className="text-xs text-amber-200 leading-relaxed font-medium">
                You have not acquired any players for your franchise. WICKET DYNASTY enforces authentic tournament progression and will never substitute random or hardcoded players.
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                Squad: 0/25 • Playing XI: 0/11
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-300 bg-[#0C1527] px-3 py-2 rounded-lg border border-slate-700/60 font-mono">
                <span>Registered Squad: <strong className="text-white">{squadCount}</strong></span>
                <span>Playing XI: <strong className={playingXiCount === 11 ? 'text-emerald-400' : 'text-red-400'}>{playingXiCount}/11</strong></span>
              </div>
              <p className="text-xs text-slate-300">
                The following criteria must be satisfied before entering a live match:
              </p>
            </div>
          )}

          {/* Error List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {errors.map((err, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-start space-x-2"
              >
                <span className="text-red-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{err}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            {isEmptySquad ? (
              <button
                onClick={onReturnToAuction}
                className="w-full py-3 px-4 rounded-xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
              >
                <Hammer className="w-4 h-4 fill-current text-slate-950" />
                <span>RETURN TO AUCTION ROOM</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            ) : (
              <button
                onClick={onConfigurePlayingXi}
                className="w-full py-3 px-4 rounded-xl btn-game-gold text-xs uppercase tracking-wider font-black flex items-center justify-center space-x-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
              >
                <Users className="w-4 h-4 text-slate-950" />
                <span>MANAGE PLAYING XI</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#0C1527] hover:bg-[#16233B] border border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
