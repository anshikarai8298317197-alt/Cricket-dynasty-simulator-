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
  const permanentTrophies = career.trophiesCollected || [];
  const trophies = Math.max(career.statsSummary?.trophies || 0, permanentTrophies.length);
  const unlockedSet = new Set<string>(career.unlockedAchievementIds || []);

  const gclTrophyCount = permanentTrophies.filter(t => t.competitionId === 'GCL_T20').length;
  const hasPlayoffAppearance = Boolean(
    unlockedSet.has('playoff_qualifier') ||
    career.tournament?.fixtures?.some(
      (f: { playoffStage: string; homeFranchiseId: string; awayFranchiseId: string }) =>
        f.playoffStage !== 'NONE' &&
        (f.homeFranchiseId === career.franchiseId || f.awayFranchiseId === career.franchiseId)
    )
  );
  const hasGclQualification = Boolean(
    unlockedSet.has('gcl_qualifier') ||
    career.worldSeason?.championsLeague?.qualifiedParticipants?.some(
      p => p.teamId === career.franchiseId
    )
  );

  // Calculate Average Squad Rating
  const avgOvr = squadPlayers.length > 0
    ? Math.round(squadPlayers.reduce((sum, p) => sum + p.overallRating, 0) / squadPlayers.length)
    : 0;

  // Win rate
  const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;

  // Stadium facility level
  const stadiumTier = career.clubProfile?.facilities?.stadium?.tier || 1;

  const list: CareerAchievement[] = [
    {
      id: 'first_win',
      title: 'First Victory',
      description: "Record your franchise's first match victory in the league",
      category: 'MATCHES',
      icon: '🏏',
      tier: 'BRONZE',
      currentValue: Math.min(1, matchesWon),
      targetValue: 1,
      isUnlocked: unlockedSet.has('first_win') || matchesWon >= 1,
      unlockedLabel: unlockedSet.has('first_win') || matchesWon >= 1 ? 'Unlocked' : `${matchesWon}/1 Win`,
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
      isUnlocked: unlockedSet.has('ten_wins') || matchesWon >= 10,
      unlockedLabel: unlockedSet.has('ten_wins') || matchesWon >= 10 ? 'Unlocked' : `${matchesWon}/10 Wins`,
    },
    {
      id: 'fifty_matches',
      title: 'Veteran Skipper',
      description: 'Manage 50 competitive franchise T20 matches',
      category: 'MATCHES',
      icon: '⚡',
      tier: 'GOLD',
      currentValue: Math.min(50, matchesPlayed),
      targetValue: 50,
      isUnlocked: unlockedSet.has('fifty_matches') || matchesPlayed >= 50,
      unlockedLabel: unlockedSet.has('fifty_matches') || matchesPlayed >= 50 ? 'Unlocked' : `${matchesPlayed}/50 Matches`,
    },
    {
      id: 'playoff_qualifier',
      title: 'Playoff Qualifier',
      description: 'Finish in the Top 4 to qualify for League Playoffs',
      category: 'TROPHIES',
      icon: '🎯',
      tier: 'SILVER',
      currentValue: hasPlayoffAppearance ? 1 : 0,
      targetValue: 1,
      isUnlocked: hasPlayoffAppearance,
      unlockedLabel: hasPlayoffAppearance ? 'Unlocked' : '0/1 Playoff Run',
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
      isUnlocked: unlockedSet.has('first_trophy') || trophies >= 1,
      unlockedLabel: unlockedSet.has('first_trophy') || trophies >= 1 ? 'Unlocked' : `${trophies}/1 Trophy`,
    },
    {
      id: 'gcl_qualifier',
      title: 'Global Contender',
      description: 'Qualify for the Global Champions League T20 against international champions',
      category: 'TROPHIES',
      icon: '🌍',
      tier: 'GOLD',
      currentValue: hasGclQualification ? 1 : 0,
      targetValue: 1,
      isUnlocked: hasGclQualification,
      unlockedLabel: hasGclQualification ? 'Unlocked' : '0/1 GCL Bid',
    },
    {
      id: 'gcl_champion',
      title: 'World T20 Champions',
      description: 'Win the Global Champions League T20 Grand Final',
      category: 'TROPHIES',
      icon: '👑',
      tier: 'PLATINUM',
      currentValue: Math.min(1, gclTrophyCount),
      targetValue: 1,
      isUnlocked: unlockedSet.has('gcl_champion') || gclTrophyCount >= 1,
      unlockedLabel: unlockedSet.has('gcl_champion') || gclTrophyCount >= 1 ? 'Unlocked' : `${gclTrophyCount}/1 World Crown`,
    },
    {
      id: 'multi_trophy_dynasty',
      title: 'Dynasty Era',
      description: 'Collect 2 or more permanent championship trophies across your career',
      category: 'TROPHIES',
      icon: '💎',
      tier: 'PLATINUM',
      currentValue: Math.min(2, trophies),
      targetValue: 2,
      isUnlocked: unlockedSet.has('multi_trophy_dynasty') || trophies >= 2,
      unlockedLabel: unlockedSet.has('multi_trophy_dynasty') || trophies >= 2 ? 'Unlocked' : `${trophies}/2 Trophies`,
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
      isUnlocked: unlockedSet.has('top_squad_rating') || avgOvr >= 85,
      unlockedLabel: unlockedSet.has('top_squad_rating') || avgOvr >= 85 ? 'Unlocked' : `${avgOvr}/85 OVR`,
    },
    {
      id: 'tactical_master',
      title: 'Tactical Master',
      description: 'Maintain a 65%+ win rate with at least 5 matches played',
      category: 'MANAGEMENT',
      icon: '🧠',
      tier: 'SILVER',
      currentValue: winRate,
      targetValue: 65,
      unit: '%',
      isUnlocked: unlockedSet.has('tactical_master') || (matchesPlayed >= 5 && winRate >= 65),
      unlockedLabel: unlockedSet.has('tactical_master') || (matchesPlayed >= 5 && winRate >= 65) ? 'Unlocked' : `${winRate}% (Min 5 Matches)`,
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
      isUnlocked: unlockedSet.has('stadium_tycoon') || stadiumTier >= 3,
      unlockedLabel: unlockedSet.has('stadium_tycoon') || stadiumTier >= 3 ? 'Unlocked' : `Tier ${stadiumTier}/3`,
    },
  ];

  return list;
}
