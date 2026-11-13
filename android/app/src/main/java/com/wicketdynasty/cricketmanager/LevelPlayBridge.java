package com.wicketdynasty.cricketmanager;

import android.app.Activity;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.text.TextUtils;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.annotation.NonNull;
import com.unity3d.mediation.LevelPlay;
import com.unity3d.mediation.LevelPlayAdError;
import com.unity3d.mediation.LevelPlayAdInfo;
import com.unity3d.mediation.LevelPlayConfiguration;
import com.unity3d.mediation.LevelPlayInitError;
import com.unity3d.mediation.LevelPlayInitListener;
import com.unity3d.mediation.LevelPlayInitRequest;
import com.unity3d.mediation.interstitial.LevelPlayInterstitialAd;
import com.unity3d.mediation.interstitial.LevelPlayInterstitialAdListener;
import com.unity3d.mediation.rewarded.LevelPlayReward;
import com.unity3d.mediation.rewarded.LevelPlayRewardedAd;
import com.unity3d.mediation.rewarded.LevelPlayRewardedAdListener;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.UUID;

/**
 * Native Android Bridge for Unity LevelPlay Mediation (Rewarded + Interstitial only; ZERO Banner Ads).
 * Exposes window.WicketDynastyAds to the bundled WebView application.
 */
public class LevelPlayBridge {

    private final Activity activity;
    private final WebView webView;

    private final String unityGameId;
    private final String rewardedPlacement;
    private final String interstitialPlacement;
    private final String levelPlayAppKey;
    private final String rewardedAdUnitId;
    private final String interstitialAdUnitId;

    private boolean isInitializing = false;
    private boolean isInitialized = false;
    private LevelPlayRewardedAd rewardedAd;
    private LevelPlayInterstitialAd interstitialAd;

    private String pendingRewardedRequestId = null;
    private String pendingRewardedPlacement = null;
    private boolean pendingRewardEarned = false;

    private String pendingInterstitialRequestId = null;

