import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import { Canvas } from '@react-three/fiber';
import { Ionicons } from '@expo/vector-icons';
import * as Sensors from 'expo-sensors';
import { GameMode } from '../../App';
import { useGame } from '../context/GameContext';
import DroneScene from './DroneScene';
import GameUI from './GameUI';
import TouchControls from './TouchControls';
import { useController, mapControllerToDrone } from '../utils/ControllerManager';

const { width, height } = Dimensions.get('window');

interface GameScreenProps {
  mode: GameMode;
  onBack: () => void;
}

export default function GameScreen({ mode, onBack }: GameScreenProps) {
  const { state, dispatch } = useGame();
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const controllerState = useController();

  useEffect(() => {
    dispatch({ type: 'START_GAME' });
    
    // Set up sensors
    const setupSensors = async () => {
      const gyroAvailable = await Sensors.Gyroscope.isAvailableAsync();
      const accelAvailable = await Sensors.Accelerometer.isAvailableAsync();

      if (gyroAvailable) {
        Sensors.Gyroscope.setUpdateInterval(16); // ~60fps
        const gyroSubscription = Sensors.Gyroscope.addListener(setGyroscopeData);
        return () => gyroSubscription?.remove();
      }

      if (accelAvailable) {
        Sensors.Accelerometer.setUpdateInterval(16);
        const accelSubscription = Sensors.Accelerometer.addListener(setAccelerometerData);
        return () => accelSubscription?.remove();
      }
    };

    const cleanup = setupSensors();
    
    return () => {
      if (cleanup) cleanup.then(fn => fn?.());
      dispatch({ type: 'PAUSE_GAME' });
    };
  }, []);

  // Update controller connection status
  useEffect(() => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { controllerConnected: controllerState.connected },
    });
  }, [controllerState.connected]);

  // Update drone physics based on controller or sensor data
  useEffect(() => {
    if (state.isPlaying) {
      const sensitivity = state.settings.sensitivity;
      const invertPitch = state.settings.invertPitch;
      
      // Priority: Controller > Gyroscope
      if (controllerState.connected) {
        const controllerInput = mapControllerToDrone(controllerState);
        if (controllerInput) {
          dispatch({
            type: 'UPDATE_DRONE',
            payload: {
              throttle: controllerInput.throttle,
              pitch: (invertPitch ? -controllerInput.pitch : controllerInput.pitch) * sensitivity,
              roll: controllerInput.roll * sensitivity,
              yaw: controllerInput.yaw * sensitivity,
            },
          });

          // Update camera controls
          if (controllerInput.cameraTilt !== 0) {
            dispatch({
              type: 'UPDATE_CAMERA',
              payload: { 
                tilt: Math.max(-0.5, Math.min(0.5, state.camera.tilt + controllerInput.cameraTilt))
              },
            });
          }

          if (controllerInput.cameraFov !== 0) {
            dispatch({
              type: 'UPDATE_CAMERA',
              payload: { 
                fov: Math.max(30, Math.min(120, state.camera.fov + controllerInput.cameraFov))
              },
            });
          }
        }
      } else {
        // Fallback to gyroscope
        dispatch({
          type: 'UPDATE_DRONE',
          payload: {
            pitch: (invertPitch ? -gyroscopeData.x : gyroscopeData.x) * sensitivity,
            roll: gyroscopeData.y * sensitivity,
            yaw: gyroscopeData.z * sensitivity,
          },
        });
      }
    }
  }, [gyroscopeData, controllerState, state.settings, state.isPlaying, state.camera]);

  const handleBack = () => {
    dispatch({ type: 'RESET_GAME' });
    onBack();
  };

  return (
    <View style={styles.container}>
      {/* 3D Scene */}
      <View style={styles.sceneContainer}>
        <Canvas
          style={styles.canvas}
          camera={{ fov: state.camera.fov, position: [0, 5, 10] }}
          gl={{ antialias: true, alpha: false }}
        >
          <DroneScene mode={mode} />
        </Canvas>
      </View>

      {/* Game UI Overlay */}
      <GameUI mode={mode} onBack={handleBack} />

      {/* Touch Controls */}
      <TouchControls />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* FPV Camera Overlay */}
      <View style={styles.fpvOverlay}>
        <View style={styles.crosshair}>
          <View style={styles.crosshairHorizontal} />
          <View style={styles.crosshairVertical} />
        </View>
        
        {/* Altitude and Speed indicators */}
        <View style={styles.telemetry}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>ALT</Text>
            <Text style={styles.telemetryValue}>
              {Math.round(state.drone.position[1])}m
            </Text>
          </View>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>SPD</Text>
            <Text style={styles.telemetryValue}>
              {Math.round(Math.sqrt(
                state.drone.velocity[0] ** 2 + 
                state.drone.velocity[1] ** 2 + 
                state.drone.velocity[2] ** 2
              ))}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  sceneContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fpvOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginTop: -20,
    marginLeft: -20,
  },
  crosshairHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00ff00',
    marginTop: -1,
  },
  crosshairVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: '#00ff00',
    marginLeft: -1,
  },
  telemetry: {
    position: 'absolute',
    top: 100,
    right: 20,
    gap: 10,
  },
  telemetryItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  telemetryLabel: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  telemetryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});