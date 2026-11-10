/**
 * WICKET DYNASTY - Tactical Management & Opponent Scouting Engine
 * Phase 03 Architecture
 */
import { Player } from '../types/player';
import {
  BattingTacticsConfig,
  BowlingTacticsConfig,
  FieldingTacticsConfig,
  MatchupDossier,
  MatchPreparationPlan,
} from '../types/tactics';

export class TacticsEngine {
  /**
   * Generate default batting tactics for a given lineup
   */
  static generateDefaultBattingTactics(playingXiIds: string[]): BattingTacticsConfig {
    return {
      battingOrderIds: [...playingXiIds],
      macroAggression: 'Balanced',
      strategy: 'Attack powerplay',
      powerplayApproach: 'High Risk Boundaries',
      middleOversApproach: 'Strike Rotation',
      deathOversApproach: 'All-Out Boundary Hitting',
      situationalInstructions: {
        requiredRunRateThreshold: 9.5,
        wicketsRemainingDefenseThreshold: 4,
      },
    };
  }

  /**
   * Intelligently pick opening, middle, and death bowlers from the Playing XI based on player attributes
   */
  static generateDefaultBowlingTactics(playingXiIds: string[], squadPlayers: Player[]): BowlingTacticsConfig {
    const xiPlayers = playingXiIds
      .map(id => squadPlayers.find(p => p.id === id))
      .filter((p): p is Player => p !== undefined);

    // Identify bowling capable players
    const bowlers = xiPlayers.filter(
      p =>
        p.primaryRole.includes('Bowler') ||
        p.primaryRole.includes('All-rounder') ||
        (p.secondaryRole && (p.secondaryRole.includes('Bowler') || p.secondaryRole.includes('All-rounder')))
    );

    // Find opening pace/swing bowlers
    const paceBowlers = bowlers
      .filter(p => p.paceBowling !== undefined)
      .sort((a, b) => {
        const aSwing = (a.paceBowling?.swing || 0) + (a.paceBowling?.speed || 0);
        const bSwing = (b.paceBowling?.swing || 0) + (b.paceBowling?.speed || 0);
        return bSwing - aSwing;
      });

    const openingIds: string[] = [];
    if (paceBowlers.length >= 2) {
      openingIds.push(paceBowlers[0].id, paceBowlers[1].id);
    } else if (bowlers.length >= 2) {
      openingIds.push(bowlers[0].id, bowlers[1].id);
    } else {
      openingIds.push(playingXiIds[playingXiIds.length - 2] || playingXiIds[0], playingXiIds[playingXiIds.length - 1] || playingXiIds[1]);
    }

    // Death overs specialists
    const deathBowlers = [...bowlers]
      .sort((a, b) => {
        const aDeath = a.paceBowling?.deathBowling || a.spinBowling?.control || 0;
        const bDeath = b.paceBowling?.deathBowling || b.spinBowling?.control || 0;
        return bDeath - aDeath;
      })
      .slice(0, 2)
      .map(p => p.id);

    const firstChange = bowlers.find(b => !openingIds.includes(b.id))?.id || openingIds[0];

    const middleOvers = bowlers
      .filter(b => !openingIds.includes(b.id))
      .map(b => b.id);

    return {
      openingBowlerIds: openingIds,
      firstChangeBowlerId: firstChange,
      middleOversBowlerIds: middleOvers.length > 0 ? middleOvers : openingIds,
      deathOversSpecialistIds: deathBowlers.length > 0 ? deathBowlers : openingIds,
      macroAggression: 'Balanced Line & Length',
      paceVsSpinPreference: 'Balanced Conditions',
      deathOversPlan: 'Wide Yorkers & Cutters',
      enforceFourOverLimit: true,
    };
  }

  /**
   * Generate default fielding tactical setup
   */
  static generateDefaultFieldingTactics(): FieldingTacticsConfig {
    return {
      preset: 'Balanced Standard T20',
      slipCount: 1,
      innerRingDensity: 5,
      deepBoundaryPatrolCount: 4,
      wicketkeeperStance: 'Back for Pace',
    };
  }

