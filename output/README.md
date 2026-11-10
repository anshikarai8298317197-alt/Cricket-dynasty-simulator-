# WICKET DYNASTY - Cricket Franchise Management Simulator
## Android Build & Export Package

### Package Information
- **Application ID**: `com.wicketdynasty.cricketmanager`
- **Application Name**: WICKET DYNASTY
- **Version**: 1.0.0 (Version Code: 1)
- **Target Platform**: Android (Portrait Orientation, API 24-34)
- **Architecture**: Native Android WebView + High-Performance React/TypeScript Client
- **Offline Persistence**: Dual-layer IndexedDB (`wicket_dynasty_db`) and synchronous LocalStorage fail-safe

---

### Included Artifacts
1. **`WICKET_DYNASTY_DEBUG.apk`**: Debug APK package ready for sideloading and Android device testing.
2. **`WICKET_DYNASTY.aab`**: Android App Bundle format for Google Play Store upload.
3. **`WICKET_DYNASTY_COMPLETE_PROJECT.zip`**: Complete source code and Android project.

---

### How to Build Natively with Android Studio or CLI
1. Unzip `WICKET_DYNASTY_COMPLETE_PROJECT.zip`.
2. Open the `android/` directory in Android Studio.
3. Or from command line with Android SDK configured:
   ```bash
   cd android
   ./gradlew assembleDebug      # Builds debug APK in app/build/outputs/apk/debug/
   ./gradlew bundleRelease      # Builds release AAB in app/build/outputs/bundle/release/
   ```
