/**
 * WICKET DYNASTY - Unity LevelPlay Mediation Service (Part 11)
 * - Rewarded Video Ads + Natural-Break Interstitials ONLY (ZERO Banner Ads anywhere)
 * - Interfaces with Native Android bridge window.WicketDynastyAds (LevelPlayBridge.java)
 * - Single-init guard, single-flight mutex, strict callback token verification,
 *   idempotent deduplication via DbPersistence, and never grants fake rewards when unconfigured/offline/failed.
 */
import { DbPersistence } from './dbPersistence';

export const UNITY_ANDROID_GAME_ID = '6224523';
export const UNITY_REWARDED_PLACEMENT = 'Rewarded_Android';
export const UNITY_INTERSTITIAL_PLACEMENT = 'Interstitial_Android';

export type RewardedPlacementKey =
  | 'MATCH_SIM_ENERGY'
  | 'TRAINING_BOOST'
  | 'PLAYER_FATIGUE_RECOVERY'
  | 'INJURY_RECOVERY_SPEEDUP'
  | 'RETIREMENT_EXTENSION'
  | 'YOUTH_ACADEMY_BOOST'
  | 'FACILITY_UPGRADE_BOOST'
  | 'DAILY_BONUS'
  | 'SCOUTING_BONUS'
  | 'MATCH_RESULT_BONUS'
  | 'LBW_DRS_REVIEW';

export type InterstitialPlacementKey =
  | 'MATCH_RESULT_SCREEN'
  | 'TOURNAMENT_END_SUMMARY'
  | 'SEASON_END_SUMMARY';

export type ProtectedGameplayFlow =
  | 'LIVE_BALL_BY_BALL'
  | 'LIVE_AUCTION'
  | 'RETENTIONS'
  | 'PLAYING_XI'
  | 'TEAM_TRANSFER'
  | 'CAREER_SETUP'
  | 'SAVING';

export interface LevelPlayConfigStatus {
  hasNativeBridge: boolean;
  isInitialized: boolean;
  unityGameId: string;
  rewardedPlacement: string;
  interstitialPlacement: string;
  levelPlayAppKeyConfigured: boolean;
  rewardedAdUnitConfigured: boolean;
  interstitialAdUnitConfigured: boolean;
  rewardedReady: boolean;
  interstitialReady: boolean;
  missingFields: string[];
}

export interface RewardedAdResult {
  completed: boolean;
  status: 'REWARDED' | 'CLOSED_NO_REWARD' | 'FAILED' | 'UNAVAILABLE' | 'BUSY';
  placement: RewardedPlacementKey;
  rewardToken?: string;
  reason?: string;
}

export interface InterstitialAdResult {
  shown: boolean;
  status: 'INTERSTITIAL_CLOSED' | 'COOLDOWN' | 'BLOCKED_PROTECTED_FLOW' | 'UNAVAILABLE' | 'FAILED' | 'BUSY';
  reason?: string;
}

interface NativeWicketDynastyAdsBridge {
  isNativeBridgeAvailable?: () => boolean;
  getConfigStatusJson?: () => string;
  initializeAds?: () => void;
  isRewardedReady?: () => boolean;
  isInterstitialReady?: () => boolean;
  showRewardedAd?: (requestId: string, placementKey: string) => void;
  showInterstitialAd?: (requestId: string, placementKey: string) => void;
}

interface PendingResolver {
  adType: 'REWARDED' | 'INTERSTITIAL';
  placement: string;
  resolve: (payload: any) => void;
  timeoutId: any;
}

const INTERSTITIAL_COOLDOWN_LS_KEY = 'wicket_dynasty_interstitial_last_shown_ms';
const INTERSTITIAL_COOLDOWN_MS = 180 * 1000; // 3-minute cooldown between natural-break interstitials

