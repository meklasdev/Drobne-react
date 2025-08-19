import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useGame } from '../context/GameContext';

export default function TouchControls() {
  const { state, dispatch } = useGame();
  
  // Left joystick (throttle and yaw)
  const leftJoystickX = useSharedValue(0);
  const leftJoystickY = useSharedValue(0);
  
  // Right joystick (pitch and roll)
  const rightJoystickX = useSharedValue(0);
  const rightJoystickY = useSharedValue(0);

  const JOYSTICK_SIZE = 80;
  const KNOB_SIZE = 30;
  const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

  const updateDroneControls = (
    leftX: number,
    leftY: number,
    rightX: number,
    rightY: number
  ) => {
    const sensitivity = state.settings.sensitivity;
    const invertPitch = state.settings.invertPitch;
    
    // Normalize values to -1 to 1 range
    const normalizedLeftX = leftX / MAX_DISTANCE;
    const normalizedLeftY = -leftY / MAX_DISTANCE; // Invert Y for throttle
    const normalizedRightX = rightX / MAX_DISTANCE;
    const normalizedRightY = rightY / MAX_DISTANCE;

    dispatch({
      type: 'UPDATE_DRONE',
      payload: {
        throttle: Math.max(0, Math.min(1, normalizedLeftY * 0.5 + 0.5)),
        yaw: normalizedLeftX * sensitivity,
        roll: normalizedRightX * sensitivity,
        pitch: (invertPitch ? -normalizedRightY : normalizedRightY) * sensitivity,
      },
    });
  };

  const leftJoystickGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent
  >({
    onStart: () => {
      // Haptic feedback could be added here
    },
    onActive: (event) => {
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      
      if (distance <= MAX_DISTANCE) {
        leftJoystickX.value = event.translationX;
        leftJoystickY.value = event.translationY;
      } else {
        const angle = Math.atan2(event.translationY, event.translationX);
        leftJoystickX.value = Math.cos(angle) * MAX_DISTANCE;
        leftJoystickY.value = Math.sin(angle) * MAX_DISTANCE;
      }

      runOnJS(updateDroneControls)(
        leftJoystickX.value,
        leftJoystickY.value,
        rightJoystickX.value,
        rightJoystickY.value
      );
    },
    onEnd: () => {
      leftJoystickX.value = withSpring(0);
      leftJoystickY.value = withSpring(0);
      
      runOnJS(updateDroneControls)(0, 0, rightJoystickX.value, rightJoystickY.value);
    },
  });

  const rightJoystickGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent
  >({
    onStart: () => {
      // Haptic feedback could be added here
    },
    onActive: (event) => {
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      
      if (distance <= MAX_DISTANCE) {
        rightJoystickX.value = event.translationX;
        rightJoystickY.value = event.translationY;
      } else {
        const angle = Math.atan2(event.translationY, event.translationX);
        rightJoystickX.value = Math.cos(angle) * MAX_DISTANCE;
        rightJoystickY.value = Math.sin(angle) * MAX_DISTANCE;
      }

      runOnJS(updateDroneControls)(
        leftJoystickX.value,
        leftJoystickY.value,
        rightJoystickX.value,
        rightJoystickY.value
      );
    },
    onEnd: () => {
      rightJoystickX.value = withSpring(0);
      rightJoystickY.value = withSpring(0);
      
      runOnJS(updateDroneControls)(leftJoystickX.value, leftJoystickY.value, 0, 0);
    },
  });

  const leftKnobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: leftJoystickX.value },
        { translateY: leftJoystickY.value },
      ],
    };
  });

  const rightKnobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: rightJoystickX.value },
        { translateY: rightJoystickY.value },
      ],
    };
  });

  if (!state.isPlaying || state.settings.controllerConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Left Joystick - Throttle & Yaw */}
      <View style={styles.leftJoystick}>
        <View style={styles.joystickBase}>
          <View style={styles.joystickCenter} />
          <PanGestureHandler onGestureEvent={leftJoystickGestureHandler}>
            <Animated.View style={[styles.joystickKnob, leftKnobStyle]} />
          </PanGestureHandler>
        </View>
        <View style={styles.joystickLabels}>
          <View style={styles.labelTop}>
            <View style={styles.labelText}>THR</View>
          </View>
          <View style={styles.labelHorizontal}>
            <View style={styles.labelText}>YAW</View>
          </View>
        </View>
      </View>

      {/* Right Joystick - Pitch & Roll */}
      <View style={styles.rightJoystick}>
        <View style={styles.joystickBase}>
          <View style={styles.joystickCenter} />
          <PanGestureHandler onGestureEvent={rightJoystickGestureHandler}>
            <Animated.View style={[styles.joystickKnob, rightKnobStyle]} />
          </PanGestureHandler>
        </View>
        <View style={styles.joystickLabels}>
          <View style={styles.labelTop}>
            <View style={styles.labelText}>PITCH</View>
          </View>
          <View style={styles.labelHorizontal}>
            <View style={styles.labelText}>ROLL</View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 30,
    pointerEvents: 'box-none',
  },
  leftJoystick: {
    alignItems: 'center',
  },
  rightJoystick: {
    alignItems: 'center',
  },
  joystickBase: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickCenter: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00ff00',
  },
  joystickKnob: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00ff00',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  joystickLabels: {
    marginTop: 10,
    alignItems: 'center',
  },
  labelTop: {
    marginBottom: 5,
  },
  labelHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    color: '#ffffff99',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});