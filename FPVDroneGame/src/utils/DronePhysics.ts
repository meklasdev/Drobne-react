import * as THREE from 'three';

export interface DronePhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  rotation: THREE.Euler;
  angularVelocity: THREE.Vector3;
  mass: number;
  thrust: number;
  drag: number;
  gravity: number;
}

export class DronePhysics {
  private state: DronePhysicsState;
  private readonly maxThrust = 20;
  private readonly maxSpeed = 50;
  private readonly airDensity = 1.225; // kg/m³

  constructor() {
    this.state = {
      position: new THREE.Vector3(0, 10, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      acceleration: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      mass: 1.5, // kg
      thrust: 0,
      drag: 0.1,
      gravity: -9.81,
    };
  }

  update(controls: {
    throttle: number;
    pitch: number;
    roll: number;
    yaw: number;
  }, deltaTime: number) {
    // Update thrust based on throttle
    this.state.thrust = controls.throttle * this.maxThrust;

    // Calculate forces
    const forces = new THREE.Vector3();
    
    // Gravity
    forces.y += this.state.mass * this.state.gravity;
    
    // Thrust (always upward in drone's local space)
    const thrustForce = new THREE.Vector3(0, this.state.thrust, 0);
    thrustForce.applyEuler(this.state.rotation);
    forces.add(thrustForce);

    // Drag
    const speed = this.state.velocity.length();
    if (speed > 0) {
      const dragMagnitude = 0.5 * this.airDensity * this.state.drag * speed * speed;
      const dragForce = this.state.velocity.clone().normalize().multiplyScalar(-dragMagnitude);
      forces.add(dragForce);
    }

    // Update acceleration
    this.state.acceleration.copy(forces).divideScalar(this.state.mass);

    // Update velocity
    this.state.velocity.add(this.state.acceleration.clone().multiplyScalar(deltaTime));

    // Limit max speed
    if (this.state.velocity.length() > this.maxSpeed) {
      this.state.velocity.normalize().multiplyScalar(this.maxSpeed);
    }

    // Update position
    this.state.position.add(this.state.velocity.clone().multiplyScalar(deltaTime));

    // Ground collision
    if (this.state.position.y < 0.5) {
      this.state.position.y = 0.5;
      this.state.velocity.y = Math.max(0, this.state.velocity.y);
    }

    // Update rotation based on controls
    const rotationSpeed = 2.0;
    this.state.angularVelocity.set(
      controls.pitch * rotationSpeed,
      controls.yaw * rotationSpeed,
      controls.roll * rotationSpeed
    );

    // Apply angular velocity to rotation
    this.state.rotation.x += this.state.angularVelocity.x * deltaTime;
    this.state.rotation.y += this.state.angularVelocity.y * deltaTime;
    this.state.rotation.z += this.state.angularVelocity.z * deltaTime;

    // Limit rotation angles for stability
    this.state.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.state.rotation.x));
    this.state.rotation.z = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.state.rotation.z));

    return {
      position: [this.state.position.x, this.state.position.y, this.state.position.z] as [number, number, number],
      rotation: [this.state.rotation.x, this.state.rotation.y, this.state.rotation.z] as [number, number, number],
      velocity: [this.state.velocity.x, this.state.velocity.y, this.state.velocity.z] as [number, number, number],
      speed: this.state.velocity.length(),
    };
  }

  reset(position?: [number, number, number]) {
    this.state.position.set(position?.[0] || 0, position?.[1] || 10, position?.[2] || 0);
    this.state.velocity.set(0, 0, 0);
    this.state.acceleration.set(0, 0, 0);
    this.state.rotation.set(0, 0, 0);
    this.state.angularVelocity.set(0, 0, 0);
  }

  getState() {
    return this.state;
  }
}

// Route management
export interface Checkpoint {
  id: string;
  position: [number, number, number];
  radius: number;
  passed: boolean;
  isFinish?: boolean;
}

export class RouteManager {
  private checkpoints: Checkpoint[] = [];
  private currentCheckpoint = 0;
  private startTime = 0;
  private bestTime = 0;

  constructor() {
    this.generateRoute();
  }

  private generateRoute() {
    // Generate a challenging route through the city
    const checkpointPositions: [number, number, number][] = [
      [0, 8, -15],
      [20, 12, -25],
      [-15, 6, -35],
      [10, 15, -50],
      [-25, 8, -60],
      [5, 20, -75],
      [-10, 5, -85],
      [0, 10, -100], // Finish line
    ];

    this.checkpoints = checkpointPositions.map((pos, i) => ({
      id: `checkpoint-${i}`,
      position: pos,
      radius: 5,
      passed: false,
      isFinish: i === checkpointPositions.length - 1,
    }));
  }

  checkCollision(dronePosition: [number, number, number]): {
    passed: boolean;
    checkpoint?: Checkpoint;
    completed: boolean;
    time?: number;
  } {
    if (this.currentCheckpoint >= this.checkpoints.length) {
      return { passed: false, completed: true };
    }

    const checkpoint = this.checkpoints[this.currentCheckpoint];
    const distance = Math.sqrt(
      Math.pow(dronePosition[0] - checkpoint.position[0], 2) +
      Math.pow(dronePosition[1] - checkpoint.position[1], 2) +
      Math.pow(dronePosition[2] - checkpoint.position[2], 2)
    );

    if (distance <= checkpoint.radius) {
      checkpoint.passed = true;
      this.currentCheckpoint++;

      if (checkpoint.isFinish) {
        const completionTime = Date.now() - this.startTime;
        if (this.bestTime === 0 || completionTime < this.bestTime) {
          this.bestTime = completionTime;
        }
        return { 
          passed: true, 
          checkpoint, 
          completed: true, 
          time: completionTime 
        };
      }

      return { passed: true, checkpoint, completed: false };
    }

    return { passed: false, completed: false };
  }

  startRace() {
    this.startTime = Date.now();
    this.currentCheckpoint = 0;
    this.checkpoints.forEach(cp => cp.passed = false);
  }

  getCurrentCheckpoint() {
    return this.currentCheckpoint < this.checkpoints.length 
      ? this.checkpoints[this.currentCheckpoint] 
      : null;
  }

  getAllCheckpoints() {
    return this.checkpoints;
  }

  getProgress() {
    return this.currentCheckpoint / this.checkpoints.length;
  }

  getBestTime() {
    return this.bestTime;
  }

  reset() {
    this.currentCheckpoint = 0;
    this.checkpoints.forEach(cp => cp.passed = false);
  }
}