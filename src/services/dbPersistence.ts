/**
 * WICKET DYNASTY - Authoritative Offline-First Auto-Save & IndexedDB Persistence Manager
 * Dual-layer persistence: IndexedDB (primary transactional store, DB_VERSION = 3) + LocalStorage (sync mirror).
 * Serialized FIFO Promise write queue, idempotent event deduplication, retry-on-failure,
 * boot-time hydration, live match ball persistence, auction event persistence, and avatar persistence.
 */
import { CareerSave, DifficultyLevel, SquadMode } from '../types/career';
import { PlayerAvatarProfile, PlayerAvatarService } from './playerAvatarService';

const DB_NAME = 'wicket_dynasty_db';
const DB_VERSION = 3;

const PROCESSED_EVENTS_LS_KEY = 'wicket_dynasty_processed_events_v1';
const DRAFT_LS_KEY = 'wicket_dynasty_career_draft_v1';

export interface CareerDraftState {
  id: string;
  careerName: string;
  tournamentName: string;
  squadMode: SquadMode;
  difficulty: DifficultyLevel;
  trainingMode: 'Auto' | 'Manual';
  franchiseId?: string;
  retainedIds?: string[];
  updatedAt: number;
}

export interface LiveMatchPersistenceState {
  matchId: string;
  fixtureId: string;
  careerId?: string;
  homeFranchiseId: string;
  awayFranchiseId: string;
  userFranchiseId?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  pitchCondition?: string;
  venue?: string;
  tossWinnerId?: string;
  tossDecision?: 'Bat First' | 'Bowl First';
  teamBattingFirstId?: string;
  teamBowlingFirstId?: string;
  homePlayingXiIds?: string[];
  awayPlayingXiIds?: string[];
  currentInnings: 1 | 2;
  status: 'SCHEDULED' | 'LIVE_INNINGS_1' | 'INNINGS_BREAK' | 'LIVE_INNINGS_2' | 'COMPLETED' | string;
  target?: number | null;
  innings1: any;
  innings2: any;
  currentDelivery: any;
  tactics: any;
  impactUsed?: boolean;
  selectedSubPlayer?: string | null;
  playerForm?: Record<string, number>;
  playerStamina?: Record<string, number>;
  playerFatigue?: Record<string, number>;
  seedState?: number;
  lastSavedAt: number;
}

export interface LiveAuctionPersistenceState {
  careerId: string;
  auctionId?: string;
  currentLotIndex: number;
  currentLotId?: string;
  currentPlayerId?: string;
  currentBidCr: number;
  highestBidderId: string | null;
  previousBidderId: string | null;
  phase: string;
  lots?: any[];
  franchiseStates: Record<string, any>;
  transactions: any[];
  bidHistory?: { bidderId: string; amountCr: number; time: string }[];
  withdrawnFranchiseIds?: string[];
  unsoldPlayerIds?: string[];
  confirmedSetTransitions?: string[];
  simSpeed?: 1 | 2 | 4;
  isPaused?: boolean;
  lastSavedAt: number;
}

export type SaveStatus = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';
type SaveListener = (status: SaveStatus, details?: string) => void;

export class DbPersistence {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static listeners: Set<SaveListener> = new Set();
  private static saveTimeout: any = null;
  private static writeQueue: Promise<any> = Promise.resolve();
  private static lastFailedOperation: (() => Promise<boolean>) | null = null;
  private static processedEventCache: Set<string> | null = null;

  static subscribe(listener: SaveListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notify(status: SaveStatus, details?: string) {
    this.listeners.forEach(fn => fn(status, details));
  }

  /**
   * Enqueue writes strictly in FIFO order to eliminate race conditions / stale overwrites
   */
  private static enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
    const run = this.writeQueue.then(task, task);
    this.writeQueue = run.catch(() => undefined);
    return run;
  }

  /**
   * Retry last failed save operation from HeaderBar retry UI
   */
  static async retryLastFailed(): Promise<boolean> {
    if (!this.lastFailedOperation) return true;
    const op = this.lastFailedOperation;
    this.lastFailedOperation = null;
    return op();
  }

