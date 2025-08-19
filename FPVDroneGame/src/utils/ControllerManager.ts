import { useEffect, useState } from 'react';

export interface ControllerState {
  connected: boolean;
  leftStick: { x: number; y: number };
  rightStick: { x: number; y: number };
  leftTrigger: number;
  rightTrigger: number;
  buttons: {
    cross: boolean;
    circle: boolean;
    square: boolean;
    triangle: boolean;
    l1: boolean;
    r1: boolean;
    l2: boolean;
    r2: boolean;
    share: boolean;
    options: boolean;
    leftStickButton: boolean;
    rightStickButton: boolean;
    dpadUp: boolean;
    dpadDown: boolean;
    dpadLeft: boolean;
    dpadRight: boolean;
  };
}

const initialControllerState: ControllerState = {
  connected: false,
  leftStick: { x: 0, y: 0 },
  rightStick: { x: 0, y: 0 },
  leftTrigger: 0,
  rightTrigger: 0,
  buttons: {
    cross: false,
    circle: false,
    square: false,
    triangle: false,
    l1: false,
    r1: false,
    l2: false,
    r2: false,
    share: false,
    options: false,
    leftStickButton: false,
    rightStickButton: false,
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
  },
};

// Custom hook for controller management
export function useController() {
  const [controllerState, setControllerState] = useState<ControllerState>(initialControllerState);

  useEffect(() => {
    let animationId: number;
    let gamepadIndex = -1;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      
      // Find first connected gamepad
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
          gamepadIndex = i;
          break;
        }
      }

      if (gamepadIndex >= 0) {
        const gamepad = gamepads[gamepadIndex];
        if (gamepad) {
          setControllerState({
            connected: true,
            leftStick: {
              x: gamepad.axes[0] || 0,
              y: gamepad.axes[1] || 0,
            },
            rightStick: {
              x: gamepad.axes[2] || 0,
              y: gamepad.axes[3] || 0,
            },
            leftTrigger: gamepad.buttons[6] ? gamepad.buttons[6].value : 0,
            rightTrigger: gamepad.buttons[7] ? gamepad.buttons[7].value : 0,
            buttons: {
              cross: gamepad.buttons[0] ? gamepad.buttons[0].pressed : false,
              circle: gamepad.buttons[1] ? gamepad.buttons[1].pressed : false,
              square: gamepad.buttons[2] ? gamepad.buttons[2].pressed : false,
              triangle: gamepad.buttons[3] ? gamepad.buttons[3].pressed : false,
              l1: gamepad.buttons[4] ? gamepad.buttons[4].pressed : false,
              r1: gamepad.buttons[5] ? gamepad.buttons[5].pressed : false,
              l2: gamepad.buttons[6] ? gamepad.buttons[6].pressed : false,
              r2: gamepad.buttons[7] ? gamepad.buttons[7].pressed : false,
              share: gamepad.buttons[8] ? gamepad.buttons[8].pressed : false,
              options: gamepad.buttons[9] ? gamepad.buttons[9].pressed : false,
              leftStickButton: gamepad.buttons[10] ? gamepad.buttons[10].pressed : false,
              rightStickButton: gamepad.buttons[11] ? gamepad.buttons[11].pressed : false,
              dpadUp: gamepad.buttons[12] ? gamepad.buttons[12].pressed : false,
              dpadDown: gamepad.buttons[13] ? gamepad.buttons[13].pressed : false,
              dpadLeft: gamepad.buttons[14] ? gamepad.buttons[14].pressed : false,
              dpadRight: gamepad.buttons[15] ? gamepad.buttons[15].pressed : false,
            },
          });
        }
      } else {
        setControllerState(prev => ({ ...prev, connected: false }));
      }

      animationId = requestAnimationFrame(pollGamepad);
    };

    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected:', event.gamepad.id);
      gamepadIndex = event.gamepad.index;
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected:', event.gamepad.id);
      if (event.gamepad.index === gamepadIndex) {
        gamepadIndex = -1;
        setControllerState(initialControllerState);
      }
    };

    // Check if Gamepad API is available
    if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
      window.addEventListener('gamepadconnected', handleGamepadConnected);
      window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
      
      // Start polling
      pollGamepad();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('gamepadconnected', handleGamepadConnected);
        window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return controllerState;
}

// Utility functions for controller input mapping
export const mapControllerToDrone = (controller: ControllerState) => {
  if (!controller.connected) return null;

  return {
    throttle: Math.max(0, (controller.leftStick.y * -1 + 1) / 2), // Invert Y and normalize to 0-1
    yaw: controller.leftStick.x,
    pitch: controller.rightStick.y * -1, // Invert Y for natural pitch control
    roll: controller.rightStick.x,
    // Additional controls
    boost: controller.rightTrigger,
    brake: controller.leftTrigger,
    // Camera controls
    cameraTilt: controller.buttons.dpadUp ? -0.1 : controller.buttons.dpadDown ? 0.1 : 0,
    cameraFov: controller.buttons.l1 ? -1 : controller.buttons.r1 ? 1 : 0,
  };
};