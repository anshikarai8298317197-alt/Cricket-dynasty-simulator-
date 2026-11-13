/**
 * WICKET DYNASTY - Player Database Screen (SCR_07 browser / database hub)
 * Search, multi-dimensional filters, roster view, 320 players
 */
import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, UserCheck, Star, Users, ArrowUpDown } from 'lucide-react';
import { Player, PlayerRole, RatingTier } from '../types/player';
import { PLAYERS_DATABASE } from '../data/players';
import { FRANCHISES } from '../data/franchises';
import { PlayerProfileModal } from './PlayerProfileModal';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerDatabaseScreenProps {
  onBack: () => void;
  initialFranchiseFilter?: string | null;
}

export const PlayerDatabaseScreen: React.FC<PlayerDatabaseScreenProps> = ({
  onBack,
  initialFranchiseFilter = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFranchise, setSelectedFranchise] = useState<string>(initialFranchiseFilter || 'ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedRealStatus, setSelectedRealStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'OVR_DESC' | 'OVR_ASC' | 'AGE_ASC' | 'POT_DESC'>('OVR_DESC');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Filtered and sorted players
  const filteredPlayers = useMemo(() => {
    return PLAYERS_DATABASE.filter(p => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q) || p.shortName.toLowerCase().includes(q);
        const matchesNat = p.nationality.toLowerCase().includes(q);
        const matchesFran = p.originalFranchiseId?.toLowerCase().includes(q);
        if (!matchesName && !matchesNat && !matchesFran) return false;
      }

      // 2. Category / Tier Quick Pill
      if (selectedCategory === 'PLATINUM' && p.ratingTier !== 'Platinum') return false;
      if (selectedCategory === 'DIAMOND' && p.ratingTier !== 'Diamond') return false;
      if (selectedCategory === 'GOLD' && p.ratingTier !== 'Gold') return false;
      if (selectedCategory === 'SILVER' && p.ratingTier !== 'Silver') return false;
      if (selectedCategory === 'BRONZE' && p.ratingTier !== 'Bronze') return false;
      if (selectedCategory === 'IND_CAPPED' && (p.isOverseas || !p.isCapped)) return false;
      if (selectedCategory === 'IND_UNCAPPED' && (p.isOverseas || p.isCapped)) return false;
      if (selectedCategory === 'OVS_CAPPED' && (!p.isOverseas || !p.isCapped)) return false;
      if (selectedCategory === 'OVS_UNCAPPED' && (!p.isOverseas || p.isCapped)) return false;

      // 3. Franchise
      if (selectedFranchise !== 'ALL') {
        if (selectedFranchise === 'UNASSIGNED') {
          if (p.originalFranchiseId !== null) return false;
        } else if (p.originalFranchiseId !== selectedFranchise) {
          return false;
        }
      }

      // 4. Role
      if (selectedRole !== 'ALL' && p.primaryRole !== selectedRole) {
        return false;
      }

      // 5. Tier
      if (selectedTier !== 'ALL' && p.ratingTier !== selectedTier) {
        return false;
      }

      // 6. Real / Fictional
      if (selectedRealStatus === 'REAL' && !p.isReal) return false;
      if (selectedRealStatus === 'FICTIONAL' && p.isReal) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'OVR_DESC') return b.overallRating - a.overallRating;
      if (sortBy === 'OVR_ASC') return a.overallRating - b.overallRating;
      if (sortBy === 'AGE_ASC') return (a.age ?? 99) - (b.age ?? 99);
      if (sortBy === 'POT_DESC') return b.potentialRating - a.potentialRating;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedFranchise, selectedRole, selectedTier, selectedRealStatus, sortBy]);

  return (
    <div className="flex-1 flex flex-col bg-[#0C1425] text-white">
      {/* Search & Filter Header */}
      <div className="p-3 bg-[#121E36] border-b border-[#1E2D4A] space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 320 players by name, team, country..."
            className="w-full bg-[#080E1A] border border-[#1E2D4A] focus:border-[#F59E0B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {[
            { id: 'ALL', label: 'All (320)' },
            { id: 'PLATINUM', label: 'Platinum (13)' },
            { id: 'DIAMOND', label: 'Diamond (27)' },
            { id: 'GOLD', label: 'Gold (80)' },
            { id: 'SILVER', label: 'Silver (100)' },
            { id: 'BRONZE', label: 'Bronze (100)' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#F59E0B] text-slate-950 shadow-md'
                  : 'bg-[#080E1A] text-slate-400 hover:text-white border border-[#1E2D4A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-4 gap-1.5 text-[11px]">
          {/* Franchise */}
          <select
            value={selectedFranchise}
            onChange={e => setSelectedFranchise(e.target.value)}
            className="bg-[#080E1A] border border-[#1E2D4A] rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="ALL">All Teams</option>
            {FRANCHISES.map(f => (
              <option key={f.id} value={f.id}>
                {f.shortName} ({f.name})
              </option>
            ))}
            <option value="UNASSIGNED">Free / Unassigned</option>
          </select>

          {/* Role */}
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="bg-[#080E1A] border border-[#1E2D4A] rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="ALL">All Roles</option>
            <option value="Opening Batter">Opening Batter</option>
            <option value="Top-order Batter">Top-order Batter</option>
            <option value="Middle-order Batter">Middle-order Batter</option>
            <option value="Finisher">Finisher</option>
            <option value="Wicketkeeper Batter">Wicketkeeper Batter</option>
            <option value="Batting All-rounder">Batting All-rounder</option>
            <option value="Pace All-rounder">Pace All-rounder</option>
            <option value="Spin All-rounder">Spin All-rounder</option>
            <option value="Express Fast Bowler">Express Fast Bowler</option>
            <option value="Fast Bowler">Fast Bowler</option>
            <option value="Fast-Medium Bowler">Fast-Medium Bowler</option>
            <option value="Swing Bowler">Swing Bowler</option>
            <option value="Death-over Specialist">Death-over Specialist</option>
            <option value="Leg Spinner">Leg Spinner</option>
            <option value="Off Spinner">Off Spinner</option>
            <option value="Left-arm Orthodox Spinner">Left-arm Orthodox</option>
            <option value="Wrist Spinner">Wrist Spinner</option>
          </select>

          {/* Tier */}
          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            className="bg-[#080E1A] border border-[#1E2D4A] rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="ALL">All Tiers</option>
            <option value="Platinum">Platinum (90-99)</option>
            <option value="Diamond">Diamond (85-89)</option>
            <option value="Gold">Gold (80-84)</option>
            <option value="Silver">Silver (70-79)</option>
            <option value="Bronze">Bronze (60-69)</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#080E1A] border border-[#1E2D4A] rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="OVR_DESC">OVR (High)</option>
            <option value="OVR_ASC">OVR (Low)</option>
            <option value="POT_DESC">Potential</option>
            <option value="AGE_ASC">Youngest</option>
          </select>
        </div>
      </div>

      {/* Results Telemetry Bar */}
      <div className="px-4 py-2 bg-[#080E1A] border-b border-[#1E2D4A] flex justify-between items-center text-[11px] text-slate-400">
        <span>
          Showing <strong className="text-amber-400 font-mono">{filteredPlayers.length}</strong> of 320 players
        </span>
        <span className="text-[10px] text-slate-400">Tap player to inspect full attributes</span>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredPlayers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-bold text-sm">No cricketers match active filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting search or category parameters</p>
          </div>
        ) : (
          filteredPlayers.map(player => {
            const franchise = player.originalFranchiseId
              ? FRANCHISES.find(f => f.id === player.originalFranchiseId)
              : null;

            const tierBadge = {
              Platinum: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/40',
              Diamond: 'bg-amber-400/10 text-amber-400 border-amber-400/40',
              Gold: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/40',
              Silver: 'bg-slate-300/10 text-slate-300 border-slate-300/40',
              Bronze: 'bg-amber-600/10 text-amber-500 border-amber-600/40',
            }[player.ratingTier];

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="p-3 rounded-xl bg-[#121E36] border border-[#1E2D4A] hover:border-[#F59E0B]/50 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between gap-3 shadow"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar
                    player={player}
                    size={44}
                    jerseyColor={franchise?.primaryColor}
                    showRoleBadge={false}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-white truncate">{player.name}</h3>
                      <span className="text-[10px] font-bold text-slate-400 px-1 py-0.2 rounded bg-[#080E1A]">
                        {player.nationality || 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {player.primaryRole}{player.age ? ` · ${player.age} yrs` : ''}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {franchise ? (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${franchise.primaryColor}22`,
                            borderColor: franchise.primaryColor,
                            color: franchise.primaryColor,
                          }}
                        >
                          {franchise.shortName}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          Unassigned
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${tierBadge}`}>
                        {player.ratingTier}
                      </span>
                      {player.isReal ? (
                        <span className="text-[9px] text-amber-400">IPL '26</span>
                      ) : (
                        <span className="text-[9px] text-blue-400">Fictional</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: OVR & Value */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="px-2.5 py-1 rounded-lg bg-[#080E1A] border border-[#F59E0B]/50 flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">OVR</span>
                    <span className="font-mono text-base font-black text-amber-400 leading-none">
                      {player.overallRating}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">
                    Base ₹{player.contract.baseAuctionPriceCr.toFixed(2)} Cr
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
};
