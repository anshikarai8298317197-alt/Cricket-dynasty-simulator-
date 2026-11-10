/**
 * WICKET DYNASTY - Individual Player Training Modal
 * Phase 03 Architecture
 */
import React, { useState } from 'react';
import { Player } from '../types/player';
import { TrainingProgramme, TrainingIntensity, Coach, TrainingFacility, PlayerWorkloadState } from '../types/training';
import { TrainingEngine } from '../services/trainingEngine';
import { DEFAULT_COACHES } from '../data/trainingData';
import { X, Dumbbell, ShieldAlert, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface IndividualTrainingModalProps {
  player: Player;
  workload: PlayerWorkloadState;
  facilities: TrainingFacility[];
  coaches: Coach[];
  onAssign: (programmeId: string, intensity: TrainingIntensity, coachId: string) => void;
  onExecuteNow: (programme: TrainingProgramme, intensity: TrainingIntensity, coach: Coach) => void;
  onClose: () => void;
}

export const IndividualTrainingModal: React.FC<IndividualTrainingModalProps> = ({
  player,
  workload,
  facilities,
  coaches,
  onAssign,
  onExecuteNow,
  onClose,
}) => {
  const compatibleProgrammes = TrainingEngine.getCompatibleProgrammes(player);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(
    compatibleProgrammes[0]?.id || 'BAT_TECHNIQUE'
  );
  const [selectedIntensity, setSelectedIntensity] = useState<TrainingIntensity>('Normal');
  const [selectedCoachId, setSelectedCoachId] = useState<string>(coaches[0]?.id || DEFAULT_COACHES[0].id);

  const selectedProgramme =
    compatibleProgrammes.find(p => p.id === selectedProgrammeId) || compatibleProgrammes[0];
  const selectedCoach = coaches.find(c => c.id === selectedCoachId) || coaches[0];

  // Projected fatigue
  let projectedFatigue = selectedProgramme.baseFatigueCost;
  if (selectedIntensity === 'Light') projectedFatigue = Math.round(projectedFatigue * 0.6);
  if (selectedIntensity === 'Intensive') projectedFatigue = Math.round(projectedFatigue * 1.5);

  let projectedRisk = selectedProgramme.baseInjuryRiskPercent;
  if (selectedIntensity === 'Intensive') projectedRisk += 6;
  if (workload.fatigue + projectedFatigue > 75) projectedRisk += 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0F172A] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#141E33]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">{player.name}</h2>
              <p className="text-xs text-slate-400">
                {player.primaryRole} • OVR {player.overallRating} • POT {player.potentialRating}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Player Workload Summary */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Fitness</span>
              <span className="text-sm font-bold text-emerald-400">{workload.fitness}%</span>
            </div>
            <div className="text-center border-x border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Fatigue</span>
              <span
                className={`text-sm font-bold ${
                  workload.fatigue > 70 ? 'text-red-400' : workload.fatigue > 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {workload.fatigue}%
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Status</span>
              <span
                className={`text-xs font-bold ${
                  workload.isInjured ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {workload.isInjured ? workload.injuryDetails?.type || 'Injured' : 'Fit & Available'}
              </span>
            </div>
          </div>

          {/* Programme Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Compatible Programme ({compatibleProgrammes.length} Available)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {compatibleProgrammes.map(prog => {
                const isSelected = prog.id === selectedProgrammeId;
                return (
                  <div
                    key={prog.id}
                    onClick={() => setSelectedProgrammeId(prog.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{prog.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/20 font-medium">
                        {prog.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{prog.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400 font-mono">
                      <span>Target: {prog.targetAttributes.join(', ')}</span>
                      <span>• Fatigue: +{prog.baseFatigueCost}%</span>
                      <span>• Injury Risk: {prog.baseInjuryRiskPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intensity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Session Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Light', 'Normal', 'Intensive'] as TrainingIntensity[]).map(intensity => {
                const isSelected = selectedIntensity === intensity;
                return (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => setSelectedIntensity(intensity)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? intensity === 'Intensive'
                          ? 'bg-red-500/20 border-red-500 text-red-200'
                          : 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>{intensity}</div>
                    <div className="text-[10px] font-normal opacity-75 mt-0.5">
                      {intensity === 'Light'
                        ? 'Low Fatigue, -40% Gain'
                        : intensity === 'Normal'
                        ? 'Standard Progress'
                        : '+40% Gain, High Risk'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coach Supervisor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Supervising Coach
            </label>
            <select
              value={selectedCoachId}
              onChange={e => setSelectedCoachId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role} • Rating {c.qualityRating} • +{c.developmentBonusPercent}% Dev)
                </option>
              ))}
            </select>
          </div>

          {/* Impact Forecast Warning Box */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Projected Fatigue Delta:</span>
              </span>
              <span className="font-semibold text-amber-400">+{projectedFatigue}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Session Injury Risk:</span>
              </span>
              <span
                className={`font-semibold ${
                  projectedRisk > 15 ? 'text-red-400' : projectedRisk > 8 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {projectedRisk}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#141E33] flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onAssign(selectedProgramme.id, selectedIntensity, selectedCoach.id)}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-300" />
            <span>Assign to Weekly Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => onExecuteNow(selectedProgramme, selectedIntensity, selectedCoach)}
            disabled={workload.isInjured}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold shadow-lg transition-all text-center flex items-center justify-center space-x-1.5 ${
              workload.isInjured
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>{workload.isInjured ? 'Player Injured' : 'Execute Drill Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
