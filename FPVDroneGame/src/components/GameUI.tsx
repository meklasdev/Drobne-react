import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { GameMode } from '../../App';

interface GameUIProps {
  mode: GameMode;
  onBack: () => void;
}

export default function GameUI({ mode, onBack }: GameUIProps) {
  const { state, dispatch } = useGame();
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);

  const pauseMenuScale = useSharedValue(0);
  const pauseMenuOpacity = useSharedValue(0);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isPlaying) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
        dispatch({ type: 'UPDATE_TIME', payload: gameTimer });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isPlaying, gameTimer]);

  const togglePause = () => {
    const newPauseState = !showPauseMenu;
    setShowPauseMenu(newPauseState);

    if (newPauseState) {
      dispatch({ type: 'PAUSE_GAME' });
      pauseMenuScale.value = withSpring(1);
      pauseMenuOpacity.value = withTiming(1);
    } else {
      dispatch({ type: 'START_GAME' });
      pauseMenuScale.value = withTiming(0);
      pauseMenuOpacity.value = withTiming(0);
    }
  };

  const animatedPauseMenuStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pauseMenuScale.value }],
      opacity: pauseMenuOpacity.value,
    };
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const BatteryIndicator = () => (
    <View style={styles.batteryContainer}>
      <Ionicons name="battery-half" size={20} color="#00ff00" />
      <Text style={styles.batteryText}>78%</Text>
    </View>
  );

  const SignalIndicator = () => (
    <View style={styles.signalContainer}>
      <View style={styles.signalBars}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.signalBar,
              { height: i * 3 + 2, backgroundColor: i <= 3 ? '#00ff00' : '#333' }
            ]}
          />
        ))}
      </View>
      <Text style={styles.signalText}>5.8G</Text>
    </View>
  );

  return (
    <>
      {/* Top HUD */}
      <View style={styles.topHUD}>
        <View style={styles.topLeft}>
          <BatteryIndicator />
          <SignalIndicator />
        </View>
        
        <View style={styles.topCenter}>
          <Text style={styles.modeText}>
            {mode === 'freefly' ? 'FREE FLIGHT' : 'ROUTE CHALLENGE'}
          </Text>
          <Text style={styles.timerText}>{formatTime(gameTimer)}</Text>
        </View>

        <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
          <Ionicons name="pause" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Attitude Indicator */}
      <View style={styles.attitudeContainer}>
        <View style={styles.attitudeIndicator}>
          <View 
            style={[
              styles.attitudeLine,
              { 
                transform: [
                  { rotate: `${state.drone.roll * 10}deg` },
                  { translateY: state.drone.pitch * 20 }
                ]
              }
            ]}
          />
          <View style={styles.attitudeCenter} />
        </View>
      </View>

      {/* Speed and Altitude */}
      <View style={styles.instrumentsContainer}>
        <View style={styles.speedometer}>
          <Text style={styles.instrumentLabel}>SPD</Text>
          <Text style={styles.instrumentValue}>
            {Math.round(Math.sqrt(
              state.drone.velocity[0] ** 2 + 
              state.drone.velocity[1] ** 2 + 
              state.drone.velocity[2] ** 2
            ) * 10)}
          </Text>
          <Text style={styles.instrumentUnit}>km/h</Text>
        </View>

        <View style={styles.altimeter}>
          <Text style={styles.instrumentLabel}>ALT</Text>
          <Text style={styles.instrumentValue}>
            {Math.round(state.drone.position[1])}
          </Text>
          <Text style={styles.instrumentUnit}>m</Text>
        </View>
      </View>

      {/* Throttle Indicator */}
      <View style={styles.throttleContainer}>
        <View style={styles.throttleBar}>
          <View 
            style={[
              styles.throttleFill,
              { height: `${state.drone.throttle * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.throttleLabel}>THR</Text>
      </View>

      {/* Pause Menu */}
      {showPauseMenu && (
        <View style={styles.pauseOverlay}>
          <Animated.View style={[styles.pauseMenu, animatedPauseMenuStyle]}>
            <BlurView intensity={20} style={styles.pauseMenuBlur}>
              <Text style={styles.pauseTitle}>PAUSED</Text>
              
              <TouchableOpacity
                style={styles.pauseMenuItem}
                onPress={togglePause}
              >
                <Ionicons name="play" size={24} color="#00ff00" />
                <Text style={styles.pauseMenuText}>Resume</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pauseMenuItem}
                onPress={() => {
                  dispatch({ type: 'RESET_GAME' });
                  togglePause();
                }}
              >
                <Ionicons name="refresh" size={24} color="#ffaa00" />
                <Text style={styles.pauseMenuText}>Restart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pauseMenuItem}
                onPress={onBack}
              >
                <Ionicons name="home" size={24} color="#ff4444" />
                <Text style={styles.pauseMenuText}>Main Menu</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  topHUD: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  topCenter: {
    alignItems: 'center',
  },
  modeText: {
    color: '#00ff00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 6,
    gap: 4,
  },
  batteryText: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 6,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 2,
  },
  signalBar: {
    width: 3,
    backgroundColor: '#00ff00',
  },
  signalText: {
    color: '#00ff00',
    fontSize: 10,
    fontWeight: 'bold',
  },
  attitudeContainer: {
    position: 'absolute',
    top: 120,
    left: 30,
    zIndex: 100,
  },
  attitudeIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  attitudeLine: {
    width: 60,
    height: 2,
    backgroundColor: '#00ff00',
    position: 'absolute',
  },
  attitudeCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff0000',
  },
  instrumentsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    gap: 15,
    zIndex: 100,
  },
  speedometer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  altimeter: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  instrumentLabel: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instrumentValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  instrumentUnit: {
    color: '#aaa',
    fontSize: 10,
  },
  throttleContainer: {
    position: 'absolute',
    bottom: 120,
    right: 30,
    alignItems: 'center',
    zIndex: 100,
  },
  throttleBar: {
    width: 20,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff00',
    justifyContent: 'flex-end',
    padding: 2,
  },
  throttleFill: {
    width: '100%',
    backgroundColor: '#00ff00',
    borderRadius: 6,
  },
  throttleLabel: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pauseMenu: {
    width: 280,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pauseMenuBlur: {
    padding: 30,
    alignItems: 'center',
  },
  pauseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  pauseMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    gap: 15,
  },
  pauseMenuText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});