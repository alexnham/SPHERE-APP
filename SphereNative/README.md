# SphereNative

A React Native mobile application built with Expo, featuring financial management capabilities with Plaid integration for bank account connectivity.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Build Setup](#build-setup)
- [Running the App](#running-the-app)
- [Development](#development)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

## Overview

SphereNative is built with:
- **React Native** 0.81.5
- **Expo SDK** ~54.0.31
- **TypeScript** 5.9.2
- **React** 19.1.0
- **New Architecture** enabled
- **Plaid Link SDK** for bank connectivity
- **Supabase** for backend services

## Prerequisites

### macOS (Required for iOS Development)

- **Xcode 16.0+** with iOS SDK 17.5+
- **Node.js 18+** and npm
- **CocoaPods** (usually installed with Xcode)
  ```bash
  sudo gem install cocoapods
  ```

### Android Development

- **Android Studio** with Android SDK 34+
- **Java JDK 11+**
- **ANDROID_HOME** environment variable set
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### Common Requirements

- **Node.js 18+** and npm
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SPHERE-APP/SphereNative
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Prebuild Native Projects

Generate the native iOS and Android projects:

#### iOS
```bash
npx expo prebuild --platform ios
```

#### Android
```bash
npx expo prebuild --platform android
```

### 4. Install iOS Dependencies

```bash
cd ios
pod install --repo-update
cd ..
```

**Important:** Run `pod install` after every `npm install` or when upgrading dependencies.

## Build Setup

### iOS Setup

1. **Open the workspace in Xcode:**
   ```bash
   open ios/SphereNative.xcworkspace
   ```
   ⚠️ **Always use `.xcworkspace`, not `.xcodeproj`**

2. **Configure Signing:**
   - Select the `SphereNative` project in Xcode
   - Go to **Signing & Capabilities**
   - Select your development team
   - Ensure bundle identifier is `com.sphere.finance`

3. **Set Deployment Target:**
   - In **Build Settings** > **Deployment**
   - Set **iOS Deployment Target** to **17.5** or lower

### Android Setup

1. **Open in Android Studio:**
   ```bash
   open -a "Android Studio" android
   ```

2. **Configure Gradle:**
   - Android Studio will automatically sync Gradle
   - Ensure SDK 34+ is installed via SDK Manager

3. **Set Package Name:**
   - Package is configured as `com.sphere.finance` in `app.json`

## Running the App

### iOS Simulator

#### Option 1: Using Xcode (Recommended)
```bash
open ios/SphereNative.xcworkspace
```
1. Select an iPhone simulator from the toolbar (e.g., iPhone 15)
2. Click the **Play** button (⌘R)

#### Option 2: Using Command Line
```bash
npm run ios
# or
npx expo run:ios
```

### iOS Physical Device

1. Connect your iPhone via USB
2. In Xcode, select your device from the toolbar
3. Click **Play** to build and run
4. Trust the developer certificate on your device:
   - Settings > General > VPN & Device Management
   - Trust your developer certificate

### Android Emulator

```bash
npm run android
# or
npx expo run:android
```

**Or in Android Studio:**
1. Open `android/` in Android Studio
2. Start an emulator from AVD Manager
3. Click **Run** or press `Ctrl+R` (Windows/Linux) / `Cmd+R` (macOS)

### Android Physical Device

1. Connect your device via USB
2. Enable **Developer Mode** and **USB Debugging**:
   - Settings > About Phone > Tap "Build Number" 7 times
   - Settings > Developer Options > Enable "USB Debugging"
3. Run:
   ```bash
   npx expo run:android
   ```

### Web (Development Only)

```bash
npm run web
# or
npx expo start --web
```

## Development

### Start Metro Bundler

```bash
npm start
# or
npx expo start
```

This starts the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Press `w` to open in web browser
- Scan QR code with Expo Go app (limited functionality with native modules)

### Available Scripts

```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
```

### Environment Variables

Create a `.env` file in the root directory (if needed):
```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Configuration

### App Configuration (`app.json`)

- **Bundle Identifier (iOS):** `com.sphere.finance`
- **Package (Android):** `com.sphere.finance`
- **Deep Link Scheme:** `spherefinance`
- **New Architecture:** Enabled
- **Orientation:** Portrait only

### Plaid Integration

The app uses deep linking for Plaid OAuth redirects:
- **Scheme:** `spherefinance`
- **Redirect URI:** `spherefinance://plaid-link-callback`

Configured in:
- **iOS:** `app.json` → `ios.infoPlist.CFBundleURLTypes`
- **Android:** `app.json` → `android.intentFilters`

### Backend API Requirements

Your backend must provide these endpoints:

- `POST /api/create_link_token` - Creates Plaid link token
  - Accepts optional `redirect_uri` parameter
  - Returns `{ link_token: string }`

- `POST /api/exchange_public_token` - Exchanges public token for access token
  - Accepts `{ public_token: string }`
  - Server-side only (never expose Plaid secret to client)

- `GET /api/get_accounts` - Returns linked bank accounts
  - Returns array of account objects

- `GET /api/get_summary` - Returns account summary data
  - Returns summary object

## Troubleshooting

### iOS Build Issues

#### "iOS 26.2 not installed" Error
**Fix:**
1. Open `ios/SphereNative.xcworkspace` in Xcode
2. Select **SphereNative** project → **SphereNative** target
3. **Build Settings** > **Deployment** > Set **iOS Deployment Target** to **17.5**

#### CocoaPods Errors
**Fix:**
```bash
rm -rf ios/Pods ios/Podfile.lock node_modules package-lock.json
npm install
npx expo prebuild --platform ios
cd ios
pod install --repo-update
cd ..
```

#### "Pod not found" Error
**Fix:**
```bash
cd ios
pod repo update
pod install --repo-update
cd ..
```

### Android Build Issues

#### Gradle Sync Failed
**Fix:**
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --platform android --clean
```

#### SDK Not Found
**Fix:**
1. Open Android Studio
2. **Tools** > **SDK Manager**
3. Install Android SDK 34+ and build tools

### Metro Bundler Issues

#### Cache Problems
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or clear all caches
rm -rf node_modules
npm install
npx expo start --clear
```

#### Module Resolution Errors
```bash
# Reset watchman (if installed)
watchman watch-del-all

# Clear npm cache
npm cache clean --force
npm install
```

### Plaid Integration Issues

#### Plaid Link Not Opening
**Check:**
1. Verify pods installed: `ls ios/Pods | grep -i plaid`
2. Check Xcode console logs (⌘⇧C)
3. Ensure backend `/api/create_link_token` returns valid `link_token`
4. Verify redirect URI matches Plaid Dashboard configuration

#### Public Token Not Received
**Fix:**
1. Ensure backend includes `redirect_uri` in Plaid API request
2. Check backend logs for Plaid API errors
3. Verify `react-native-plaid-link-sdk` version compatibility

### General Issues

#### Clean Build
```bash
# Remove all generated files
rm -rf ios/build android/build ios/Pods

# Clean npm cache
npm cache clean --force

# Reinstall
npm install
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
```

#### Debug Mode
```bash
# Enable verbose logging
EXPO_DEBUG=1 npx expo run:ios
```

## Project Structure

```
SphereNative/
├── app.json                 # Expo configuration
├── App.tsx                  # Root component
├── index.ts                 # Entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
│
├── ios/                     # iOS native project (generated)
│   ├── Podfile              # CocoaPods dependencies
│   ├── Podfile.lock         # Locked pod versions
│   ├── Pods/                # Installed pods
│   └── SphereNative.xcworkspace  # Xcode workspace
│
├── android/                 # Android native project (generated)
│   └── app/                 # Android app module
│
├── assets/                  # Static assets
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
│
└── src/                     # Source code
    ├── components/          # React components
    │   ├── onboarding/     # Onboarding flow components
    │   ├── accounts/        # Account-related components
    │   ├── bills/           # Bill management components
    │   ├── debts/           # Debt tracking components
    │   └── ...
    ├── contexts/            # React contexts (Theme, Auth, etc.)
    ├── hooks/               # Custom React hooks
    ├── lib/                 # Utility functions and API clients
    ├── navigation/          # Navigation configuration
    └── screens/             # Screen components
```

## Production Builds

### iOS Production Build

1. **Archive in Xcode:**
   ```bash
   open ios/SphereNative.xcworkspace
   ```
   - **Product** > **Archive**
   - Follow TestFlight/App Store upload flow

2. **Or use EAS Build (if configured):**
   ```bash
   eas build --platform ios
   ```

### Android Production Build

1. **Build Release Bundle:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Output: `app/build/outputs/bundle/release/app-release.aab`

2. **Or build APK:**
   ```bash
   ./gradlew assembleRelease
   ```
   Output: `app/build/outputs/apk/release/app-release.apk`

3. **Or use EAS Build:**
   ```bash
   eas build --platform android
   ```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Plaid Documentation](https://plaid.com/docs/)
- [React Native Plaid Link SDK](https://github.com/plaid/react-native-plaid-link-sdk)
- [Supabase Documentation](https://supabase.com/docs)

## Support

For issues or questions:
1. Check console logs in Xcode (iOS) or Android Studio (Android)
2. Review CocoaPods/Gradle build output
3. Test backend endpoints with curl/Postman
4. Verify Plaid credentials and dashboard configuration
5. Check the [BUILD_NATIVE.md](./BUILD_NATIVE.md) file for Plaid-specific setup details
