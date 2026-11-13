/**
 * WICKET DYNASTY - Match Simulation Energy System (Part 8)
 * - Max Energy: 5
 * - Cost per simulated match: 1 energy (Auto Play loops consume 1 per match & pause at 0)
 * - Manual Live 2D match playback consumes 0 energy
 * - Regeneration: 1 energy every 20 minutes (100 minutes for full 0 -> 5 recharge)
 * - Offline / restart safe using persisted wall-clock timestamps in localStorage
 */
import { DbPersistence } from './dbPersistence';

export const ENERGY_LS_KEY = 'wicket_dynasty_sim_energy_v1';
export const MAX_SIM_ENERGY = 5;
export const ENERGY_REGEN_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes per 1 energy
export const FULL_RECHARGE_MS = MAX_SIM_ENERGY * ENERGY_REGEN_INTERVAL_MS; // 100 minutes

export interface PersistedEnergyRecord {
  energy: number;
  lastRegenAnchorMs: number;
  updatedAt: number;
}

export interface EnergySnapshot {
  energy: number;
  maxEnergy: number;
  isFull: boolean;
  msToNextEnergy: number;
  msToFullRecharge: number;
  nextEnergyFormatted: string;
  fullRechargeFormatted: string;
  lastRegenAnchorMs: number;
}

type EnergyListener = (snapshot: EnergySnapshot) => void;