export class LevelPlayService {
  private static initializedOnce = false;
  private static activeAdRequest: { requestId: string } | null = null;
  private static pendingRequests = new Map<string, PendingResolver>();
  private static lastInterstitialShownMemoryMs = 0;

  private static getNativeBridge(): NativeWicketDynastyAdsBridge | null {
    if (typeof window === 'undefined') return null;
    const bridge = (window as any).WicketDynastyAds as NativeWicketDynastyAdsBridge | undefined;
    return bridge && typeof bridge === 'object' ? bridge : null;
  }

  private static installCallbackHandler(): void {
    if (typeof window === 'undefined') return;
    if ((window as any).__wdLevelPlayCallbackInstalled) return;
    (window as any).__wdLevelPlayCallbackInstalled = true;

    (window as any).__wdLevelPlayCallback = (rawJson: string) => {
      try {
        const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        const reqId = String(parsed?.requestId || '');
        const pending = this.pendingRequests.get(reqId);
        if (!pending) return;

        clearTimeout(pending.timeoutId);
        this.pendingRequests.delete(reqId);
        if (this.activeAdRequest?.requestId === reqId) {
          this.activeAdRequest = null;
        }
        pending.resolve(parsed);
      } catch {
        // Ignore malformed native callback
      }
    };
  }

  /**
   * Single-init controller; safe to call multiple times without duplicate initialization
   */
  static initialize(): void {
    this.installCallbackHandler();
    if (this.initializedOnce) return;
    this.initializedOnce = true;

    const bridge = this.getNativeBridge();
    if (bridge?.initializeAds) {
      try {
        bridge.initializeAds();
      } catch {
        // Native init skipped if LevelPlay App Key is not supplied
      }
    }
  }

  /**
   * Reports authoritative native/web ad configuration status without inventing placeholder keys
   */
  static getConfigStatus(): LevelPlayConfigStatus {
    this.initialize();
    const bridge = this.getNativeBridge();

    if (bridge?.getConfigStatusJson) {
      try {
        const parsed = JSON.parse(bridge.getConfigStatusJson());
        return {
          hasNativeBridge: Boolean(parsed.hasNativeBridge ?? true),
          isInitialized: Boolean(parsed.isInitialized),
          unityGameId: parsed.unityGameId || UNITY_ANDROID_GAME_ID,
          rewardedPlacement: parsed.rewardedPlacement || UNITY_REWARDED_PLACEMENT,
          interstitialPlacement: parsed.interstitialPlacement || UNITY_INTERSTITIAL_PLACEMENT,
          levelPlayAppKeyConfigured: Boolean(parsed.levelPlayAppKeyConfigured),
          rewardedAdUnitConfigured: Boolean(parsed.rewardedAdUnitConfigured),
          interstitialAdUnitConfigured: Boolean(parsed.interstitialAdUnitConfigured),
          rewardedReady: Boolean(parsed.rewardedReady),
          interstitialReady: Boolean(parsed.interstitialReady),
          missingFields: Array.isArray(parsed.missingFields)
            ? parsed.missingFields
            : ['levelPlayAppKey', 'rewardedAdUnitId', 'interstitialAdUnitId'],
        };
      } catch {
        // Fall through to web status
      }
    }

    return {
      hasNativeBridge: false,
      isInitialized: false,
      unityGameId: UNITY_ANDROID_GAME_ID,
      rewardedPlacement: UNITY_REWARDED_PLACEMENT,
      interstitialPlacement: UNITY_INTERSTITIAL_PLACEMENT,
      levelPlayAppKeyConfigured: false,
      rewardedAdUnitConfigured: false,
      interstitialAdUnitConfigured: false,
      rewardedReady: false,
      interstitialReady: false,
      missingFields: ['levelPlayAppKey', 'rewardedAdUnitId', 'interstitialAdUnitId'],
    };
  }