  /**
   * Compute head-to-head tactical rating between a batter and bowler
   */
  static generateMatchupDossier(batter: Player, bowler: Player): MatchupDossier {
    const isPace = !!bowler.paceBowling;
    const isSpin = !!bowler.spinBowling;
    const isLeftArm = bowler.bowlingArm === 'Left Arm';

    const vsPaceRating = isPace
      ? Math.round((batter.batting.paceHandling + batter.batting.technique) / 2)
      : 80;

    const vsSpinRating = isSpin
      ? Math.round((batter.batting.spinHandling + batter.batting.technique) / 2)
      : 80;

    const vsLeftArmRating = isLeftArm
      ? Math.round(batter.batting.paceHandling * 0.92)
      : 85;

    const vsRightArmRating = !isLeftArm
      ? Math.round(batter.batting.paceHandling)
      : 85;

    let recommendedBowlerType = 'Right-arm Fast Seam';
    if (batter.batting.spinHandling < batter.batting.paceHandling) {
      recommendedBowlerType = batter.battingHand === 'Left Hand' ? 'Right-arm Off-Spin' : 'Left-arm Orthodox Spin';
    } else if (batter.batting.paceHandling < 80) {
      recommendedBowlerType = 'Express Pace (145km/h+) Short Pitch';
    } else {
      recommendedBowlerType = 'Wide Yorkers & Off-Cutters';
    }

    return {
      batterId: batter.id,
      batterName: batter.name,
      vsPaceRating,
      vsSpinRating,
      vsLeftArmRating,
      vsRightArmRating,
      recommendedBowlerType,
      historicalSampleMatches: Math.floor(Math.random() * 12) + 8,
    };
  }

  /**
   * Analyze opponent squad to generate key tactical strengths and weaknesses
   */
  static generateOpponentScouting(
    opponentFranchiseId: string,
    opponentSquad: Player[]
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const topBatters = opponentSquad.filter(p => p.primaryRole.includes('Batter') || p.batting.power >= 88);
    const topBowlers = opponentSquad.filter(p => p.primaryRole.includes('Bowler'));
    const expressPacers = opponentSquad.filter(p => p.paceBowling && p.paceBowling.speed >= 90);
    const mysterySpinners = opponentSquad.filter(p => p.spinBowling && p.spinBowling.turn >= 88);

    if (topBatters.length >= 4) {
      strengths.push('Heavy top-order firepower with destructive power hitters (>88 Power)');
    } else {
      weaknesses.push('Top-order lacks depth; early wickets trigger rapid collapse');
    }

    if (expressPacers.length >= 1) {
      strengths.push(`Lethal express pace spearhead (${expressPacers[0].name} clocking 145km/h+)`);
    } else {
      weaknesses.push('Pace attack lacks genuine express speed; vulnerable to pull & hook shots');
    }

    if (mysterySpinners.length >= 1) {
      strengths.push(`Dangerous turning spin threat in middle overs (${mysterySpinners[0].name})`);
    } else {
      weaknesses.push('Spin bowling unit concedes high boundary percentage in middle overs');
    }

    // Fielding
    const avgFielding = Math.round(
      opponentSquad.reduce((acc, p) => acc + p.fielding.catching + p.fielding.agility, 0) /
        (opponentSquad.length * 2 || 1)
    );

    if (avgFielding >= 85) {
      strengths.push('Elite boundary fielding & direct hit run-out threat');
    } else {
      weaknesses.push('Sub-par catching conversion in outfield; drop catches under pressure');
    }

    // Death bowling
    const deathBowlers = opponentSquad.filter(p => p.paceBowling && p.paceBowling.deathBowling >= 88);
    if (deathBowlers.length === 0) {
      weaknesses.push('Leaky death-overs bowling; target overs 16-20 with full aggression');
    }

    return {
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
    };
  }

  /**
   * Create a comprehensive pre-match preparation plan
   */
  static createDefaultMatchPrepPlan(
    fixtureId: string,
    opponentFranchiseId: string,
    playingXiIds: string[],
    squadPlayers: Player[],
    captainId: string,
    viceCaptainId: string,
    wicketKeeperId: string,
    opponentSquad: Player[]
  ): MatchPreparationPlan {
    const battingTactics = this.generateDefaultBattingTactics(playingXiIds);
    const bowlingTactics = this.generateDefaultBowlingTactics(playingXiIds, squadPlayers);
    const fieldingTactics = this.generateDefaultFieldingTactics();
    const scouting = this.generateOpponentScouting(opponentFranchiseId, opponentSquad);

    const pitchOptions: ('Batting Friendly' | 'Bowling Greentop' | 'Spin Dustbowl' | 'Balanced Surface')[] = [
      'Batting Friendly',
      'Bowling Greentop',
      'Spin Dustbowl',
      'Balanced Surface',
    ];
    const pitchCondition = pitchOptions[Math.floor(Math.random() * pitchOptions.length)];

    return {
      fixtureId,
      opponentFranchiseId,
      opponentStrengths: scouting.strengths,
      opponentWeaknesses: scouting.weaknesses,
      confirmedPlayingXiIds: [...playingXiIds],
      captainId,
      viceCaptainId,
      wicketKeeperId,
      battingTactics,
      bowlingTactics,
      fieldingTactics,
      pitchCondition,
      weatherCondition: 'Clear 28°C',
      tossChoice: 'Bat First',
      isPlanConfirmed: false,
    };
  }
}
