import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface DroneState {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  throttle: number;
  pitch: number;
  roll: number;
  yaw: number;
}

export interface GameState {
  drone: DroneState;
  camera: {
    fov: number;
    tilt: number;
  };
  settings: {
    sensitivity: number;
    invertPitch: boolean;
    controllerConnected: boolean;
  };
  score: number;
  gameTime: number;
  isPlaying: boolean;
}

type GameAction =
  | { type: 'UPDATE_DRONE'; payload: Partial<DroneState> }
  | { type: 'UPDATE_CAMERA'; payload: { fov?: number; tilt?: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameState['settings']> }
  | { type: 'RESET_GAME' }
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'UPDATE_TIME'; payload: number };

const initialState: GameState = {
  drone: {
    position: [0, 10, 0],
    rotation: [0, 0, 0],
    velocity: [0, 0, 0],
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
  },
  camera: {
    fov: 75,
    tilt: 0,
  },
  settings: {
    sensitivity: 1.0,
    invertPitch: false,
    controllerConnected: false,
  },
  score: 0,
  gameTime: 0,
  isPlaying: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_DRONE':
      return {
        ...state,
        drone: { ...state.drone, ...action.payload },
      };
    case 'UPDATE_CAMERA':
      return {
        ...state,
        camera: { ...state.camera, ...action.payload },
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        settings: state.settings, // Keep settings
      };
    case 'START_GAME':
      return { ...state, isPlaying: true };
    case 'PAUSE_GAME':
      return { ...state, isPlaying: false };
    case 'UPDATE_SCORE':
      return { ...state, score: action.payload };
    case 'UPDATE_TIME':
      return { ...state, gameTime: action.payload };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}