  private static async getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this runtime.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('careers')) {
          db.createObjectStore('careers', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('live_match')) {
          db.createObjectStore('live_match', { keyPath: 'matchId' });
        }
        if (!db.objectStoreNames.contains('live_auction')) {
          db.createObjectStore('live_auction', { keyPath: 'careerId' });
        }
        if (!db.objectStoreNames.contains('player_avatars')) {
          db.createObjectStore('player_avatars', { keyPath: 'playerId' });
        }
        if (!db.objectStoreNames.contains('career_draft')) {
          db.createObjectStore('career_draft', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('processed_events')) {
          db.createObjectStore('processed_events', { keyPath: 'eventId' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  private static readAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
    return new Promise(resolve => {
      try {
        if (!db.objectStoreNames.contains(storeName)) {
          resolve([]);
          return;
        }
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve((req.result || []) as T[]);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  private static putInStore(db: IDBDatabase, storeName: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).put(value);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Boot-time hydration: restore IndexedDB records into localStorage mirrors & avatar cache
   * so synchronous reads work immediately and zero data is lost if localStorage was cleared.
   */
  static async hydrateFromIndexedDb(): Promise<void> {
    try {
      const db = await this.getDb();

      // 1. Hydrate careers
      const careers = await this.readAllFromStore<CareerSave>(db, 'careers');
      if (careers.length > 0 && typeof localStorage !== 'undefined') {
        for (const c of careers) {
          const lsKey = `wicket_dynasty_slot_${c.slotIndex}`;
          const existingRaw = localStorage.getItem(lsKey);
          const existing = existingRaw ? (JSON.parse(existingRaw) as CareerSave) : null;
          if (!existing || (c.lastPlayedAt || 0) > (existing.lastPlayedAt || 0)) {
            localStorage.setItem(lsKey, JSON.stringify(c));
          }
        }
      }

      // 2. Hydrate live_match if not already fresher in localStorage
      const liveMatches = await this.readAllFromStore<LiveMatchPersistenceState>(db, 'live_match');
      if (liveMatches.length > 0 && typeof localStorage !== 'undefined') {
        liveMatches.sort((a, b) => (b.lastSavedAt || 0) - (a.lastSavedAt || 0));
        const newest = liveMatches[0];
        const existingRaw = localStorage.getItem('wicket_dynasty_active_live_match');
        const existing = existingRaw ? (JSON.parse(existingRaw) as LiveMatchPersistenceState) : null;
        if (!existing || (newest.lastSavedAt || 0) > (existing.lastSavedAt || 0)) {
          localStorage.setItem('wicket_dynasty_active_live_match', JSON.stringify(newest));
        }
      }

      // 3. Hydrate live_auction
      const liveAuctions = await this.readAllFromStore<LiveAuctionPersistenceState>(db, 'live_auction');
      if (liveAuctions.length > 0 && typeof localStorage !== 'undefined') {
        liveAuctions.sort((a, b) => (b.lastSavedAt || 0) - (a.lastSavedAt || 0));
        const newest = liveAuctions[0];
        const existingRaw = localStorage.getItem('wicket_dynasty_active_live_auction');
        const existing = existingRaw ? (JSON.parse(existingRaw) as LiveAuctionPersistenceState) : null;
        if (!existing || (newest.lastSavedAt || 0) > (existing.lastSavedAt || 0)) {
          localStorage.setItem('wicket_dynasty_active_live_auction', JSON.stringify(newest));
        }
      }

      // 4. Hydrate avatars
      const avatars = await this.readAllFromStore<PlayerAvatarProfile>(db, 'player_avatars');
      if (avatars.length > 0) {
        PlayerAvatarService.hydrateCache(avatars);
      }

      // 5. Hydrate draft
      const drafts = await this.readAllFromStore<CareerDraftState>(db, 'career_draft');
      if (drafts.length > 0 && typeof localStorage !== 'undefined') {
        const latestDraft = drafts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
        if (!localStorage.getItem(DRAFT_LS_KEY)) {
          localStorage.setItem(DRAFT_LS_KEY, JSON.stringify(latestDraft));
        }
      }

      // 6. Hydrate processed events
      const events = await this.readAllFromStore<{ eventId: string; timestamp: number }>(db, 'processed_events');
      const set = this.getProcessedEventSet();
      for (const e of events) {
        set.add(e.eventId);
      }
      if (typeof localStorage !== 'undefined' && events.length > 0) {
        localStorage.setItem(PROCESSED_EVENTS_LS_KEY, JSON.stringify(Array.from(set).slice(-500)));
      }
    } catch {
      // IndexedDB unavailable in non-browser/test environments — localStorage fallback active
    }

    // Wire PlayerAvatarService hook so newly generated avatars persist automatically to IndexedDB
    PlayerAvatarService.registerPersistHook(profile => {
      this.enqueueWrite(async () => {
        try {
          const db = await this.getDb();
          await this.putInStore(db, 'player_avatars', profile);
        } catch {}
      });
    });
  }

  // ================= IDEMPOTENCY DEDUPLICATION =================
  private static getProcessedEventSet(): Set<string> {
    if (this.processedEventCache) return this.processedEventCache;
    const set = new Set<string>();
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(PROCESSED_EVENTS_LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(id => set.add(String(id)));
          }
        }
      }
    } catch {}
    this.processedEventCache = set;
    return set;
  }

  static hasProcessedEvent(eventId: string): boolean {
    return this.getProcessedEventSet().has(eventId);
  }

  static markEventProcessed(eventId: string): void {
    const set = this.getProcessedEventSet();
    if (set.has(eventId)) return;
    set.add(eventId);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PROCESSED_EVENTS_LS_KEY, JSON.stringify(Array.from(set).slice(-500)));
      }
    } catch {}

    this.enqueueWrite(async () => {
      try {
        const db = await this.getDb();
        await this.putInStore(db, 'processed_events', { eventId, timestamp: Date.now() });
      } catch {}
    });
  }

  // ================= 1. CAREER AUTO-SAVE =================
  static saveCareer(career: CareerSave): Promise<boolean> {
    const runOp = async (): Promise<boolean> => {
      this.notify('SAVING', 'Saving career...');
      try {
        career.lastPlayedAt = Date.now();
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`wicket_dynasty_slot_${career.slotIndex}`, JSON.stringify(career));
          localStorage.setItem('wicket_dynasty_active_slot', String(career.slotIndex));
        }
        try {
          const db = await this.getDb();
          await this.putInStore(db, 'careers', career);
        } catch {
          // LocalStorage mirror succeeded; IndexedDB skipped when unavailable
        }
        this.lastFailedOperation = null;
        this.notify('SAVED', 'Saved');
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.notify('IDLE'), 2000);
        return true;
      } catch (err) {
        console.error('[DbPersistence] Career save error:', err);
        this.lastFailedOperation = () => this.saveCareer(career);
        this.notify('ERROR', 'Save failed');
        return false;
      }
    };

    return this.enqueueWrite(runOp);
  }

  static deleteCareer(careerId: string, slotIndex: number): Promise<void> {
    return this.enqueueWrite(async () => {
      try {
        const db = await this.getDb();
        const tx = db.transaction('careers', 'readwrite');
        tx.objectStore('careers').delete(careerId);
      } catch {}
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(`wicket_dynasty_slot_${slotIndex}`);
        }
      } catch {}
    });
  }

  // ================= 2. CAREER SETUP DRAFT AUTO-SAVE =================
  static saveCareerDraft(draft: CareerDraftState): Promise<boolean> {
    return this.enqueueWrite(async () => {
      try {
        draft.updatedAt = Date.now();
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(DRAFT_LS_KEY, JSON.stringify(draft));
        }
        try {
          const db = await this.getDb();
          await this.putInStore(db, 'career_draft', draft);
        } catch {}
        this.notify('SAVED', 'Saved');
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.notify('IDLE'), 1200);
        return true;
      } catch {
        return false;
      }
    });
  }

  static getCareerDraft(): CareerDraftState | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(DRAFT_LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static clearCareerDraft(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(DRAFT_LS_KEY);
      }
      this.enqueueWrite(async () => {
        try {
          const db = await this.getDb();
          const tx = db.transaction('career_draft', 'readwrite');
          tx.objectStore('career_draft').clear();
        } catch {}
      });
    } catch {}
  }

  // ================= 3. LIVE MATCH DELIVERY AUTO-SAVE =================
  static saveLiveMatchDelivery(state: LiveMatchPersistenceState): Promise<boolean> {
    state.lastSavedAt = Date.now();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('wicket_dynasty_active_live_match', JSON.stringify(state));
      }
    } catch (err) {
      console.error('[DbPersistence] Match ball localStorage mirror error:', err);
    }

    const runOp = async (): Promise<boolean> => {
      this.notify('SAVING', 'Saving ball...');
      try {
        try {
          const db = await this.getDb();
          await this.putInStore(db, 'live_match', state);
        } catch {}
        this.lastFailedOperation = null;
        this.notify('SAVED', 'Saved');
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.notify('IDLE'), 1500);
        return true;
      } catch (err) {
        console.error('[DbPersistence] Match ball save error:', err);
        this.lastFailedOperation = () => this.saveLiveMatchDelivery(state);
        this.notify('ERROR', 'Ball save failed');
        return false;
      }
    };

    return this.enqueueWrite(runOp);
  }

  static getActiveLiveMatch(): LiveMatchPersistenceState | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem('wicket_dynasty_active_live_match');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static clearLiveMatch(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('wicket_dynasty_active_live_match');
      }
      this.enqueueWrite(async () => {
        try {
          const db = await this.getDb();
          const tx = db.transaction('live_match', 'readwrite');
          tx.objectStore('live_match').clear();
        } catch {}
      });
    } catch {}
  }

  // ================= 4. LIVE AUCTION AUTO-SAVE =================
  static saveLiveAuctionEvent(state: LiveAuctionPersistenceState): Promise<boolean> {
    const runOp = async (): Promise<boolean> => {
      this.notify('SAVING', 'Saving auction...');
      try {
        state.lastSavedAt = Date.now();
        const raw = JSON.stringify(state);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('wicket_dynasty_active_live_auction', raw);
        }
        try {
          const db = await this.getDb();
          await this.putInStore(db, 'live_auction', state);
        } catch {}
        this.lastFailedOperation = null;
        this.notify('SAVED', 'Saved');
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.notify('IDLE'), 1500);
        return true;
      } catch (err) {
        console.error('[DbPersistence] Auction save error:', err);
        this.lastFailedOperation = () => this.saveLiveAuctionEvent(state);
        this.notify('ERROR', 'Auction save failed');
        return false;
      }
    };

    return this.enqueueWrite(runOp);
  }

  static getActiveLiveAuction(): LiveAuctionPersistenceState | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem('wicket_dynasty_active_live_auction');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static clearLiveAuction(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('wicket_dynasty_active_live_auction');
      }
      this.enqueueWrite(async () => {
        try {
          const db = await this.getDb();
          const tx = db.transaction('live_auction', 'readwrite');
          tx.objectStore('live_auction').clear();
        } catch {}
      });
    } catch {}
  }
}
