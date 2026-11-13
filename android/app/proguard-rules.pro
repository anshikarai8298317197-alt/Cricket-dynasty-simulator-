# WICKET DYNASTY ProGuard Rules (Preserves WebView JS Bridge & Unity LevelPlay SDK)
-keepattributes JavascriptInterface
-keepclassmembers class com.wicketdynasty.cricketmanager.LevelPlayBridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Unity LevelPlay & Unity Ads SDK
-keep class com.unity3d.mediation.** { *; }
-keep class com.ironsource.** { *; }
-keep class com.unity3d.ads.** { *; }
-dontwarn com.ironsource.**
-dontwarn com.unity3d.**
