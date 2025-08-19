# Build Instructions for FPV Drone Racing Game

## Prerequisites

1. **Install Node.js** (v16 or higher)
2. **Install Expo CLI globally**:
   ```bash
   npm install -g @expo/cli
   ```
3. **Install EAS CLI** (for building APK):
   ```bash
   npm install -g eas-cli
   ```

## Setup Project

1. **Navigate to project directory**:
   ```bash
   cd FPVDroneGame
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: The `--legacy-peer-deps` flag is needed due to Three.js version conflicts.

## Development

### Run on Web (for testing)
```bash
npm run web
```

### Run on Android Device/Emulator
```bash
npm run android
```

### Run on iOS Simulator (macOS only)
```bash
npm run ios
```

## Building APK for Android

### Method 1: Using EAS Build (Recommended)

1. **Create Expo account** at https://expo.dev/

2. **Login to EAS**:
   ```bash
   eas login
   ```

3. **Initialize EAS project**:
   ```bash
   eas build:configure
   ```

4. **Build APK**:
   ```bash
   npm run build:android-apk
   ```

5. **Download APK**: After build completes, download the APK from the provided URL.

### Method 2: Local Build (Alternative)

If you have Android Studio and SDK set up:

```bash
npx expo run:android --variant release
```

## Installation on Android Device

1. **Enable Developer Options** on your Android device
2. **Enable "Install from Unknown Sources"**
3. **Transfer APK** to your device
4. **Install APK** by tapping on it

## Controller Setup

### PlayStation Controller (PS4/PS5)
1. **Connect via Bluetooth** to your Android device
2. **Open the game** - controller should be automatically detected
3. **Touch controls will be hidden** when controller is connected

### Gyroscope Controls
- **Automatically enabled** when no controller is connected
- **Tilt device** to control drone orientation
- **Works best in landscape mode**

## Troubleshooting

### Build Issues
- Use `--legacy-peer-deps` flag for npm install
- Clear node_modules and reinstall if needed:
  ```bash
  rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps
  ```

### Performance Issues
- **Close other apps** while playing
- **Use landscape orientation** for better experience
- **Ensure device has sufficient RAM** (4GB+ recommended)

### Controller Issues
- **Re-pair Bluetooth controller** if not detected
- **Check controller compatibility** (PS4/PS5 controllers work best)
- **Restart app** after connecting controller

## Game Features

### Free Flight Mode
- Explore the 3D cityscape freely
- Practice flight controls
- No objectives or time limits

### Route Challenge Mode
- Race through checkpoints
- Time tracking with best time records
- Follow yellow arrows to next checkpoint
- Green rings indicate completed checkpoints

### Controls Overview
- **Throttle**: Up/down movement
- **Pitch**: Forward/backward tilt
- **Roll**: Left/right tilt
- **Yaw**: Rotation left/right

## System Requirements

### Minimum
- Android 7.0+ or iOS 12.0+
- 3GB RAM
- OpenGL ES 3.0 support

### Recommended
- Android 10.0+ or iOS 14.0+
- 4GB+ RAM
- Gyroscope sensor
- Bluetooth for controller support

## Notes

- **First launch may take longer** due to 3D asset loading
- **Grant motion sensor permissions** for gyroscope controls
- **Use headphones** for better audio experience
- **Play in well-lit environment** for better screen visibility