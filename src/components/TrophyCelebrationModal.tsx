/**
 * WICKET DYNASTY - Trophy Ceremony & Championship Celebration Modal
 * Triggered whenever the user lifts a Domestic League Championship or Global Champions League Crown.
 */
import React from 'react';
import { Award, CheckCircle2, Sparkles, X } from 'lucide-react';
import { CareerTrophy } from '../types/globalSeason';
import { TrophyArtwork3D } from './TrophyArtwork3D';
import { FranchiseLogo } from './FranchiseLogo';

interface TrophyCelebrationModalProps {
  trophies: CareerTrophy[];
  onDismiss: () => void;
}

export const TrophyCelebrationModal: React.FC<TrophyCelebrationModalProps> = ({
  trophies,
  onDismiss,
}) => {
  if (!trophies || trophies.length === 0) return null;
  const current = trophies[0];
  const isGcl = current.competitionId === 'GCL_T20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#172545] via-[#0F182D] to-[#080E1A] border-2 border-amber-400/70 p-6 text-center space-y-4 shadow-[0_0_50px_rgba(251,191,36,0.28)] relative overflow-hidden">
        <button
          onClick={onDismiss}
          aria-label="Close trophy celebration"
          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center space-x-1.5 text-amber-300 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>{isGcl ? 'Global Champions Crowned' : 'Championship Victory'}</span>
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex flex-col items-center justify-center py-1">
          <TrophyArtwork3D
            variant={isGcl ? 'GCL_CUP' : current.competitionId === 'IPL' ? 'IPL_CUP' : 'DOMESTIC_CUP'}
            size={112}
            yearLabel={current.seasonYear}
          />
          <div className="-mt-2 flex items-center space-x-2 bg-[#091120] border border-amber-500/40 rounded-xl px-3 py-1.5 shadow-lg">
            <FranchiseLogo franchiseId={current.winningTeamId} size={24} />
            <span className="text-xs font-black text-white">{current.winningTeamName}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-amber-300 tracking-tight leading-tight">
            {current.trophyName}
          </h2>
          <p className="text-xs text-slate-300 font-semibold">
            {current.competitionName} · {current.seasonYear}
          </p>
          {current.finalMargin && (
            <p className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 mt-2">
              {current.finalMargin}
            </p>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 flex items-center justify-center space-x-2 text-[11px] text-slate-300">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Saved permanently to your Career Trophy Room</span>
        </div>

        <button
          onClick={onDismiss}
          className="w-full min-h-[44px] py-3 px-4 rounded-2xl btn-game-gold text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Lift Trophy &amp; Continue</span>
        </button>
      </div>
    </div>
  );
};
