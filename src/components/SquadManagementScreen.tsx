/**
 * WICKET DYNASTY - Squad Management Screen (SCR_10)
 * Roster breakdown, role telemetry, team balance bars, and playing XI link
 */
import React, { useState, useMemo } from 'react';
import { Users, Shield, Award, AlertTriangle, ArrowRight, Search, Filter } from 'lucide-react';
import { CareerSave } from '../types/career';
import { FRANCHISES } from '../data/franchises';
import { PLAYERS_DATABASE } from '../data/players';
import { Player } from '../types/player';
import { PlayerProfileModal } from './PlayerProfileModal';
import { FranchiseLogo } from './FranchiseLogo';
import { PlayerAvatar } from './PlayerAvatar';

interface SquadManagementScreenProps {
  career: CareerSave;
  onSelectPlayingXI: () => void;
  onBack: () => void;
}

export const SquadManagementScreen: React.FC<SquadManagementScreenProps> = ({
  career,
  onSelectPlayingXI,
  onBack,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const franchise = FRANCHISES.find(f => f.id === career.franchiseId) || FRANCHISES[0];
  const squadPlayers = useMemo(() => {
    return PLAYERS_DATABASE.filter(p => career.squadPlayerIds.includes(p.id));
  }, [career.squadPlayerIds]);

  const overseasCount = squadPlayers.filter(p => p.isOverseas).length;
  const indianCount = squadPlayers.length - overseasCount;

  // Role categorization counts
  const batterCount = squadPlayers.filter(p => p.primaryRole.includes('Batter') || p.primaryRole.includes('Opener') || p.primaryRole.includes('Finisher')).length;
  const keeperCount = squadPlayers.filter(p => p.isWicketkeeper).length;
  const allRounderCount = squadPlayers.filter(p => p.primaryRole.includes('All-rounder')).length;
  const paceCount = squadPlayers.filter(p => p.primaryRole.includes('Fast') || p.primaryRole.includes('Pace') || p.primaryRole.includes('Swing') || p.primaryRole.includes('Death')).length;
  const spinCount = squadPlayers.filter(p => p.primaryRole.includes('Spin') || p.primaryRole.includes('Orthodox')).length;

  // Team Balance ratings
  const avgBatting = squadPlayers.length > 0
    ? Math.round(squadPlayers.reduce((sum, p) => sum + p.batting.timing, 0) / squadPlayers.length)
    : 80;
  const avgBowling = squadPlayers.length > 0
    ? Math.round(squadPlayers.reduce((sum, p) => sum + (p.paceBowling?.speed || p.spinBowling?.turn || 50), 0) / squadPlayers.length)
    : 80;
  const avgFielding = squadPlayers.length > 0
    ? Math.round(squadPlayers.reduce((sum, p) => sum + p.fielding.catching, 0) / squadPlayers.length)
    : 82;
  const avgAllround = Math.round((avgBatting + avgBowling) / 2);

  // Missing requirements check
  const missingRequirements: string[] = [];
  if (squadPlayers.length < 18) missingRequirements.push(`Need at least ${18 - squadPlayers.length} more players to reach minimum 18.`);
  if (keeperCount === 0) missingRequirements.push('Squad requires at least 1 designated Wicketkeeper.');
  if (overseasCount > 8) missingRequirements.push('Exceeded limit of 8 overseas players in squad.');

  // Filtered squad list
  const filteredSquad = squadPlayers.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.shortName.toLowerCase().includes(q)) return false;
    }
    if (roleFilter === 'BAT' && !p.primaryRole.includes('Batter') && !p.primaryRole.includes('Opener') && !p.primaryRole.includes('Finisher')) return false;
    if (roleFilter === 'WK' && !p.isWicketkeeper) return false;
    if (roleFilter === 'AR' && !p.primaryRole.includes('All-rounder')) return false;
    if (roleFilter === 'PACE' && !p.primaryRole.includes('Fast') && !p.primaryRole.includes('Pace') && !p.primaryRole.includes('Swing') && !p.primaryRole.includes('Death')) return false;
    if (roleFilter === 'SPIN' && !p.primaryRole.includes('Spin') && !p.primaryRole.includes('Orthodox')) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0C1425] text-white">
      {/* Header Info Banner */}
      <div className="p-3.5 bg-[#121E36] border-b border-[#1E2D4A] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FranchiseLogo franchiseId={franchise.id} size={40} />
            <div>
              <h2 className="text-base font-bold text-white">{franchise.name} Roster</h2>
              <p className="text-[11px] text-slate-300">
                {squadPlayers.length} Players ({indianCount} Indian · {overseasCount} Overseas)
              </p>
            </div>
          </div>

          <button
            onClick={onSelectPlayingXI}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95"
          >
            <span>Playing XI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Team Balance Progress Bars (Matches Reference Image Screen 4) */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1E2D4A]/60">
          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>Batting</span>
              <span className="font-mono font-bold text-amber-400">{avgBatting}</span>
            </div>
            <div className="w-full h-1.5 bg-[#080E1A] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${avgBatting}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>Bowling</span>
              <span className="font-mono font-bold text-blue-400">{avgBowling}</span>
            </div>
            <div className="w-full h-1.5 bg-[#080E1A] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400" style={{ width: `${avgBowling}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>All-round</span>
              <span className="font-mono font-bold text-purple-400">{avgAllround}</span>
            </div>
            <div className="w-full h-1.5 bg-[#080E1A] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400" style={{ width: `${avgAllround}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
              <span>Fielding</span>
              <span className="font-mono font-bold text-emerald-400">{avgFielding}</span>
            </div>
            <div className="w-full h-1.5 bg-[#080E1A] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${avgFielding}%` }} />
            </div>
          </div>
        </div>

        {/* Missing Rules Warning (if any) */}
        {missingRequirements.length > 0 && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] space-y-1">
            <div className="flex items-center gap-1 font-bold text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Squad Validation Notice:</span>
            </div>
            {missingRequirements.map((err, idx) => (
              <p key={idx} className="pl-4 text-[10px]">• {err}</p>
            ))}
          </div>
        )}
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#080E1A] border-b border-[#1E2D4A] overflow-x-auto scrollbar-none text-[11px]">
        {[
          { id: 'ALL', label: `All (${squadPlayers.length})` },
          { id: 'BAT', label: `Bat (${batterCount})` },
          { id: 'WK', label: `WK (${keeperCount})` },
          { id: 'AR', label: `AR (${allRounderCount})` },
          { id: 'PACE', label: `Pace (${paceCount})` },
          { id: 'SPIN', label: `Spin (${spinCount})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
              roleFilter === tab.id
                ? 'bg-[#F59E0B] text-slate-950 font-bold'
                : 'bg-[#121E36] text-slate-400 hover:text-white border border-[#1E2D4A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Squad Player Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSquad.map(player => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] hover:border-[#F59E0B]/50 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <PlayerAvatar player={player} size={36} jerseyColor={franchise.primaryColor} showRoleBadge={false} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white">{player.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400 px-1 rounded bg-[#080E1A]">
                    {player.nationality || 'N/A'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {player.primaryRole}
                  {player.age ? ` · ${player.age} yrs` : ''}
                  {player.battingHand ? ` · ${player.battingHand}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">
                  ₹{player.contract.salaryExpectationCr.toFixed(1)} Cr
                </span>
                <span className="text-[9px] text-emerald-400 font-bold">Fit {player.fitness ?? 100}%</span>
              </div>
              <span className="font-mono text-sm font-black px-2 py-0.5 rounded bg-[#080E1A] text-amber-400 border border-[#F59E0B]/30">
                {player.overallRating}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3.5 bg-[#080E1A] border-t border-[#1E2D4A] flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-[#121E36] hover:bg-[#1A2846] border border-[#1E2D4A] font-bold text-xs uppercase tracking-wider text-slate-300"
        >
          Back
        </button>
        <button
          onClick={onSelectPlayingXI}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] font-black text-xs uppercase tracking-wider text-slate-950 shadow-md flex items-center justify-center gap-1.5"
        >
          <span>Select Playing XI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
};