    public LevelPlayBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.unityGameId = safeString(R.string.unity_game_id);
        this.rewardedPlacement = safeString(R.string.unity_rewarded_placement);
        this.interstitialPlacement = safeString(R.string.unity_interstitial_placement);
        this.levelPlayAppKey = safeString(R.string.levelplay_app_key);
        this.rewardedAdUnitId = safeString(R.string.levelplay_rewarded_ad_unit_id);
        this.interstitialAdUnitId = safeString(R.string.levelplay_interstitial_ad_unit_id);
    }

    private String safeString(int resId) {
        try {
            String value = activity.getString(resId);
            return value != null ? value.trim() : "";
        } catch (Exception e) {
            return "";
        }
    }

    private boolean hasNetwork() {
        try {
            ConnectivityManager cm = (ConnectivityManager) activity.getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            NetworkCapabilities caps = cm.getNetworkCapabilities(cm.getActiveNetwork());
            return caps != null && (
                caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
            );
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public boolean isNativeBridgeAvailable() {
        return true;
    }

    @JavascriptInterface
    public String getConfigStatusJson() {
        try {
            JSONObject obj = new JSONObject();
            obj.put("hasNativeBridge", true);
            obj.put("isInitialized", isInitialized);
            obj.put("unityGameId", unityGameId);
            obj.put("rewardedPlacement", rewardedPlacement);
            obj.put("interstitialPlacement", interstitialPlacement);
            obj.put("levelPlayAppKeyConfigured", !TextUtils.isEmpty(levelPlayAppKey));
            obj.put("rewardedAdUnitConfigured", !TextUtils.isEmpty(rewardedAdUnitId));
            obj.put("interstitialAdUnitConfigured", !TextUtils.isEmpty(interstitialAdUnitId));
            obj.put("rewardedReady", rewardedAd != null && rewardedAd.isAdReady());
            obj.put("interstitialReady", interstitialAd != null && interstitialAd.isAdReady());

            JSONArray missing = new JSONArray();
            if (TextUtils.isEmpty(levelPlayAppKey)) missing.put("levelPlayAppKey");
            if (TextUtils.isEmpty(rewardedAdUnitId)) missing.put("rewardedAdUnitId");
            if (TextUtils.isEmpty(interstitialAdUnitId)) missing.put("interstitialAdUnitId");
            obj.put("missingFields", missing);
            return obj.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    @JavascriptInterface
    public void initializeAds() {
        activity.runOnUiThread(() -> {
            if (isInitialized || isInitializing) return;
            if (TextUtils.isEmpty(levelPlayAppKey)) {
                return;
            }
            isInitializing = true;
            LevelPlayInitRequest initRequest = new LevelPlayInitRequest.Builder(levelPlayAppKey).build();
            LevelPlay.init(activity, initRequest, new LevelPlayInitListener() {
                @Override
                public void onInitSuccess(@NonNull LevelPlayConfiguration configuration) {
                    isInitializing = false;
                    isInitialized = true;
                    setupAdObjects();
                }

                @Override
                public void onInitFailed(@NonNull LevelPlayInitError error) {
                    isInitializing = false;
                    isInitialized = false;
                }
            });
        });
    }

    private void setupAdObjects() {
        if (!TextUtils.isEmpty(rewardedAdUnitId) && rewardedAd == null) {
            rewardedAd = new LevelPlayRewardedAd(rewardedAdUnitId);
            rewardedAd.setListener(new LevelPlayRewardedAdListener() {
                @Override
                public void onAdLoaded(@NonNull LevelPlayAdInfo adInfo) {}

                @Override
                public void onAdLoadFailed(@NonNull LevelPlayAdError error) {}

                @Override
                public void onAdDisplayed(@NonNull LevelPlayAdInfo adInfo) {}

                @Override
                public void onAdDisplayFailed(@NonNull LevelPlayAdError error, @NonNull LevelPlayAdInfo adInfo) {
                    String reqId = pendingRewardedRequestId;
                    pendingRewardedRequestId = null;
                    pendingRewardedPlacement = null;
                    pendingRewardEarned = false;
                    if (reqId != null) {
                        emitResult(reqId, "REWARDED", "FAILED", "Ad display failed: " + error.getErrorMessage(), null);
                    }
                    if (rewardedAd != null) rewardedAd.loadAd();
                }

                @Override
                public void onAdRewarded(@NonNull LevelPlayReward reward, @NonNull LevelPlayAdInfo adInfo) {
                    pendingRewardEarned = true;
                }

                @Override
                public void onAdClosed(@NonNull LevelPlayAdInfo adInfo) {
                    String reqId = pendingRewardedRequestId;
                    String plc = pendingRewardedPlacement;
                    boolean earned = pendingRewardEarned;
                    pendingRewardedRequestId = null;
                    pendingRewardedPlacement = null;
                    pendingRewardEarned = false;
                    if (reqId != null) {
                        if (earned) {
                            String token = "lp_rwd_" + (plc != null ? plc : "ad") + "_" + reqId + "_" + UUID.randomUUID().toString();
                            emitResult(reqId, "REWARDED", "REWARDED", null, token);
                        } else {
                            emitResult(reqId, "REWARDED", "CLOSED_NO_REWARD", "Ad closed before completion", null);
                        }
                    }
                    if (rewardedAd != null) rewardedAd.loadAd();
                }

                @Override
                public void onAdClicked(@NonNull LevelPlayAdInfo adInfo) {}
            });
            rewardedAd.loadAd();
        }

        if (!TextUtils.isEmpty(interstitialAdUnitId) && interstitialAd == null) {
            interstitialAd = new LevelPlayInterstitialAd(interstitialAdUnitId);
            interstitialAd.setListener(new LevelPlayInterstitialAdListener() {
                @Override
                public void onAdLoaded(@NonNull LevelPlayAdInfo adInfo) {}

                @Override
                public void onAdLoadFailed(@NonNull LevelPlayAdError error) {}

                @Override
                public void onAdDisplayed(@NonNull LevelPlayAdInfo adInfo) {}

                @Override
                public void onAdDisplayFailed(@NonNull LevelPlayAdError error, @NonNull LevelPlayAdInfo adInfo) {
                    String reqId = pendingInterstitialRequestId;
                    pendingInterstitialRequestId = null;
                    if (reqId != null) {
                        emitResult(reqId, "INTERSTITIAL", "FAILED", error.getErrorMessage(), null);
                    }
                    if (interstitialAd != null) interstitialAd.loadAd();
                }

                @Override
                public void onAdClosed(@NonNull LevelPlayAdInfo adInfo) {
                    String reqId = pendingInterstitialRequestId;
                    pendingInterstitialRequestId = null;
                    if (reqId != null) {
                        emitResult(reqId, "INTERSTITIAL", "INTERSTITIAL_CLOSED", null, null);
                    }
                    if (interstitialAd != null) interstitialAd.loadAd();
                }

                @Override
                public void onAdClicked(@NonNull LevelPlayAdInfo adInfo) {}
            });
            interstitialAd.loadAd();
        }
    }

    @JavascriptInterface
    public boolean isRewardedReady() {
        return isInitialized && rewardedAd != null && rewardedAd.isAdReady();
    }

    @JavascriptInterface
    public boolean isInterstitialReady() {
        return isInitialized && interstitialAd != null && interstitialAd.isAdReady();
    }

    @JavascriptInterface
    public void showRewardedAd(String requestId, String placementKey) {
        activity.runOnUiThread(() -> {
            if (TextUtils.isEmpty(levelPlayAppKey) || TextUtils.isEmpty(rewardedAdUnitId)) {
                emitResult(requestId, "REWARDED", "UNAVAILABLE", "LevelPlay App Key or Rewarded Ad Unit ID is not configured.", null);
                return;
            }
            if (!hasNetwork()) {
                emitResult(requestId, "REWARDED", "UNAVAILABLE", "Offline mode — rewarded ad unavailable.", null);
                return;
            }
            if (!isInitialized) {
                initializeAds();
                emitResult(requestId, "REWARDED", "UNAVAILABLE", "Ad SDK initializing, please try again shortly.", null);
                return;
            }
            if (rewardedAd == null || !rewardedAd.isAdReady()) {
                if (rewardedAd != null) rewardedAd.loadAd();
                emitResult(requestId, "REWARDED", "UNAVAILABLE", "Rewarded ad is not filled yet.", null);
                return;
            }
            pendingRewardedRequestId = requestId;
            pendingRewardedPlacement = placementKey;
            pendingRewardEarned = false;
            rewardedAd.showAd(activity, rewardedPlacement);
        });
    }

    @JavascriptInterface
    public void showInterstitialAd(String requestId, String placementKey) {
        activity.runOnUiThread(() -> {
            if (TextUtils.isEmpty(levelPlayAppKey) || TextUtils.isEmpty(interstitialAdUnitId)) {
                emitResult(requestId, "INTERSTITIAL", "UNAVAILABLE", "LevelPlay App Key or Interstitial Ad Unit ID is not configured.", null);
                return;
            }
            if (!hasNetwork() || !isInitialized || interstitialAd == null || !interstitialAd.isAdReady()) {
                if (interstitialAd != null && hasNetwork() && isInitialized) interstitialAd.loadAd();
                emitResult(requestId, "INTERSTITIAL", "UNAVAILABLE", "Interstitial ad not ready.", null);
                return;
            }
            pendingInterstitialRequestId = requestId;
            interstitialAd.showAd(activity, interstitialPlacement);
        });
    }

    private void emitResult(String requestId, String adType, String status, String reason, String rewardToken) {
        try {
            JSONObject payload = new JSONObject();
            payload.put("requestId", requestId);
            payload.put("adType", adType);
            payload.put("status", status);
            if (reason != null) payload.put("reason", reason);
            if (rewardToken != null) payload.put("rewardToken", rewardToken);

            final String script = "window.__wdLevelPlayCallback && window.__wdLevelPlayCallback(" +
                JSONObject.quote(payload.toString()) + ");";
            webView.post(() -> webView.evaluateJavascript(script, null));
        } catch (Exception ignored) {}
    }
}
