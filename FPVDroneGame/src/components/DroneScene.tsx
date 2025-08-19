import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, 
  Box, 
  Plane, 
  Text, 
  Sky, 
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Ring,
} from '@react-three/drei';
import * as THREE from 'three';
import { useGame } from '../context/GameContext';
import { GameMode } from '../../App';
import { DronePhysics, RouteManager } from '../utils/DronePhysics';

interface DroneSceneProps {
  mode: GameMode;
}

// Drone component
function Drone({ physics, routeManager, mode }: { 
  physics: DronePhysics; 
  routeManager: RouteManager; 
  mode: GameMode;
}) {
  const droneRef = useRef<THREE.Group>(null);
  const { state, dispatch } = useGame();

  useFrame((_, delta) => {
    if (!droneRef.current || !state.isPlaying) return;

    // Update physics
    const controls = {
      throttle: state.drone.throttle,
      pitch: state.drone.pitch,
      roll: state.drone.roll,
      yaw: state.drone.yaw,
    };

    const physicsResult = physics.update(controls, delta);

    // Update game state
    dispatch({
      type: 'UPDATE_DRONE',
      payload: {
        position: physicsResult.position,
        rotation: physicsResult.rotation,
        velocity: physicsResult.velocity,
      },
    });

    // Update visual representation
    droneRef.current.position.set(...physicsResult.position);
    droneRef.current.rotation.set(...physicsResult.rotation);

    // Check route collision in route mode
    if (mode === 'route') {
      const collision = routeManager.checkCollision(physicsResult.position);
      if (collision.passed) {
        // Haptic feedback for checkpoint
        console.log('Checkpoint passed!', collision.checkpoint?.id);
      }
      if (collision.completed) {
        console.log('Race completed in', collision.time, 'ms');
        dispatch({ type: 'PAUSE_GAME' });
      }
    }
  });

  return (
    <group ref={droneRef} position={state.drone.position}>
      {/* Drone body */}
      <Box args={[0.3, 0.1, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#333" />
      </Box>
      
      {/* Drone arms */}
      <Box args={[0.8, 0.02, 0.02]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#666" />
      </Box>
      <Box args={[0.02, 0.02, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#666" />
      </Box>
      
      {/* Propellers */}
      {[
        [-0.4, 0.05, -0.4],
        [0.4, 0.05, -0.4],
        [-0.4, 0.05, 0.4],
        [0.4, 0.05, 0.4],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <Sphere args={[0.05]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#ff0000" />
          </Sphere>
          <Box args={[0.2, 0.01, 0.02]} position={[0, 0.02, 0]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <Box args={[0.02, 0.01, 0.2]} position={[0, 0.02, 0]}>
            <meshStandardMaterial color="#333" />
          </Box>
        </group>
      ))}
    </group>
  );
}

// Terrain component
function Terrain() {
  const terrainRef = useRef<THREE.Mesh>(null);
  
  const heightMap = useMemo(() => {
    const size = 100;
    const geometry = new THREE.PlaneGeometry(size, size, 50, 50);
    const vertices = geometry.attributes.position.array as Float32Array;
    
    // Generate random terrain
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      vertices[i + 1] = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 + 
                       Math.random() * 0.5;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  return (
    <mesh ref={terrainRef} geometry={heightMap} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <meshStandardMaterial color="#228B22" wireframe={false} />
    </mesh>
  );
}

// Racing gates component
function RacingGates({ routeManager }: { routeManager: RouteManager }) {
  const checkpoints = routeManager.getAllCheckpoints();
  const currentCheckpoint = routeManager.getCurrentCheckpoint();
  
  return (
    <>
      {checkpoints.map((checkpoint, i) => (
        <group key={checkpoint.id} position={checkpoint.position}>
          {/* Gate ring */}
          <Ring
            args={[checkpoint.radius - 1, checkpoint.radius, 32]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={
                checkpoint.passed 
                  ? "#00ff00" 
                  : currentCheckpoint?.id === checkpoint.id 
                    ? "#ffff00" 
                    : "#ff6600"
              }
              transparent
              opacity={0.7}
            />
          </Ring>
          
          {/* Gate pillars */}
          <Box args={[0.3, checkpoint.radius * 2, 0.3]} position={[-checkpoint.radius, 0, 0]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <Box args={[0.3, checkpoint.radius * 2, 0.3]} position={[checkpoint.radius, 0, 0]}>
            <meshStandardMaterial color="#333" />
          </Box>
          
          {/* Checkpoint number */}
          <Text
            position={[0, checkpoint.radius + 1, 0]}
            fontSize={1.5}
            color={checkpoint.isFinish ? "#ff0000" : "#ffffff"}
            anchorX="center"
            anchorY="middle"
          >
            {checkpoint.isFinish ? "FINISH" : `${i + 1}`}
          </Text>
          
          {/* Direction arrow */}
          {currentCheckpoint?.id === checkpoint.id && (
            <mesh position={[0, 0, 2]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.5, 2, 3]} />
              <meshStandardMaterial color="#ffff00" />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

// Buildings and obstacles
function CityScape() {
  const buildings = useMemo(() => {
    const buildingData = [];
    for (let i = 0; i < 20; i++) {
      buildingData.push({
        position: [
          (Math.random() - 0.5) * 100,
          Math.random() * 20 + 5,
          (Math.random() - 0.5) * 100,
        ] as [number, number, number],
        scale: [
          Math.random() * 5 + 2,
          Math.random() * 30 + 10,
          Math.random() * 5 + 2,
        ] as [number, number, number],
        color: `hsl(${Math.random() * 60 + 200}, 50%, ${Math.random() * 30 + 40}%)`,
      });
    }
    return buildingData;
  }, []);

  return (
    <>
      {buildings.map((building, i) => (
        <Box
          key={i}
          args={building.scale}
          position={building.position}
        >
          <meshStandardMaterial color={building.color} />
        </Box>
      ))}
    </>
  );
}

// FPV Camera
function FPVCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { state } = useGame();

  useFrame(() => {
    if (!cameraRef.current) return;

    // Position camera slightly behind and above drone
    const dronePos = state.drone.position;
    const droneRot = state.drone.rotation;
    
    cameraRef.current.position.set(
      dronePos[0],
      dronePos[1] + 0.5,
      dronePos[2] + 1
    );
    
    // Look forward from drone's perspective
    cameraRef.current.rotation.set(
      droneRot[0] + state.camera.tilt,
      droneRot[1],
      droneRot[2]
    );
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={state.camera.fov}
      near={0.1}
      far={1000}
    />
  );
}

export default function DroneScene({ mode }: DroneSceneProps) {
  const [physics] = useState(() => new DronePhysics());
  const [routeManager] = useState(() => new RouteManager());

  useEffect(() => {
    if (mode === 'route') {
      routeManager.startRace();
    }
    physics.reset();
  }, [mode]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {/* Environment */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />

      {/* FPV Camera */}
      <FPVCamera />

      {/* Scene elements */}
      <Drone physics={physics} routeManager={routeManager} mode={mode} />
      <Terrain />
      <CityScape />
      
      {/* Show racing gates only in route mode */}
      {mode === 'route' && <RacingGates routeManager={routeManager} />}

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#87CEEB', 50, 200]} />
    </>
  );
}