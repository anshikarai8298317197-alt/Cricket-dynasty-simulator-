/**
 * WICKET DYNASTY - Authoritative Injury & Medical Rehabilitation Engine
 * Realistic, influenceable injury probability model driven by player fatigue,
 * stamina, training intensity, match bowling workload, and Club Medical Facility level.
 */
import { Player } from '../types/player';
import { CareerSave } from '../types/career';

export interface PlayerInjuryState {
  playerId: string;
  isInjured: boolean;
  injuryType?: string;
  injurySeverity?: 'MILD' | 'MODERATE' | 'SEVERE';
  daysInjuredRemaining: number;
  initialDaysInjured: number;
  stamina: number;
  fatigue: number;
  injuryRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  injuryDate?: number;
}

const INJURY_CATALOG: { type: string; severity: 'MILD' | 'MODERATE' | 'SEVERE'; minDays: number; maxDays: number }[] = [
  { type: 'Grade 1 Hamstring Strain', severity: 'MILD', minDays: 3, maxDays: 5 },
  { type: 'Ankle Sprain', severity: 'MILD', minDays: 2, maxDays: 4 },
  { type: 'Lower Back Spasm', severity: 'MILD', minDays: 3, maxDays: 5 },
  { type: 'Intercostal Side Strain', severity: 'MODERATE', minDays: 5, maxDays: 8 },
  { type: 'Quadriceps Tear', severity: 'MODERATE', minDays: 6, maxDays: 10 },
  { type: 'Shoulder Rotator Impingement', severity: 'MODERATE', minDays: 5, maxDays: 9 },
  { type: 'Stress Fracture Warning', severity: 'SEVERE', minDays: 10, maxDays: 16 },
  { type: 'Calf Muscle Tear', severity: 'MODERATE', minDays: 6, maxDays: 10 },
];

export class InjuryEngine {
  /**
   * Calculate current injury risk rating for a player based on stamina & fatigue
   */
  static calculateInjuryRisk(stamina: number, fatigue: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (stamina < 35 || fatigue > 80) return 'CRITICAL';
    if (stamina < 55 || fatigue > 65) return 'HIGH';
    if (stamina < 75 || fatigue > 45) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Training Injury Roll: High intensity or low stamina raises risk.
   * Medical Facility tier (1-5) directly mitigates injury probability.
   */
  static rollTrainingInjury(
    player: Player,
    intensity: 'Light' | 'Medium' | 'Hard' | 'REST',
    currentStamina: number,
    medicalLevel: number = 3
  ): { isInjured: boolean; injury?: typeof INJURY_CATALOG[0]; daysRemaining?: number } {
    if (intensity === 'REST') return { isInjured: false };

    // Base probability by intensity
    let baseChance = 0.005; // 0.5% on Light
    if (intensity === 'Medium') baseChance = 0.02; // 2% on Medium
    if (intensity === 'Hard') baseChance = 0.05; // 5% on Hard

    // Multiplier based on stamina exhaustion
    if (currentStamina < 40) baseChance *= 2.8;
    else if (currentStamina < 60) baseChance *= 1.8;
    else if (currentStamina < 80) baseChance *= 1.2;

    // Mitigation from Medical Centre (5% reduction per level above 1)
    const mitigation = Math.max(0.6, 1 - (medicalLevel - 1) * 0.08);
    const finalChance = baseChance * mitigation;

    if (Math.random() < finalChance) {
      // Pick random realistic injury
      const template = INJURY_CATALOG[Math.floor(Math.random() * INJURY_CATALOG.length)];
      const days = Math.floor(Math.random() * (template.maxDays - template.minDays + 1)) + template.minDays;
      return {
        isInjured: true,
        injury: template,
        daysRemaining: days,
      };
    }

    return { isInjured: false };
  }

  /**
   * Advance 1 day of recovery for a player workload
   */
  static advanceDayRecovery(
    current: PlayerInjuryState,
    medicalLevel: number = 3
  ): PlayerInjuryState {
    if (!current.isInjured) {
      // Natural recovery of stamina when not injured
      const recoveredStamina = Math.min(100, current.stamina + 4 + medicalLevel);
      const reducedFatigue = Math.max(0, current.fatigue - 8);
      return {
        ...current,
        stamina: recoveredStamina,
        fatigue: reducedFatigue,
        injuryRisk: this.calculateInjuryRisk(recoveredStamina, reducedFatigue),
      };
    }

    // Injured player: Decrement days remaining
    // Level 4+ medical centers offer accelerated recovery bonus
    const recoveryStep = medicalLevel >= 4 && Math.random() < 0.35 ? 2 : 1;
    const newDays = Math.max(0, current.daysInjuredRemaining - recoveryStep);
    const isNowHealed = newDays === 0;

    return {
      ...current,
      daysInjuredRemaining: newDays,
      isInjured: !isNowHealed,
      injuryType: isNowHealed ? undefined : current.injuryType,
      injurySeverity: isNowHealed ? undefined : current.injurySeverity,
      stamina: isNowHealed ? 75 : current.stamina,
      injuryRisk: isNowHealed ? 'LOW' : current.injuryRisk,
    };
  }

  /**
   * Intensive Physio Rehabilitation:
   * Deducts club funds (₹0.15 Cr) and reduces recovery time by 2 days immediately.
   */
  static applyPhysioSession(career: CareerSave, playerId: string): CareerSave {
    const costCr = 0.15;
    if (career.purseBalanceCr < costCr) {
      throw new Error(`Insufficient funds for Physio treatment. Required: ₹${costCr} Cr`);
    }

    const workloads = { ...(career.playerWorkloads || {}) };
    const current = workloads[playerId];
    if (!current || !current.isInjured) {
      throw new Error('Selected player is not currently injured.');
    }

    const newDays = Math.max(0, (current.daysInjuredRemaining || 1) - 2);
    const isNowHealed = newDays === 0;

    workloads[playerId] = {
      ...current,
      daysInjuredRemaining: newDays,
      isInjured: !isNowHealed,
      stamina: isNowHealed ? 80 : Math.min(100, current.stamina + 10),
    };

    return {
      ...career,
      purseBalanceCr: parseFloat((career.purseBalanceCr - costCr).toFixed(2)),
      playerWorkloads: workloads,
      lastPlayedAt: Date.now(),
    };
  }

  /**
   * Cryotherapy Chamber Treatment:
   * Boosts stamina by +20% and reduces fatigue by 25 points. Costs ₹0.10 Cr.
   */
  static applyCryotherapy(career: CareerSave, playerId: string): CareerSave {
    const costCr = 0.10;
    if (career.purseBalanceCr < costCr) {
      throw new Error(`Insufficient funds for Cryotherapy. Required: ₹${costCr} Cr`);
    }

    const workloads = { ...(career.playerWorkloads || {}) };
    const current = workloads[playerId] || {
      playerId,
      stamina: 80,
      fatigue: 20,
      isInjured: false,
      daysInjuredRemaining: 0,
      injuryRisk: 'LOW',
    };

    const newStamina = Math.min(100, (current.stamina || 80) + 20);
    const newFatigue = Math.max(0, (current.fatigue || 0) - 25);

    workloads[playerId] = {
      ...current,
      stamina: newStamina,
      fatigue: newFatigue,
      injuryRisk: this.calculateInjuryRisk(newStamina, newFatigue),
    };

    return {
      ...career,
      purseBalanceCr: parseFloat((career.purseBalanceCr - costCr).toFixed(2)),
      playerWorkloads: workloads,
      lastPlayedAt: Date.now(),
    };
  }
}
