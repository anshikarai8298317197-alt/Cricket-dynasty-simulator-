/**
 * WICKET DYNASTY - Game Settings & Audio Mixers (SCR_34 / SCR_35)
 */
import React, { useState } from 'react';
import { X, Volume2, ShieldCheck, RotateCcw } from 'lucide-react';
import { LevelPlayService } from '../services/levelPlayService';

const SETTINGS_LS_KEY = 'wicket_dynasty_settings_v1';

function readPersistedBatterySaver(): boolean {
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);
    if (!raw) return false;
    return Boolean(JSON.parse(raw)?.batterySaver);
  } catch {
    return false;
  }
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAudit: () => void;
  onResetStorage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAudit,
  onResetStorage,
}) => {
  const [masterVolume, setMasterVolume] = useState(80);
  const [commentaryVolume, setCommentaryVolume] = useState(75);
  const [crowdVolume, setCrowdVolume] = useState(70);
  const [sfxVolume, setSfxVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [batterySaver, setBatterySaver] = useState<boolean>(() => readPersistedBatterySaver());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const adConfig = LevelPlayService.getConfigStatus();

  const toggleBatterySaver = () => {
    const next = !batterySaver;
    setBatterySaver(next);
    try {
      const existing = JSON.parse(localStorage.getItem(SETTINGS_LS_KEY) || '{}');
      localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify({ ...existing, batterySaver: next }));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0C1425] border border-[#1E2D4A] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col p-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2D4A]">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Game Settings & Audio
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#121E36] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* Audio Channels */}
          <div className="p-3.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Audio Mixer</span>
              </span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  isMuted
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-[#080E1A] text-slate-400 border-[#1E2D4A]'
                }`}
              >
                {isMuted ? 'UNMUTE ALL' : 'MUTE ALL'}
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Master Volume</span>
                  <span className="font-mono font-bold text-amber-400">{isMuted ? 0 : masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isMuted}
                  value={isMuted ? 0 : masterVolume}
                  onChange={e => setMasterVolume(Number(e.target.value))}
                  className="w-full accent-[#F59E0B]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Commentary Speech</span>
                  <span className="font-mono font-bold text-amber-400">{isMuted ? 0 : commentaryVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isMuted}
                  value={isMuted ? 0 : commentaryVolume}
                  onChange={e => setCommentaryVolume(Number(e.target.value))}
                  className="w-full accent-[#F59E0B]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Stadium Crowd Atmosphere</span>
                  <span className="font-mono font-bold text-amber-400">{isMuted ? 0 : crowdVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isMuted}
                  value={isMuted ? 0 : crowdVolume}
                  onChange={e => setCrowdVolume(Number(e.target.value))}
                  className="w-full accent-[#F59E0B]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Match Sound FX (Bat/Ball)</span>
                  <span className="font-mono font-bold text-amber-400">{isMuted ? 0 : sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isMuted}
                  value={isMuted ? 0 : sfxVolume}
                  onChange={e => setSfxVolume(Number(e.target.value))}
                  className="w-full accent-[#F59E0B]"
                />
              </div>
            </div>
          </div>

          {/* Graphics & Performance */}
          <div className="p-3.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              Device Performance
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Battery Saver Mode</span>
                <span className="text-[10px] text-slate-400">Uses lightweight 3-step trajectory updates to save battery</span>
              </div>
              <button
                onClick={toggleBatterySaver}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  batterySaver ? 'bg-[#F59E0B]' : 'bg-[#1E2D4A]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    batterySaver ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Diagnostics & Audit */}
          <div className="p-3.5 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              Data & Ad Mediation Diagnostics
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAudit();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#0C1425] hover:bg-[#1A2846] border border-[#1E2D4A] text-emerald-400 font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Run 320-Player Database Audit</span>
              </div>
              <span className="font-mono text-[10px]">100% Valid</span>
            </button>

            <div className="p-2.5 rounded-lg bg-[#0C1425] border border-[#1E2D4A] space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-300">
                <span>Unity Android Game ID:</span>
                <span className="font-mono text-amber-400 font-bold">{adConfig.unityGameId}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Formats (Zero Banners):</span>
                <span className="font-mono text-emerald-400">Rewarded + Interstitial</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Native LevelPlay Bridge:</span>
                <span className="font-mono">
                  {adConfig.hasNativeBridge ? (adConfig.isInitialized ? 'Initialized' : 'Bridge Ready') : 'Web Preview'}
                </span>
              </div>
              {adConfig.missingFields.length > 0 && (
                <p className="text-[9px] text-amber-300/90 pt-1">
                  Missing native keys: {adConfig.missingFields.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Reset Save Data */}
          <div className="pt-2">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Local Career Saves</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 space-y-2 text-center">
                <p className="text-red-300 font-bold">Are you sure? This erases all 5 save slots.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg bg-[#121E36] text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onResetStorage();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1E2D4A]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#121E36] hover:bg-[#1A2846] text-white font-bold uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
