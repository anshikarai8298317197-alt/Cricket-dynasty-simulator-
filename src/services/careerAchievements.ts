import { CareerSave } from '../types/career';
import { Player } from '../types/player';

export interface CareerAchievement {
  id: string;
  title: string;
  description: string;
  category: 'MATCHES' | 'TROPHIES' | 'SQUAD' | 'MANAGEMENT';
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  currentValue: number;
  targetValue: number;
  unit?: string;
  isUnlocked: boolean;
  unlockedLabel: string;
}

export function evaluateCareerAchievements(career: CareerSave, squadPlayers: Player[]): CareerAchievement[] {
  const matchesWon = career.statsSummary?.matchesWon || 0;
  const matchesPlayed = career.statsSummary?.matchesPlayed || 0;
  const trophies = career.statsSummary?.trophies || 0;

  // Calculate Average Squad Rating
  const avgOvr = squadPlayers.length > 0
    ? Math.round(squadPlayers.reduce((sum, p) => sum + p.overallRating, 0) / squadPlayers.length)
    : 0;

  // Win rate
  const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;

  // Stadium facility level
  const stadiumTier = career.clubProfile?.facilities?.stadium?.tier || 1;

  return [
    {
      id: 'first_win',
      title: 'First Victory',
      description: "Record your franchise's first match victory in the league",
      category: 'MATCHES',
      icon: '🏏',
      tier: 'BRONZE',
      currentValue: Math.min(1, matchesWon),
      targetValue: 1,
      isUnlocked: matchesWon >= 1,
      unlockedLabel: matchesWon >= 1 ? 'Unlocked' : `${matchesWon}/1 Win`,
    },
    {
      id: 'ten_wins',
      title: '10 Wins Club',
      description: 'Reach 10 match victories across your management career',
      category: 'MATCHES',
      icon: '🔥',
      tier: 'SILVER',
      currentValue: Math.min(10, matchesWon),
      targetValue: 10,
      isUnlocked: matchesWon >= 10,
      unlockedLabel: matchesWon >= 10 ? 'Unlocked' : `${matchesWon}/10 Wins`,
    },
    {
      id: 'first_trophy',
      title: 'First Silverware',
      description: 'Crown your team champions and lift your first league trophy',
      category: 'TROPHIES',
      icon: '🏆',
      tier: 'GOLD',
      currentValue: Math.min(1, trophies),
      targetValue: 1,
      isUnlocked: trophies >= 1,
      unlockedLabel: trophies >= 1 ? 'Unlocked' : `${trophies}/1 Trophy`,
    },
    {
      id: 'top_squad_rating',
      title: 'Top Squad Rating',
      description: 'Assemble a world-class squad with an average rating of 85+ OVR',
      category: 'SQUAD',
      icon: '⭐',
      tier: 'PLATINUM',
      currentValue: avgOvr,
      targetValue: 85,
      unit: 'OVR',
      isUnlocked: avgOvr >= 85,
      unlockedLabel: avgOvr >= 85 ? 'Unlocked' : `${avgOvr}/85 OVR`,
    },
    {
      id: 'tactical_master',
      title: 'Tactical Master',
      description: 'Maintain a 65%+ win rate with at least 5 matches played',
      category: 'MANAGEMENT',
      icon: '🎯',
      tier: 'SILVER',
      currentValue: winRate,
      targetValue: 65,
      unit: '%',
      isUnlocked: matchesPlayed >= 5 && winRate >= 65,
      unlockedLabel: matchesPlayed >= 5 && winRate >= 65 ? 'Unlocked' : `${winRate}% (Min 5 Matches)`,
    },
    {
      id: 'stadium_tycoon',
      title: 'Stadium Tycoon',
      description: 'Upgrade your home stadium facilities to Level 3 or higher',
      category: 'MANAGEMENT',
      icon: '🏟️',
      tier: 'GOLD',
      currentValue: stadiumTier,
      targetValue: 3,
      unit: 'Lvl',
      isUnlocked: stadiumTier >= 3,
      unlockedLabel: stadiumTier >= 3 ? 'Unlocked' : `Tier ${stadiumTier}/3`,
    },
  ];
}
