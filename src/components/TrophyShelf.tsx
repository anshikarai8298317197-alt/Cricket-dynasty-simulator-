/**
 * WICKET DYNASTY - Animated Trophy Shelf Component
 * Showcases unlocked and locked franchise trophies using CSS transitions and metallic hover effects.
 */
import React, { useState } from 'react';
import { Trophy, Crown, Shield, Award, Flame, Star, Lock } from 'lucide-react';
import { CareerSave } from '../types/career';
import { TournamentState } from '../types/tournament';
import { ClubProfile } from '../types/club';

interface TrophyShelfProps {
  career: CareerSave;
  tournament: TournamentState;
  profile: ClubProfile;
}

interface ShelfTrophy {
  id: string;
  name: string;
  subtitle: string;
  tier: 'GOLD' | 'SILVER' | 'BRONZE' | 'PLATINUM';
  unlocked: boolean;
  count?: number;
  unlockDetail: string;
  icon: 'CUP' | 'CROWN' | 'SHIELD' | 'ORANGE' | 'PURPLE' | 'STAR';
}

export const TrophyShelf: React.FC<TrophyShelfProps> = ({
  career,
  tournament,
  profile,
}) => {
  const [selectedTrophyId, setSelectedTrophyId] = useState<string | null>(null);

  const permanentTrophies = career.trophiesCollected || [];
  const gclTrophies = permanentTrophies.filter(t => t.competitionId === 'GCL_T20').length;
  const totalTrophies = Math.max(
    career.statsSummary?.trophies || 0,
    permanentTrophies.length,
    (profile.seasonHistory || []).filter(s => s.championFranchiseId === career.franchiseId).length +
      (tournament.playoffs?.championFranchiseId === career.franchiseId ? 1 : 0)
  );

  const completedUserMatches = (tournament.fixtures || []).filter(
    f => f.isCompleted && (f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId)
  );
  const seasonWins = completedUserMatches.filter(f => f.winnerFranchiseId === career.franchiseId).length;
  const totalWins = Math.max(career.statsSummary?.matchesWon || 0, seasonWins);

  const isTableTopper =
    (tournament.pointsTable?.[0]?.franchiseId === career.franchiseId && (tournament.pointsTable?.[0]?.played || 0) >= 3) ||
    (profile.seasonHistory || []).some(s => s.userFinishPosition === 1);

  const franchiseStats = Object.values(tournament.playerStats || {});
  const topRunsOverall = [...franchiseStats].sort((a, b) => b.runs - a.runs)[0];
  const topWktsOverall = [...franchiseStats].sort((a, b) => b.wickets - a.wickets)[0];

  const hasOrangeCap =
    (topRunsOverall && topRunsOverall.runs > 0 && topRunsOverall.franchiseId === career.franchiseId) ||
    (profile.seasonHistory || []).some(s => s.orangeCapWinner?.franchiseId === career.franchiseId);

  const hasPurpleCap =
    (topWktsOverall && topWktsOverall.wickets > 0 && topWktsOverall.franchiseId === career.franchiseId) ||
    (profile.seasonHistory || []).some(s => s.purpleCapWinner?.franchiseId === career.franchiseId);

  const trophies: ShelfTrophy[] = [
    {
      id: 'champions_cup',
      name: 'Dynasty Cup',
      subtitle: 'T20 Champions',
      tier: 'GOLD',
      unlocked: totalTrophies >= 1,
      count: totalTrophies,
      unlockDetail:
        totalTrophies >= 1
          ? `Lifted ${totalTrophies} Championship ${totalTrophies === 1 ? 'Trophy' : 'Trophies'}`
          : 'Win the T20 League Final to unlock',
      icon: 'CUP',
    },
    {
      id: 'gcl_world_crown',
      name: 'GCL World Crown',
      subtitle: 'Global T20',
      tier: 'PLATINUM',
      unlocked: gclTrophies >= 1,
      count: gclTrophies,
      unlockDetail:
        gclTrophies >= 1
          ? `Lifted ${gclTrophies} Global Champions League Crown`
          : 'Win the Global Champions League T20 Grand Final',
      icon: 'CROWN',
    },
    {
      id: 'table_toppers_mace',
      name: 'Table Toppers',
      subtitle: '#1 Seed Honor',
      tier: 'SILVER',
      unlocked: isTableTopper,
      unlockDetail: isTableTopper ? 'Reached #1 in the League Points Table' : 'Lead the standings (min. 3 games)',
      icon: 'STAR',
    },
    {
      id: 'orange_cap_honour',
      name: 'Orange Cap',
      subtitle: 'Leading Scorer',
      tier: 'GOLD',
      unlocked: Boolean(hasOrangeCap),
      unlockDetail: hasOrangeCap
        ? 'Your franchise holds the Top Run-Scorer cap'
        : 'Have a squad batter lead the Orange Cap race',
      icon: 'ORANGE',
    },
    {
      id: 'purple_cap_honour',
      name: 'Purple Cap',
      subtitle: 'Leading Bowler',
      tier: 'PLATINUM',
      unlocked: Boolean(hasPurpleCap),
      unlockDetail: hasPurpleCap
        ? 'Your franchise holds the Top Wicket-Taker cap'
        : 'Have a squad bowler lead the Purple Cap race',
      icon: 'PURPLE',
    },
    {
      id: 'maiden_win_chalice',
      name: totalTrophies >= 2 ? 'Dynasty Era' : 'Victory Chalice',
      subtitle: totalTrophies >= 2 ? `${totalTrophies} Titles` : `${totalWins} Wins`,
      tier: totalTrophies >= 2 ? 'PLATINUM' : 'BRONZE',
      unlocked: totalWins >= 1 || totalTrophies >= 2,
      unlockDetail:
        totalTrophies >= 2
          ? `${totalTrophies} Championships — Certified Dynasty`
          : totalWins >= 1
          ? `${totalWins} Franchise Victories Recorded`
          : 'Win your first match in the league',
      icon: 'SHIELD',
    },
  ];

  const unlockedCount = trophies.filter(t => t.unlocked).length;
  const activeTrophy = trophies.find(t => t.id === selectedTrophyId) || trophies.find(t => t.unlocked) || trophies[0];

  const renderTrophyIcon = (trophy: ShelfTrophy) => {
    const colorCls = !trophy.unlocked
      ? 'text-slate-600'
      : trophy.tier === 'PLATINUM'
      ? 'text-cyan-200 drop-shadow-[0_0_8px_rgba(165,243,252,0.8)]'
      : trophy.tier === 'GOLD'
      ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]'
      : trophy.tier === 'SILVER'
      ? 'text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.7)]'
      : 'text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.7)]';

    switch (trophy.icon) {
      case 'CUP':
        return <Trophy className={`w-7 h-7 transition-transform duration-300 group-hover:scale-110 ${colorCls}`} />;
      case 'CROWN':
        return <Crown className={`w-7 h-7 transition-transform duration-300 group-hover:scale-110 ${colorCls}`} />;
      case 'SHIELD':
        return <Shield className={`w-7 h-7 transition-transform duration-300 group-hover:scale-110 ${colorCls}`} />;
      case 'ORANGE':
        return <Flame className={`w-7 h-7 transition-transform duration-300 group-hover:scale-110 ${colorCls}`} />;
      case 'PURPLE':
        return <Award className={`w-7 h-7 transition-transform duration-300 group-hover:scale-110 ${colorCls}`} />;
      default:
        return <Star className={`w-7 h-7 transition-transform duration-300 group-hover:scale-110 ${colorCls}`} />;
    }
  };

  return (
    <div className="card-game-3d rounded-2xl p-4 space-y-3">
      {/* Shelf Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Franchise Trophy Shelf
            </h3>
            <p className="text-[10px] text-slate-400">Hover or tap any cabinet to inspect silverware</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300">
          {unlockedCount}/{trophies.length} Unlocked
        </span>
      </div>

      {/* Display Cabinet Shelves (2 Rows of 3 Pedestals with Metallic Ledge) */}
      <div className="space-y-2.5">
        {[trophies.slice(0, 3), trophies.slice(3, 6)].map((row, rowIdx) => (
          <div key={rowIdx} className="space-y-1">
            <div className="grid grid-cols-3 gap-2">
              {row.map(trophy => {
                const isSelected = activeTrophy?.id === trophy.id;
                const metallicGradient = !trophy.unlocked
                  ? 'bg-[#091122]/85 border-slate-800/80 opacity-60'
                  : trophy.tier === 'PLATINUM'
                  ? 'bg-gradient-to-b from-cyan-900/45 via-[#13223D] to-[#0B1426] border-cyan-400/50'
                  : trophy.tier === 'GOLD'
                  ? 'bg-gradient-to-b from-amber-500/25 via-[#17233B] to-[#0B1426] border-amber-400/60'
                  : trophy.tier === 'SILVER'
                  ? 'bg-gradient-to-b from-slate-400/25 via-[#162238] to-[#0B1426] border-slate-300/50'
                  : 'bg-gradient-to-b from-orange-600/25 via-[#172136] to-[#0B1426] border-orange-400/50';

                return (
                  <button
                    key={trophy.id}
                    type="button"
                    onClick={() => setSelectedTrophyId(trophy.id)}
                    className={`group rounded-2xl border p-2.5 flex flex-col items-center text-center cursor-pointer ${
                      trophy.unlocked ? 'trophy-shelf-card' : 'trophy-shelf-card-locked'
                    } ${metallicGradient} ${isSelected ? 'ring-1 ring-amber-400/80' : ''}`}
                  >
                    {/* Count or Lock Corner Badge */}
                    {trophy.unlocked && trophy.count && trophy.count > 1 ? (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-black font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 shadow">
                        x{trophy.count}
                      </span>
                    ) : !trophy.unlocked ? (
                      <span className="absolute top-1.5 right-1.5 text-slate-600">
                        <Lock className="w-3 h-3" />
                      </span>
                    ) : null}

                    {/* Pedestal Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 border transition-colors duration-300 ${
                        trophy.unlocked
                          ? 'bg-slate-950/60 border-white/15 group-hover:border-amber-300/60'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      {renderTrophyIcon(trophy)}
                    </div>

                    <span
                      className={`text-[10px] font-black leading-tight truncate w-full ${
                        trophy.unlocked ? 'text-white group-hover:text-amber-200 transition-colors' : 'text-slate-400'
                      }`}
                    >
                      {trophy.name}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate w-full mt-0.5">
                      {trophy.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Brushed Metallic Shelf Ledge */}
            <div className="h-1.5 rounded-full bg-gradient-to-r from-slate-900 via-amber-500/35 to-slate-900 border-t border-white/15 shadow-md" />
          </div>
        ))}
      </div>

      {/* Selected Trophy Inspection Bar */}
      {activeTrophy && (
        <div className="p-2.5 rounded-xl bg-[#091120] border border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-400 block">
              {activeTrophy.name} · {activeTrophy.unlocked ? 'UNLOCKED' : 'LOCKED'}
            </span>
            <p className="text-[11px] text-slate-300 truncate">{activeTrophy.unlockDetail}</p>
          </div>
          <span
            className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
              activeTrophy.unlocked
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {activeTrophy.tier}
          </span>
        </div>
      )}
    </div>
  );
};
