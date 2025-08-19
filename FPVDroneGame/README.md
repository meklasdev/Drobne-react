# FPV Drone Racing Game

A React Native FPV (First Person View) drone racing simulator with realistic physics, beautiful 3D graphics, and multiple game modes.

## Features

🚁 **Realistic Drone Physics**
- Advanced physics simulation with thrust, drag, and gravity
- Responsive flight controls with gyroscope integration
- Realistic drone behavior and momentum

🎮 **Multiple Control Options**
- Touch controls with virtual joysticks
- PlayStation controller support (PS4/PS5)
- Gyroscope/accelerometer sensor controls
- Customizable sensitivity settings

🏁 **Game Modes**
- **Free Flight**: Explore the open world freely
- **Route Challenge**: Race through checkpoints with time tracking

🌆 **3D Environment**
- Procedurally generated cityscape
- Dynamic terrain with realistic lighting
- Atmospheric effects with fog and sky
- Multiple racing routes with challenging obstacles

📱 **Apple-Style UI**
- Smooth animations and transitions
- Blur effects and gradients
- Modern, intuitive interface design
- Real-time telemetry display (altitude, speed, etc.)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Android device or emulator

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Building APK
To build an APK for Android installation:
```bash
npx expo build:android --type apk
```

### Building APK from a phone (no PC)

There are two easy phone-only options:

1) GitHub Actions (one-tap Release)
- Open the GitHub app (or mobile web) on this repo
- Go to Releases → Create a new release
- Set tag name like `v1.0.2` (it can be anything starting with `v`)
- Publish the release
- The workflow will build `app-release.apk` and attach it to the Release in ~5–15 minutes
- Download the APK from the Release page and install on your Android device

2) Expo EAS Cloud Build (via Termux)
- Install Termux from F-Droid
- In Termux:
  ```bash
  pkg update && pkg install nodejs git -y
  git clone <this-repo-url>
  cd Drobne-react/FPVDroneGame
  npm ci --legacy-peer-deps
  npx --yes eas-cli@latest login
  npx eas-cli build --platform android --profile production
  ```
- After the build finishes, open the URL printed by the command and download the APK

Notes
- The repo already contains a CI workflow that builds and uploads the APK to GitHub Releases on every `v*` tag
- The generated APK is signed with a debug key for easy installation; for Play Store upload create a proper release keystore

## Controls

### Touch Controls
- **Left Joystick**: Throttle (up/down) and Yaw (left/right)
- **Right Joystick**: Pitch (up/down) and Roll (left/right)

### PlayStation Controller
- **Left Stick**: Throttle and Yaw
- **Right Stick**: Pitch and Roll
- **L1/R1**: Camera FOV adjustment
- **D-Pad Up/Down**: Camera tilt
- **L2/R2**: Brake/Boost (future feature)

### Gyroscope Controls
- Tilt your device to control the drone's orientation
- Works automatically when no controller is connected

## Game Modes

### Free Flight
- Explore the 3D world without restrictions
- Perfect for practicing flight controls
- No time limits or objectives

### Route Challenge
- Race through a series of checkpoints
- Time tracking with best time records
- Progressive difficulty through the course
- Visual indicators for next checkpoint

## Technical Features

- Built with React Native and Expo
- 3D graphics powered by Three.js and React Three Fiber
- Real-time physics simulation
- Cross-platform compatibility (iOS/Android)
- Optimized performance for mobile devices

## Development

The project uses:
- **React Native**: Mobile app framework
- **Expo**: Development and build platform
- **Three.js**: 3D graphics engine
- **React Three Fiber**: React renderer for Three.js
- **TypeScript**: Type safety and better development experience

## Contributing

This is a demonstration project showcasing mobile game development with React Native. Feel free to fork and modify for your own projects.

## License

MIT License - feel free to use this code for learning and development purposes.