  static isRewardedAdAvailable(): boolean {
    const status = this.getConfigStatus();
    if (!status.hasNativeBridge) return false;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
    return status.isInitialized && status.levelPlayAppKeyConfigured && status.rewardedAdUnitConfigured && status.rewardedReady;
  }

  static getUserFriendlyUnavailableMessage(status?: LevelPlayConfigStatus): string {
    const cfg = status || this.getConfigStatus();
    if (!cfg.hasNativeBridge) {
      return 'Rewarded video ads run on the Android LevelPlay build once App Key & Ad Unit IDs are configured. No reward granted.';
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'Internet connection required to load a rewarded ad.';
    }
    if (cfg.missingFields.length > 0) {
      return `LevelPlay setup incomplete (missing ${cfg.missingFields.join(', ')}). Game ID ${cfg.unityGameId} saved; add keys in Android strings.xml to enable live ads.`;
    }
    return 'Rewarded ad is not ready yet. Please try again in a moment.';
  }

  /**
   * Show optional Rewarded Ad via native LevelPlay Mediation.
   * Strictly enforces:
   * - Single-flight mutex (only one active ad at a time)
   * - Offline & config verification (NEVER fakes rewards on web preview or unconfigured APK)
   * - Unique rewardToken verification & deduplication via DbPersistence
   */
  static async showRewardedAd(placement: RewardedPlacementKey): Promise<RewardedAdResult> {
    this.initialize();

    if (this.activeAdRequest) {
      return {
        completed: false,
        status: 'BUSY',
        placement,
        reason: 'Another ad request is currently active.',
      };
    }

    const bridge = this.getNativeBridge();
    const cfg = this.getConfigStatus();

    if (!bridge?.showRewardedAd || !cfg.hasNativeBridge) {
      return {
        completed: false,
        status: 'UNAVAILABLE',
        placement,
        reason: this.getUserFriendlyUnavailableMessage(cfg),
      };
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return {
        completed: false,
        status: 'UNAVAILABLE',
        placement,
        reason: 'Offline mode — rewarded ads require an active connection.',
      };
    }

    if (!cfg.levelPlayAppKeyConfigured || !cfg.rewardedAdUnitConfigured) {
      return {
        completed: false,
        status: 'UNAVAILABLE',
        placement,
        reason: this.getUserFriendlyUnavailableMessage(cfg),
      };
    }

    const requestId = `rwd_${placement}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.activeAdRequest = { requestId };

    const nativePayload = await new Promise<any>(resolve => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        if (this.activeAdRequest?.requestId === requestId) {
          this.activeAdRequest = null;
        }
        resolve({
          requestId,
          adType: 'REWARDED',
          status: 'FAILED',
          reason: 'Rewarded ad request timed out.',
        });
      }, 90_000);

      this.pendingRequests.set(requestId, {
        adType: 'REWARDED',
        placement,
        resolve,
        timeoutId,
      });

      try {
        bridge.showRewardedAd!(requestId, placement);
      } catch (err: any) {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        if (this.activeAdRequest?.requestId === requestId) {
          this.activeAdRequest = null;
        }
        resolve({
          requestId,
          adType: 'REWARDED',
          status: 'FAILED',
          reason: err?.message || 'Native bridge invocation failed.',
        });
      }
    });

    const rewardToken = typeof nativePayload?.rewardToken === 'string' ? nativePayload.rewardToken : undefined;
    if (nativePayload?.status === 'REWARDED' && rewardToken) {
      // Guard against duplicate token replay across callbacks
      const replayKey = `lp_token_${rewardToken}`;
      if (DbPersistence.hasProcessedEvent(replayKey)) {
        return {
          completed: false,
          status: 'FAILED',
          placement,
          reason: 'Duplicate reward token rejected.',
        };
      }
      DbPersistence.markEventProcessed(replayKey);
      return {
        completed: true,
        status: 'REWARDED',
        placement,
        rewardToken,
      };
    }

    const mappedStatus =
      nativePayload?.status === 'CLOSED_NO_REWARD'
        ? 'CLOSED_NO_REWARD'
        : nativePayload?.status === 'UNAVAILABLE'
        ? 'UNAVAILABLE'
        : 'FAILED';

    return {
      completed: false,
      status: mappedStatus,
      placement,
      reason: nativePayload?.reason || 'Ad did not complete — reward was not granted.',
    };
  }

  private static getLastInterstitialShownMs(): number {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(INTERSTITIAL_COOLDOWN_LS_KEY);
        if (raw) {
          const parsed = Number(raw);
          if (!Number.isNaN(parsed)) return parsed;
        }
      }
    } catch {}
    return this.lastInterstitialShownMemoryMs;
  }

  private static setLastInterstitialShownMs(ts: number): void {
    this.lastInterstitialShownMemoryMs = ts;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(INTERSTITIAL_COOLDOWN_LS_KEY, String(ts));
      }
    } catch {}
  }

  /**
   * Attempts a non-intrusive Interstitial ONLY at natural breaks (Match Result, Tournament End, Season End).
   * Strictly blocked during Protected Gameplay Flows (Live Ball-by-Ball, Auction, Retentions, XI, Transfer, Setup, Saving).
   * Enforces a 180s cooldown between displays.
   */
  static async tryShowInterstitial(
    placement: InterstitialPlacementKey,
    options?: {
      protectedFlow?: ProtectedGameplayFlow | null;
      nowMs?: number;
    }
  ): Promise<InterstitialAdResult> {
    this.initialize();
    const nowMs = options?.nowMs ?? Date.now();

    if (options?.protectedFlow) {
      return {
        shown: false,
        status: 'BLOCKED_PROTECTED_FLOW',
        reason: `Interstitials are disabled during ${options.protectedFlow}.`,
      };
    }

    if (this.activeAdRequest) {
      return { shown: false, status: 'BUSY', reason: 'Another ad is currently displayed.' };
    }

    const lastShown = this.getLastInterstitialShownMs();
    if (lastShown > 0 && nowMs - lastShown < INTERSTITIAL_COOLDOWN_MS) {
      return { shown: false, status: 'COOLDOWN', reason: 'Interstitial cooldown active.' };
    }

    const bridge = this.getNativeBridge();
    const cfg = this.getConfigStatus();

    if (
      !bridge?.showInterstitialAd ||
      !cfg.hasNativeBridge ||
      !cfg.levelPlayAppKeyConfigured ||
      !cfg.interstitialAdUnitConfigured ||
      !cfg.interstitialReady ||
      (typeof navigator !== 'undefined' && navigator.onLine === false)
    ) {
      return { shown: false, status: 'UNAVAILABLE', reason: 'Interstitial not configured or not ready.' };
    }

    const requestId = `int_${placement}_${nowMs}_${Math.random().toString(36).slice(2, 8)}`;
    this.activeAdRequest = { requestId };

    const nativePayload = await new Promise<any>(resolve => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        if (this.activeAdRequest?.requestId === requestId) {
          this.activeAdRequest = null;
        }
        resolve({ status: 'FAILED', reason: 'Interstitial timed out' });
      }, 60_000);

      this.pendingRequests.set(requestId, {
        adType: 'INTERSTITIAL',
        placement,
        resolve,
        timeoutId,
      });

      try {
        bridge.showInterstitialAd!(requestId, placement);
      } catch {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        if (this.activeAdRequest?.requestId === requestId) {
          this.activeAdRequest = null;
        }
        resolve({ status: 'FAILED' });
      }
    });

    if (nativePayload?.status === 'INTERSTITIAL_CLOSED') {
      this.setLastInterstitialShownMs(Date.now());
      return { shown: true, status: 'INTERSTITIAL_CLOSED' };
    }

    return {
      shown: false,
      status: nativePayload?.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'FAILED',
      reason: nativePayload?.reason,
    };
  }
}
