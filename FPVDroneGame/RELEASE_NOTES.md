# Release Notes - Version 1.0.1

## 🚀 Release Summary
This is a patch release of the FPV Drone Racing game.

## 📦 Version Information
- **Version**: 1.0.1
- **Build Date**: 2025-01-19
- **Platform**: Android (React Native + Expo)

## 🔧 Changes Made
- Version bumped from 1.0.0 to 1.0.1
- Android versionCode incremented from 1 to 2
- Added missing splash.png asset for proper build configuration
- Fixed prebuild configuration issues

## 📱 Build Configuration
- **Target SDK**: 35
- **Min SDK**: 24
- **Build Tools**: 35.0.0
- **Expo SDK**: ~53.0.20
- **React Native**: 0.79.5

## 🛠 Technical Details
- Dependencies resolved with legacy peer deps for Three.js compatibility
- EAS build configuration ready for production builds
- Android prebuild successfully completed
- All assets properly configured

## 🏗 Build Instructions
To build the production APK:

1. Ensure you have EAS CLI installed: `npm install -g eas-cli`
2. Login to Expo: `eas login`
3. Build for Android: `eas build --platform android --profile production`

Alternatively, for local builds:
1. Run prebuild: `npx expo prebuild --platform android`
2. Build with Gradle: `cd android && ./gradlew assembleRelease`

## 🔗 Repository Information
- **Branch**: cursor/do-a-release-b933
- **Tag**: v1.0.1
- **Commit**: Latest changes pushed to remote

## 📋 Next Steps
1. Merge this branch to main when ready
2. Set up proper EAS authentication for automated builds
3. Consider setting up CI/CD pipeline for future releases
4. Test the build on physical devices

---
*This release was prepared automatically and is ready for production deployment.*