/**
 * WICKET DYNASTY - Player Development, Workload & Injury Engine
 * Phase 03 Architecture
 */
import { Player } from '../types/player';
import {
  TrainingProgramme,
  TrainingIntensity,
  Coach,
  TrainingFacility,
  DevelopmentLogEntry,
  PlayerWorkloadState,
  IndividualTrainingAssignment,
  TeamTrainingSession,
} from '../types/training';
import { TRAINING_PROGRAMMES, DEFAULT_COACHES, INITIAL_TRAINING_FACILITIES } from '../data/trainingData';

export class TrainingEngine {
  /**
   * Check if a player's role is compatible with a given training programme
   */
  static isProgrammeCompatible(player: Player, programme: TrainingProgramme): boolean {
    if (programme.compatibleRoles.includes('ALL')) return true;
    return programme.compatibleRoles.some(role => player.primaryRole.includes(role));
  }

  /**
   * Get all compatible programmes for a specific player
   */
  static getCompatibleProgrammes(player: Player): TrainingProgramme[] {
    return TRAINING_PROGRAMMES.filter(prog => this.isProgrammeCompatible(player, prog));
  }

  /**
   * Calculate Development, Workload, and Injury changes for an individual session
   */
  static processTrainingSession(
    player: Player,
    programme: TrainingProgramme,
    intensity: TrainingIntensity,
    coach: Coach,
    facilities: TrainingFacility[],
    currentWorkload: PlayerWorkloadState
  ): {
    updatedPlayer: Player;
    updatedWorkload: PlayerWorkloadState;
    logEntry: DevelopmentLogEntry;
  } {
    // 1. Fatigue Calculation
    let fatigueDelta = programme.baseFatigueCost;
    if (intensity === 'Light') fatigueDelta = Math.round(fatigueDelta * 0.6);
    else if (intensity === 'Intensive') fatigueDelta = Math.round(fatigueDelta * 1.5);

    // Facility bonus: Recovery centre mitigates fatigue
    const recoveryFac = facilities.find(f => f.id === 'FAC_RECOVERY');
    if (recoveryFac) {
      fatigueDelta = Math.max(2, Math.round(fatigueDelta * (1 - recoveryFac.level * 0.05)));
    }

    const newFatigue = Math.min(100, Math.max(0, currentWorkload.fatigue + fatigueDelta));

    // 2. Injury Risk Evaluation
    let injuryRiskScore = programme.baseInjuryRiskPercent;
    if (intensity === 'Intensive') injuryRiskScore += 6;
    if (newFatigue > 75) injuryRiskScore += 15;
    else if (newFatigue > 60) injuryRiskScore += 8;

    // Facility bonus: Medical centre reduces injury risk
    const medicalFac = facilities.find(f => f.id === 'FAC_MEDICAL');
    if (medicalFac) {
      injuryRiskScore = Math.max(1, Math.round(injuryRiskScore * (1 - medicalFac.level * 0.06)));
    }

    // Roll for injury
    const roll = Math.random() * 100;
    const isInjuredThisSession = !currentWorkload.isInjured && roll < injuryRiskScore && newFatigue > 55;

    let updatedInjuryDetails = currentWorkload.injuryDetails;
    if (isInjuredThisSession) {
      const injuryTypes = [
        { type: 'Hamstring Pull', severity: 'Minor' as const, days: 5 },
        { type: 'Side Strain', severity: 'Moderate' as const, days: 8 },
        { type: 'Ankle Sprain', severity: 'Minor' as const, days: 4 },
        { type: 'Groin Strain', severity: 'Moderate' as const, days: 7 },
      ];
      const selected = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
      updatedInjuryDetails = {
        type: selected.type,
        severity: selected.severity,
        recoveryDaysRemaining: selected.days,
        description: `Sustained during ${intensity.toLowerCase()} ${programme.name}.`,
      };
    }

    // 3. Skill Development Calculation
    const attributeChanges: Record<string, number> = {};
    let status: 'IMPROVED' | 'STAGNATED' | 'FATIGUED' | 'INJURED' = 'STAGNATED';
    let notes = '';

    if (isInjuredThisSession) {
      status = 'INJURED';
      notes = `Session aborted! Player sustained a ${updatedInjuryDetails?.type} due to high workload fatigue.`;
    } else if (newFatigue > 85) {
      status = 'FATIGUED';
      notes = 'Player is suffering from acute exhaustion (>85 fatigue). Negligible skill absorption.';
    } else {
      // Calculate growth chance
      // Factors: age (younger = better), potential headroom, coach bonus, intensity
      const potentialHeadroom = Math.max(0, player.potentialRating - player.overallRating);
      const ageFactor = player.age <= 22 ? 1.5 : player.age <= 27 ? 1.1 : player.age <= 32 ? 0.7 : 0.3;
      const intensityFactor = intensity === 'Intensive' ? 1.4 : intensity === 'Normal' ? 1.0 : 0.6;
      const coachFactor = 1 + (coach.qualityRating - 70) * 0.01;

      // Base improvement probability (30% to 85%)
      const improvementChance = Math.min(85, (30 + potentialHeadroom * 3) * ageFactor * intensityFactor * coachFactor);

      if (Math.random() * 100 < improvementChance) {
        // Successful improvement!
        programme.targetAttributes.forEach(attrPath => {
          const [category, subKey] = attrPath.split('.');
          const currentVal = (player as any)[category]?.[subKey] || 70;

          // Diminishing returns above 88
          const increment = currentVal >= 92 ? 1 : currentVal >= 84 ? 1 : 1;
          const cappedVal = Math.min(99, currentVal + increment);

          if (cappedVal > currentVal) {
            attributeChanges[attrPath] = increment;
            status = 'IMPROVED';
          }
        });

        notes = `Excellent absorption under ${coach.name}. Target skills sharpened successfully.`;
      } else {
        status = 'STAGNATED';
        notes = `Solid practice repetitions completed, but no immediate attribute point breakthrough.`;
      }
    }

    // 4. Apply attribute changes to cloned player object
    const updatedPlayer: Player = JSON.parse(JSON.stringify(player));
    Object.entries(attributeChanges).forEach(([attrPath, inc]) => {
      const [category, subKey] = attrPath.split('.');
      if ((updatedPlayer as any)[category] && (updatedPlayer as any)[category][subKey] !== undefined) {
        (updatedPlayer as any)[category][subKey] = Math.min(99, (updatedPlayer as any)[category][subKey] + inc);
      }
    });

    // Recompute overall rating if key skills improved
    if (Object.keys(attributeChanges).length > 0) {
      const batAvg = Math.round(
        (updatedPlayer.batting.timing + updatedPlayer.batting.power + updatedPlayer.batting.technique) / 3
      );
      const bowlAvg = updatedPlayer.paceBowling
        ? Math.round((updatedPlayer.paceBowling.speed + updatedPlayer.paceBowling.deathBowling) / 2)
        : updatedPlayer.spinBowling
        ? Math.round((updatedPlayer.spinBowling.turn + updatedPlayer.spinBowling.control) / 2)
        : 40;

      if (updatedPlayer.primaryRole.includes('Batter')) {
        updatedPlayer.overallRating = Math.max(updatedPlayer.overallRating, batAvg);
      } else if (updatedPlayer.primaryRole.includes('Bowler')) {
        updatedPlayer.overallRating = Math.max(updatedPlayer.overallRating, bowlAvg);
      } else if (updatedPlayer.primaryRole.includes('All-rounder')) {
        updatedPlayer.overallRating = Math.max(updatedPlayer.overallRating, Math.round((batAvg + bowlAvg) / 2));
      }
    }

    const updatedWorkload: PlayerWorkloadState = {
      playerId: player.id,
      fatigue: newFatigue,
      fitness: Math.max(40, 100 - Math.round(newFatigue * 0.4)),
      injuryRiskScore,
      isInjured: isInjuredThisSession || currentWorkload.isInjured,
      injuryDetails: updatedInjuryDetails,
    };

    const logEntry: DevelopmentLogEntry = {
      id: `dev_${Date.now()}_${player.id}`,
      playerId: player.id,
      playerName: player.name,
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      programmeName: programme.name,
      attributeChanges,
      fatigueDelta,
      notes,
      status,
    };

    return { updatedPlayer, updatedWorkload, logEntry };
  }

