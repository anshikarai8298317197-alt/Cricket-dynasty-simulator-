/**
 * WICKET DYNASTY - Player Profile Modal (SCR_11)
 * Deep attributes, tri-gauge condition meters, role-specific attributes, career stats
 */
import React, { useState } from 'react';
import { X, Shield, Award, Activity, Heart, Smile, Sparkles } from 'lucide-react';
import { Player } from '../types/player';
import { FRANCHISES } from '../data/franchises';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerProfileModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ player, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTRIBUTES' | 'STATS' | 'CONTRACT'>('OVERVIEW');

  if (!isOpen || !player) return null;

  const franchise = player.originalFranchiseId
    ? FRANCHISES.find(f => f.id === player.originalFranchiseId)
    : null;

  // Tier color styling
  const tierColor = {
    Platinum: 'text-cyan-400 border-cyan-400 bg-cyan-400/10',
    Diamond: 'text-amber-400 border-amber-400 bg-amber-400/10',
    Gold: 'text-yellow-300 border-yellow-300 bg-yellow-300/10',
    Silver: 'text-slate-200 border-slate-300 bg-slate-300/10',
    Bronze: 'text-amber-600 border-amber-600 bg-amber-600/10',
  }[player.ratingTier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0C1425] border border-[#1E2D4A] rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-[#121E36] p-4 border-b border-[#1E2D4A] relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#0C1425] border border-[#1E2D4A] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            {/* Persistent Role-Based Player Avatar */}
            <div className="relative">
              <PlayerAvatar
                player={player}
                size={64}
                jerseyColor={franchise?.primaryColor}
                showRoleBadge
              />
              <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.2 rounded bg-[#080E1A] border border-[#1E2D4A] font-bold text-slate-200">
                {player.nationality || 'N/A'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{player.name}</h2>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {player.primaryRole}{player.age ? ` · ${player.age} yrs` : ''} · {player.battingHand || 'N/A'}
              </p>
              
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {franchise && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${franchise.primaryColor}22`,
                      borderColor: franchise.primaryColor,
                      color: franchise.primaryColor,
                    }}
                  >
                    {franchise.name}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tierColor}`}>
                  {player.ratingTier} Tier
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1A2846] text-slate-300 border border-[#2A3C60]">
                  {player.isCapped ? 'Capped' : 'Uncapped'}
                </span>
                {player.isReal ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    IPL 2026
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    Fictional
                  </span>
                )}
              </div>
            </div>

            {/* OVR Badge */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#080E1A] border border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <span className="font-mono text-2xl font-black text-amber-400 leading-none">
                {player.overallRating}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">OVR</span>
            </div>
          </div>

          {/* Tri-Gauge Condition Meters (Form, Morale, Fitness) */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1E2D4A]/60">
            {/* Form */}
            <div className="p-2 rounded-xl bg-[#0C1425] border border-[#1E2D4A] flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 bg-emerald-400/10 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
                {player.currentForm}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Form</span>
                <span className="text-xs font-semibold text-emerald-400">
                  {player.currentForm >= 80 ? 'Peak' : 'Good'}
                </span>
              </div>
            </div>

            {/* Morale */}
            <div className="p-2 rounded-xl bg-[#0C1425] border border-[#1E2D4A] flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                9/10
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Morale</span>
                <span className="text-xs font-semibold text-amber-400">High</span>
              </div>
            </div>

            {/* Fitness */}
            <div className="p-2 rounded-xl bg-[#0C1425] border border-[#1E2D4A] flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
                {player.fitness}%
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Fitness</span>
                <span className="text-xs font-semibold text-emerald-400">100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#1E2D4A] bg-[#0C1425] px-3 pt-2 gap-1">
          {(['OVERVIEW', 'ATTRIBUTES', 'STATS', 'CONTRACT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-[#F59E0B] text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2 text-xs">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-3">
              {/* Cricket Traits */}
              <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cricket Profile
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bowling Type</span>
                    <span className="font-semibold text-white">{player.bowlingType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Speed / Class</span>
                    <span className="font-semibold text-white">{player.bowlingSpeedClass || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Batting Hand</span>
                    <span className="font-semibold text-white">{player.battingHand || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Wicketkeeper</span>
                    <span className="font-semibold text-white">{player.isWicketkeeper ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Potential & Experience */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Potential Ceiling</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-mono text-xl font-bold text-amber-400">{player.potentialRating}</span>
                    <span className="text-[10px] text-slate-400">/ 99 MAX</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Experience Level</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-mono text-xl font-bold text-blue-400">{player.experience}</span>
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Quick Key Attributes preview */}
              <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Core Competencies
                </h4>
                <div className="space-y-1.5">
                  <StatBar label="Batting Timing" value={player.batting.timing} />
                  <StatBar label="Power & Hitting" value={player.batting.power} />
                  {player.paceBowling && (
                    <>
                      <StatBar label="Pace Speed" value={player.paceBowling.speed} color="amber" />
                      <StatBar label="Death Bowling" value={player.paceBowling.deathBowling} color="amber" />
                    </>
                  )}
                  {player.spinBowling && (
                    <>
                      <StatBar label="Spin Turn" value={player.spinBowling.turn} color="blue" />
                      <StatBar label="Accuracy & Control" value={player.spinBowling.control} color="blue" />
                    </>
                  )}
                  <StatBar label="Fielding Catching" value={player.fielding.catching} color="emerald" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ATTRIBUTES' && (
            <div className="space-y-3">
              {/* Batting Attributes */}
              <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Batting Attributes (1-99)
                </h4>
                <div className="space-y-1.5">
                  <StatBar label="Timing" value={player.batting.timing} />
                  <StatBar label="Raw Power" value={player.batting.power} />
                  <StatBar label="Technique" value={player.batting.technique} />
                  <StatBar label="Pace Handling" value={player.batting.paceHandling} />
                  <StatBar label="Spin Handling" value={player.batting.spinHandling} />
                  <StatBar label="Finishing Intent" value={player.batting.finishing} />
                  <StatBar label="Running Between Wickets" value={player.batting.runningBetweenWickets} />
                </div>
              </div>

              {/* Bowling Attributes (Role Specific) */}
              {player.paceBowling && (
                <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                  <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    Pace Bowling Attributes (1-99)
                  </h4>
                  <div className="space-y-1.5">
                    <StatBar label="Speed Velocity" value={player.paceBowling.speed} color="blue" />
                    <StatBar label="Swing Movement" value={player.paceBowling.swing} color="blue" />
                    <StatBar label="Seam Deviation" value={player.paceBowling.seam} color="blue" />
                    <StatBar label="Control & Discipline" value={player.paceBowling.control} color="blue" />
                    <StatBar label="Variations & Slower Balls" value={player.paceBowling.variations} color="blue" />
                    <StatBar label="Death Overs Yorker Execution" value={player.paceBowling.deathBowling} color="blue" />
                  </div>
                </div>
              )}

              {player.spinBowling && (
                <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                  <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                    Spin Bowling Attributes (1-99)
                  </h4>
                  <div className="space-y-1.5">
                    <StatBar label="Sharp Turn" value={player.spinBowling.turn} color="purple" />
                    <StatBar label="Flight & Deception" value={player.spinBowling.flight} color="purple" />
                    <StatBar label="Pitching Accuracy" value={player.spinBowling.accuracy} color="purple" />
                    <StatBar label="Line & Length Control" value={player.spinBowling.control} color="purple" />
                    {player.spinBowling.variationType && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Specialist Variation</span>
                        <span className="font-bold text-white px-2 py-0.5 rounded bg-[#1A2846] border border-[#2A3C60]">
                          {player.spinBowling.variationType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fielding & Mental */}
              <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Fielding & Mental Fortitude
                </h4>
                <div className="space-y-1.5">
                  <StatBar label="Catching Reflexes" value={player.fielding.catching} color="emerald" />
                  <StatBar label="Throwing Arm Strength" value={player.fielding.throwing} color="emerald" />
                  <StatBar label="Ground Agility" value={player.fielding.agility} color="emerald" />
                  {player.fielding.wicketkeeping && (
                    <StatBar label="Wicketkeeping Mastery" value={player.fielding.wicketkeeping} color="amber" />
                  )}
                  <StatBar label="Match Pressure Handling" value={player.mental.pressureHandling} />
                  <StatBar label="Consistency" value={player.mental.consistency} />
                  <StatBar label="Leadership Presence" value={player.mental.leadership} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STATS' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  T20 Career Statistics
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Matches</span>
                    <span className="font-mono text-sm font-bold text-white">{player.careerStats.matches ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Total Runs</span>
                    <span className="font-mono text-sm font-bold text-amber-400">{player.careerStats.runs ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Highest Score</span>
                    <span className="font-mono text-sm font-bold text-white">{player.careerStats.highestScore ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Batting Avg</span>
                    <span className="font-mono text-sm font-bold text-white">{player.careerStats.battingAverage ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Strike Rate</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">{player.careerStats.strikeRate ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">50s / 100s</span>
                    <span className="font-mono text-sm font-bold text-white">{player.careerStats.fifties ?? '—'} / {player.careerStats.hundreds ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Wickets</span>
                    <span className="font-mono text-sm font-bold text-blue-400">{player.careerStats.wickets ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Best Bowling</span>
                    <span className="font-mono text-sm font-bold text-white">{player.careerStats.bestBowling ?? '—'}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0C1425]">
                    <span className="text-slate-400 text-[10px] block">Economy</span>
                    <span className="font-mono text-sm font-bold text-white">{player.careerStats.economy ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CONTRACT' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Auction & Valuation Data
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]">
                    <span className="text-slate-400">Base Auction Price</span>
                    <span className="font-mono font-bold text-white">₹{player.contract.baseAuctionPriceCr.toFixed(2)} Cr</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]">
                    <span className="text-slate-400">Salary Expectation</span>
                    <span className="font-mono font-bold text-amber-400">₹{player.contract.salaryExpectationCr.toFixed(2)} Cr</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1E2D4A]">
                    <span className="text-slate-400">Contract Status</span>
                    <span className="font-bold text-emerald-400">{player.contract.contractStatus}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Original 2026 IPL Franchise</span>
                    <span className="font-bold text-white">{franchise ? franchise.name : 'Unassigned Pool'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-[#080E1A] border-t border-[#1E2D4A]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-xs uppercase tracking-wider text-slate-950 active:scale-[0.98] transition-transform shadow-md"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color?: 'gold' | 'blue' | 'purple' | 'emerald' | 'amber' }> = ({
  label,
  value,
  color = 'gold',
}) => {
  const colorMap = {
    gold: 'from-amber-500 to-yellow-400 text-amber-400',
    blue: 'from-blue-500 to-sky-400 text-sky-400',
    purple: 'from-purple-500 to-indigo-400 text-purple-400',
    emerald: 'from-emerald-500 to-teal-400 text-emerald-400',
    amber: 'from-amber-600 to-amber-400 text-amber-400',
  }[color];

  return (
    <div>
      <div className="flex justify-between items-center text-[11px] mb-0.5">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className={`font-mono font-bold ${colorMap.split(' ')[2]}`}>{value}</span>
      </div>
      <div className="w-full h-1.5 bg-[#0C1425] rounded-full overflow-hidden border border-[#1E2D4A]/50">
        <div
          className={`h-full bg-gradient-to-r ${colorMap.split(' ')[0]} ${colorMap.split(' ')[1]} rounded-full`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
};
