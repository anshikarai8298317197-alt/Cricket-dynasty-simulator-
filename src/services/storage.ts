/**
 * WICKET DYNASTY - Offline Career Storage Service
 * LocalStorage & In-Memory persistence with multiple slot support
 */
import { CareerSave } from '../types/career';
import { DbPersistence } from './dbPersistence';

const STORAGE_KEY_PREFIX = 'wicket_dynasty_slot_';
const ACTIVE_SLOT_KEY = 'wicket_dynasty_active_slot';

export class StorageService {
  /**
   * Get metadata for all 5 career slots
   */
  static getAllSlots(): (CareerSave | null)[] {
    const slots: (CareerSave | null)[] = [];
    for (let i = 1; i <= 5; i++) {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${i}`);
        if (raw) {
          slots.push(JSON.parse(raw));
        } else {
          slots.push(null);
        }
      } catch (err) {
        console.error(`Failed to read slot ${i}:`, err);
        slots.push(null);
      }
    }
    return slots;
  }

  /**
   * Get single slot by index (1-5)
   */
  static getSlot(slotIndex: number): CareerSave | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slotIndex}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save career state to specific slot (1-5)
   */
  static saveCareer(career: CareerSave): boolean {
    try {
      career.lastPlayedAt = Date.now();
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${career.slotIndex}`, JSON.stringify(career));
      localStorage.setItem(ACTIVE_SLOT_KEY, String(career.slotIndex));
      DbPersistence.saveCareer(career).catch(() => {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:game-saved', { detail: { slotIndex: career.slotIndex, timestamp: Date.now() } }));
      }
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    }
  }

  /**
   * Get the active or most recently played career slot
   */
  static getActiveCareer(): CareerSave | null {
    try {
      const activeSlotId = localStorage.getItem(ACTIVE_SLOT_KEY);
      if (activeSlotId) {
        const slot = this.getSlot(Number(activeSlotId));
        if (slot) return slot;
      }
      
      // Fallback: Find slot with latest lastPlayedAt timestamp
      const all = this.getAllSlots().filter((s): s is CareerSave => s !== null);
      if (all.length === 0) return null;
      all.sort((a, b) => b.lastPlayedAt - a.lastPlayedAt);
      return all[0];
    } catch {
      return null;
    }
  }

  /**
   * Delete career slot
   */
  static deleteSlot(slotIndex: number): boolean {
    try {
      const existing = this.getSlot(slotIndex);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${slotIndex}`);
      const active = localStorage.getItem(ACTIVE_SLOT_KEY);
      if (active === String(slotIndex)) {
        localStorage.removeItem(ACTIVE_SLOT_KEY);
      }
      if (existing?.id) {
        DbPersistence.deleteCareer(existing.id, slotIndex).catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export career to downloadable JSON string
   */
  static exportCareerJson(slotIndex: number): string | null {
    const slot = this.getSlot(slotIndex);
    return slot ? JSON.stringify(slot, null, 2) : null;
  }

  /**
   * Import career from JSON string into specified slot
   */
  static importCareerJson(jsonString: string, targetSlot: number): boolean {
    try {
      const parsed = JSON.parse(jsonString) as CareerSave;
      if (!parsed.name || !parsed.franchiseId) {
        throw new Error('Invalid career save format');
      }
      parsed.slotIndex = targetSlot;
      return this.saveCareer(parsed);
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }
}
