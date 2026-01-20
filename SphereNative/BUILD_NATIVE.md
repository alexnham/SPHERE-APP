# Building SphereNative with Native Plaid Integration

This guide covers building and running the SphereNative React Native app with the native Plaid Link SDK integrated for iOS and Android.

## Prerequisites

### macOS (for iOS builds)
- **Xcode 16.0+** (with iOS SDK 17.5+)
- **Node.js 18+** and **npm** or **yarn**
- **CocoaPods** (usually installed with Xcode)
- **Expo CLI** (optional but recommended)

### Android (for Android builds)
- **Android Studio** with Android SDK 34+
- **Java JDK 11+**
- **ANDROID_HOME** environment variable set
- **Node.js 18+** and **npm** or **yarn**

### Backend Requirements
Your backend must support:
- `/api/create_link_token` — accepts optional `redirect_uri` parameter and returns `link_token`
- `/api/exchange_public_token` — accepts `public_token` and exchanges it with Plaid for an `access_token` (server-side only)
- `/api/get_accounts` — returns linked bank accounts
- `/api/get_summary` — returns account summary data

## Installation

### 1. Install Dependencies
```bash
cd SphereNative
npm install
```

### 2. Prebuild Native Projects

#### iOS
```bash
npx expo prebuild --platform ios
```

This generates the `ios/` directory and links native modules including the Plaid SDK.

#### Android
```bash
npx expo prebuild --platform android
```

This generates the `android/` directory and links native modules.

### 3. Install Native Pods (iOS only)
```bash
cd ios
pod install --repo-update
cd ..
```

**Important:** CocoaPods must be run after each `npm install` or when upgrading dependencies.

## Running the App

### iOS on Simulator

#### Option 1: Using Xcode (Recommended)
```bash
open ios/SphereNative.xcworkspace
```
1. In Xcode, select an iPhone simulator from the top toolbar (e.g., iPhone 15)
2. Click the **Play** button to build and run
3. The app will launch in the simulator

#### Option 2: Using Command Line
```bash
npm run ios                                               
```

### iOS on Physical Device
1. Connect your iPhone via USB
2. In Xcode, select your device from the toolbar
3. Click the **Play** button to build and run
4. Trust the developer certificate on your device (Settings > General > VPN & Device Management)

### Android on Emulator
```bash
npx expo run:android
```

Or in Android Studio:
1. Open `android/` in Android Studio
2. Start an emulator from AVD Manager
3. Click **Run** or press Ctrl+R

### Android on Physical Device
1. Connect your device via USB
2. Enable **Developer Mode** and **USB Debugging** on the device
3. Run:
   ```bash
   npx expo run:android
   ```

## Plaid Integration Details

### Deep Link Configuration
The app is configured to handle the Plaid redirect URI:
- **Scheme:** `spherefinance`
- **Redirect URI:** `spherefinance://plaid-link-callback`

This is set in `app.json`:
- **iOS:** `ios.infoPlist.CFBundleURLTypes`
- **Android:** `android.intentFilters`

### Backend Setup for Plaid
When creating a link token, your backend should include the redirect URI if using OAuth:
```json
{
  "client_id": "your_plaid_client_id",
  "secret": "your_plaid_secret",
  "client_name": "SphereFinance",
  "user": {
    "client_user_id": "user_email_or_id"
  },
  "client_id": "your_plaid_client_id",
  "redirect_uri": "spherefinance://plaid-link-callback",
  "products": ["auth", "transactions", "investments", "liabilities"]
}
```

### Plaid Dashboard Configuration
1. Go to [Plaid Dashboard](https://dashboard.plaid.com)
2. Navigate to **API Keys** or **Settings**
3. Register the redirect URI: `spherefinance://plaid-link-callback`
4. Ensure your app environment (development/production) is configured correctly

## Troubleshooting

### iOS Build Fails with "iOS 26.2 not installed"
**Cause:** Xcode project deployment target mismatch.
**Fix:**
1. Open `ios/SphereNative.xcworkspace` in Xcode
2. Select **SphereNative** project in the sidebar
3. Select **SphereNative** target
4. Go to **Build Settings** > **Deployment** and set **iOS Deployment Target** to 17.5 or lower

### CocoaPods Error: "Pod not found"
**Cause:** `node_modules` or pods are out of sync.
**Fix:**
```bash
rm -rf ios/Pods ios/Podfile.lock node_modules package-lock.json
npm install
npx expo prebuild --platform ios
cd ios
pod install --repo-update
cd ..
```

### Plaid Link Not Opening
**Cause:** Native module not linked or link token invalid.
**Fix:**
1. Verify pods installed: `ls ios/Pods | grep -i plaid`
2. Check console logs for errors in Xcode (Cmd+Shift+C)
3. Ensure your backend `/api/create_link_token` endpoint returns a valid `link_token`
4. Verify redirect URI matches Plaid Dashboard configuration

### Metro Bundler Issues
**Cause:** Stale cache or module resolution issues.
**Fix:**
```bash
npx react-native start --reset-cache
```

Then rebuild in a new terminal:
```bash
npx react-native run-ios
# or
npx react-native run-android
```

### Public Token Not Received on Success
**Cause:** Backend not forwarding redirect_uri to Plaid or Plaid SDK version mismatch.
**Fix:**
1. Ensure your backend `/api/create_link_token` includes `redirect_uri` in the request to Plaid
2. Check Plaid response for errors in backend logs
3. Verify react-native-plaid-link-sdk version (should be 11.x compatible with Xcode 15/16)

## Development Tips

### Clear Build Cache
```bash
# Remove all generated files
rm -rf ios/build android/build

# Clean npm cache
npm cache clean --force

# Reset Metro bundler cache
npx react-native start --reset-cache
```

### Debug Logs
Enable verbose logging:
```bash
EXPO_DEBUG=1 npx expo run:ios
```

### Testing Plaid Flow
1. Use Plaid's test credentials in development
2. In the Plaid Link UI, search for "Platypus Bank" to use test data
3. Test account credentials are provided by Plaid

## File Structure
```
SphereNative/
├── app.json              # Expo config with deep link setup
├── App.tsx               # Root component
├── package.json          # Dependencies
├── ios/                  # Generated iOS native project
│   ├── Podfile           # CocoaPods dependencies
│   └── SphereNative.xcworkspace  # Main Xcode workspace
├── android/              # Generated Android native project
└── src/                  # Source code
    ├── screens/
    │   └── OnboardingScreen.tsx  # Plaid integration
    ├── lib/
    │   └── plaid.ts      # Plaid API helpers
    └── ...
```

## Production Build

### iOS
```bash
# Archive for TestFlight/App Store
open ios/SphereNative.xcworkspace
# In Xcode: Product > Archive
# Follow TestFlight upload flow
```

### Android
```bash
# Build release APK or AAB
cd android
./gradlew bundleRelease
# Output: app/release/app-release.aab
```

## Support & Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [React Native Plaid Link SDK](https://github.com/plaid/react-native-plaid-link-sdk)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

## Questions?

If you encounter issues:
1. Check console logs in Xcode or Android Studio
2. Review CocoaPods/Gradle build output
3. Ensure backend endpoints are working (test with curl/Postman)
4. Verify Plaid credentials and dashboard configuration
