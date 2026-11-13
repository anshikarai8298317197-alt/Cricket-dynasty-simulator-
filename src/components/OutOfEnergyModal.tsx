/**
 * WICKET DYNASTY - Match Simulation Energy Depleted / Recharge Modal (Part 8)
 * - Displays live 20m / 100m countdowns
 * - Optional "WATCH AD & GET 1 ENERGY" via LevelPlayService ('MATCH_SIM_ENERGY')
 * - Resume Auto Play trigger when energy >= 1
 * - Reminds user Manual Live 2D Match costs 0 energy
 */
import React, { useEffect, useState } from 'react';
import { EnergyService, EnergySnapshot } from '../services/energyService';
import { LevelPlayService } from '../services/levelPlayService';
import { Zap, Play, Video, Clock, X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface OutOfEnergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pausedAutoPlayLabel?: string | null;
  matchesCompletedInLoop?: number;
  onResumeAutoPlay?: () => void;
  onEnergyUpdated?: (snapshot: EnergySnapshot) => void;
}

export const OutOfEnergyModal: React.FC<OutOfEnergyModalProps> = ({
  isOpen,
  onClose,
  pausedAutoPlayLabel,
  matchesCompletedInLoop = 0,
  onResumeAutoPlay,
  onEnergyUpdated,
}) => {
  const [snapshot, setSnapshot] = useState<EnergySnapshot>(() => EnergyService.getSnapshot());
  const [adBusy, setAdBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMessage(null);
    const sync = () => {
      const next = EnergyService.getSnapshot();
      setSnapshot(next);
      onEnergyUpdated?.(next);
    };
    sync();
    const timer = setInterval(sync, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onEnergyUpdated]);

  if (!isOpen) return null;

  const handleWatchAdForEnergy = async () => {
    if (adBusy || snapshot.isFull) return;
    setAdBusy(true);
    setStatusMessage({ type: 'info', text: 'Requesting rewarded video from Unity LevelPlay...' });

    try {
      const res = await LevelPlayService.showRewardedAd('MATCH_SIM_ENERGY');
      if (res.completed && res.rewardToken) {
        const grant = EnergyService.grantRewardedEnergy(1, res.rewardToken);
        setSnapshot(grant.snapshot);
        onEnergyUpdated?.(grant.snapshot);
        if (grant.granted) {
          setStatusMessage({
            type: 'success',
            text: `Verified! +1 Match Simulation Energy added (${grant.snapshot.energy}/${grant.snapshot.maxEnergy}).`,
          });
        } else {
          setStatusMessage({ type: 'error', text: grant.reason || 'Reward already processed.' });
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: res.reason || 'Ad not completed or unavailable — no energy granted.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Unable to load rewarded ad right now.',
      });
    } finally {
      setAdBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#0C1425] border-2 border-amber-500/50 rounded-3xl shadow-2xl p-5 space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {snapshot.energy > 0 ? 'Simulation Energy Ready' : 'Out of Simulation Energy'}
              </h3>
              <p className="text-[11px] text-amber-400 font-bold font-mono">
                Energy: {snapshot.energy} / {snapshot.maxEnergy}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Energy Bar */}
        <div className="grid grid-cols-5 gap-1.5 bg-slate-950/70 p-2 rounded-2xl border border-slate-800">
          {Array.from({ length: snapshot.maxEnergy }).map((_, idx) => {
            const active = idx < snapshot.energy;
            return (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  active
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {/* Auto-play pause notice */}
        {pausedAutoPlayLabel && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
            <div className="flex items-center space-x-1.5 font-black text-[11px] uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{pausedAutoPlayLabel} Paused</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {matchesCompletedInLoop > 0
                ? `${matchesCompletedInLoop} match${matchesCompletedInLoop > 1 ? 'es were' : ' was'} completed & saved automatically before energy hit 0.`
                : 'No further matches can be auto-simulated until 1 energy is restored.'}
            </p>
          </div>
        )}

        {/* Regeneration Countdown Box */}
        <div className="p-3.5 rounded-2xl bg-[#111B33] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center space-x-1.5 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Next +1 Energy</span>
            </span>
            <span className="font-mono font-black text-white text-sm tabular-nums">
              {snapshot.isFull ? 'FULL' : snapshot.nextEnergyFormatted}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Full Recharge (5/5 in 100m)</span>
            <span className="font-mono font-bold text-slate-300 tabular-nums">
              {snapshot.isFull ? '00:00' : snapshot.fullRechargeFormatted}
            </span>
          </div>
        </div>

        {/* Free Live Match reassurance */}
        <p className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 text-center font-semibold">
          Manual Live 2D Match playback always consumes 0 energy.
        </p>

        {/* Ad Status Feedback */}
        {statusMessage && (
          <div
            className={`p-2.5 rounded-xl border text-[11px] flex items-start space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-950/50 border-red-500/40 text-red-300'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {!snapshot.isFull && (
            <button
              onClick={handleWatchAdForEnergy}
              disabled={adBusy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg"
            >
              <Video className="w-4 h-4" />
              <span>{adBusy ? 'Loading Ad...' : 'Watch Ad & Get 1 Energy'}</span>
            </button>
          )}

          {onResumeAutoPlay && snapshot.energy >= 1 && (
            <button
              onClick={() => {
                onClose();
                onResumeAutoPlay();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume {pausedAutoPlayLabel || 'Auto Play'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold"
          >
            {snapshot.energy > 0 ? 'Continue' : 'Wait for Auto Recharge (20m)'}
          </button>
        </div>
      </div>
    </div>
  );
};