  /**
   * Apply Active Recovery or Rest to reduce player fatigue
   */
  static applyRecoveryTreatment(
    workload: PlayerWorkloadState,
    treatmentType: 'FULL_REST' | 'LIGHT_RECOVERY' | 'PHYSIOTHERAPY' | 'SURGERY'
  ): PlayerWorkloadState {
    const updated = { ...workload };

    if (treatmentType === 'FULL_REST') {
      updated.fatigue = Math.max(0, updated.fatigue - 25);
    } else if (treatmentType === 'LIGHT_RECOVERY') {
      updated.fatigue = Math.max(0, updated.fatigue - 35);
    } else if (treatmentType === 'PHYSIOTHERAPY') {
      updated.fatigue = Math.max(0, updated.fatigue - 45);
      if (updated.injuryDetails) {
        updated.injuryDetails.recoveryDaysRemaining = Math.max(0, updated.injuryDetails.recoveryDaysRemaining - 3);
        if (updated.injuryDetails.recoveryDaysRemaining === 0) {
          updated.isInjured = false;
          updated.injuryDetails = undefined;
        }
      }
    } else if (treatmentType === 'SURGERY') {
      updated.fatigue = Math.max(0, updated.fatigue - 50);
      updated.isInjured = false;
      updated.injuryDetails = undefined;
    }

    updated.fitness = Math.max(50, 100 - Math.round(updated.fatigue * 0.35));
    updated.injuryRiskScore = Math.max(2, Math.round(updated.fatigue * 0.3));
    return updated;
  }
}