function readStorage(): PersistedEnergyRecord | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(ENERGY_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.energy === 'number' && typeof parsed?.lastRegenAnchorMs === 'number') {
      return {
        energy: Math.max(0, Math.min(MAX_SIM_ENERGY, Math.floor(parsed.energy))),
        lastRegenAnchorMs: parsed.lastRegenAnchorMs,
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : parsed.lastRegenAnchorMs,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStorage(record: PersistedEnergyRecord): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(ENERGY_LS_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage quota errors in non-browser runtimes
  }
}

export class EnergyService {
  private static memoryFallback: PersistedEnergyRecord | null = null;
  private static listeners = new Set<EnergyListener>();

  static subscribe(listener: EnergyListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify(snapshot: EnergySnapshot): void {
    this.listeners.forEach(fn => fn(snapshot));
  }

  static formatCountdown(ms: number): string {
    if (ms <= 0) return '00:00';
    const totalSec = Math.ceil(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    if (hrs > 0) {
      return `${hrs}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }

  private static loadAndSyncRecord(nowMs: number = Date.now()): PersistedEnergyRecord {
    const stored = readStorage() || this.memoryFallback;
    if (!stored) {
      const initial: PersistedEnergyRecord = {
        energy: MAX_SIM_ENERGY,
        lastRegenAnchorMs: nowMs,
        updatedAt: nowMs,
      };
      this.memoryFallback = initial;
      writeStorage(initial);
      return initial;
    }

    let { energy, lastRegenAnchorMs } = stored;

    // Guard against clock skew moving backward
    if (lastRegenAnchorMs > nowMs) {
      lastRegenAnchorMs = nowMs;
    }

    if (energy >= MAX_SIM_ENERGY) {
      const capped: PersistedEnergyRecord = {
        energy: MAX_SIM_ENERGY,
        lastRegenAnchorMs: nowMs,
        updatedAt: nowMs,
      };
      this.memoryFallback = capped;
      writeStorage(capped);
      return capped;
    }

    const elapsed = Math.max(0, nowMs - lastRegenAnchorMs);
    const gained = Math.floor(elapsed / ENERGY_REGEN_INTERVAL_MS);

    if (gained > 0) {
      const newEnergy = Math.min(MAX_SIM_ENERGY, energy + gained);
      const newAnchor =
        newEnergy >= MAX_SIM_ENERGY
          ? nowMs
          : lastRegenAnchorMs + gained * ENERGY_REGEN_INTERVAL_MS;

      const updated: PersistedEnergyRecord = {
        energy: newEnergy,
        lastRegenAnchorMs: newAnchor,
        updatedAt: nowMs,
      };
      this.memoryFallback = updated;
      writeStorage(updated);
      return updated;
    }

    this.memoryFallback = stored;
    return stored;
  }

  private static toSnapshot(record: PersistedEnergyRecord, nowMs: number = Date.now()): EnergySnapshot {
    const isFull = record.energy >= MAX_SIM_ENERGY;
    const elapsedInCurrentCycle = isFull ? 0 : Math.max(0, nowMs - record.lastRegenAnchorMs);
    const msToNextEnergy = isFull
      ? 0
      : Math.max(0, ENERGY_REGEN_INTERVAL_MS - elapsedInCurrentCycle);
    const missingUnits = MAX_SIM_ENERGY - record.energy;
    const msToFullRecharge = isFull
      ? 0
      : msToNextEnergy + Math.max(0, missingUnits - 1) * ENERGY_REGEN_INTERVAL_MS;

    return {
      energy: record.energy,
      maxEnergy: MAX_SIM_ENERGY,
      isFull,
      msToNextEnergy,
      msToFullRecharge,
      nextEnergyFormatted: this.formatCountdown(msToNextEnergy),
      fullRechargeFormatted: this.formatCountdown(msToFullRecharge),
      lastRegenAnchorMs: record.lastRegenAnchorMs,
    };
  }

  static getSnapshot(nowMs: number = Date.now()): EnergySnapshot {
    const record = this.loadAndSyncRecord(nowMs);
    return this.toSnapshot(record, nowMs);
  }

  static hasEnergy(amount: number = 1, nowMs: number = Date.now()): boolean {
    if (amount <= 0) return true;
    return this.getSnapshot(nowMs).energy >= amount;
  }

  /**
   * Consume match simulation energy (never drops below 0).
   * Preserves remainder progress when stepping down from MAX_SIM_ENERGY -> restarts 20m timer cleanly.
   */
  static consumeEnergy(
    amount: number = 1,
    nowMs: number = Date.now()
  ): { success: boolean; snapshot: EnergySnapshot } {
    const record = this.loadAndSyncRecord(nowMs);
    if (amount <= 0) {
      return { success: true, snapshot: this.toSnapshot(record, nowMs) };
    }
    if (record.energy < amount) {
      return { success: false, snapshot: this.toSnapshot(record, nowMs) };
    }

    const wasFull = record.energy >= MAX_SIM_ENERGY;
    const nextEnergy = Math.max(0, record.energy - amount);
    const nextAnchor = wasFull ? nowMs : record.lastRegenAnchorMs;

    const updated: PersistedEnergyRecord = {
      energy: nextEnergy,
      lastRegenAnchorMs: nextAnchor,
      updatedAt: nowMs,
    };
    this.memoryFallback = updated;
    writeStorage(updated);
    const snap = this.toSnapshot(updated, nowMs);
    this.notify(snap);
    return { success: true, snapshot: snap };
  }

  /**
   * Grant rewarded ad energy (+1, capped at MAX_SIM_ENERGY = 5).
   * Enforces strict idempotency on rewardToken so duplicate callbacks never double-grant.
   */
  static grantRewardedEnergy(
    amount: number = 1,
    rewardToken: string,
    nowMs: number = Date.now()
  ): { granted: boolean; snapshot: EnergySnapshot; reason?: string } {
    if (!rewardToken || !rewardToken.trim()) {
      return { granted: false, snapshot: this.getSnapshot(nowMs), reason: 'Missing reward verification token' };
    }
    const dedupeKey = `energy_reward_${rewardToken}`;
    if (DbPersistence.hasProcessedEvent(dedupeKey)) {
      return { granted: false, snapshot: this.getSnapshot(nowMs), reason: 'Duplicate reward token rejected' };
    }

    const record = this.loadAndSyncRecord(nowMs);
    DbPersistence.markEventProcessed(dedupeKey);

    const nextEnergy = Math.min(MAX_SIM_ENERGY, record.energy + Math.max(1, amount));
    const nextAnchor = nextEnergy >= MAX_SIM_ENERGY ? nowMs : record.lastRegenAnchorMs;

    const updated: PersistedEnergyRecord = {
      energy: nextEnergy,
      lastRegenAnchorMs: nextAnchor,
      updatedAt: nowMs,
    };
    this.memoryFallback = updated;
    writeStorage(updated);
    const snap = this.toSnapshot(updated, nowMs);
    this.notify(snap);
    return { granted: true, snapshot: snap };
  }

  /**
   * Test / reset helper (restores full 5 energy cleanly)
   */
  static resetForTesting(energy: number = MAX_SIM_ENERGY, anchorMs: number = Date.now()): EnergySnapshot {
    const rec: PersistedEnergyRecord = {
      energy: Math.max(0, Math.min(MAX_SIM_ENERGY, energy)),
      lastRegenAnchorMs: anchorMs,
      updatedAt: anchorMs,
    };
    this.memoryFallback = rec;
    writeStorage(rec);
    const snap = this.toSnapshot(rec, anchorMs);
    this.notify(snap);
    return snap;
  }
}
