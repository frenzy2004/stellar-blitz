import * as PIXI from 'pixi.js';

interface Asteroid {
  sprite: PIXI.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: 'small' | 'medium' | 'large';
  radius: number;
  points: number;
}

export class AsteroidManager {
  private container: PIXI.Container;
  private asteroids: Asteroid[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1500; // ms
  private isSpawning = false;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  private createAsteroid(size: 'small' | 'medium' | 'large', x?: number, y?: number): Asteroid {
    const sizeConfig = {
      small: { radius: 15, points: 10, speed: 2 },
      medium: { radius: 25, points: 30, speed: 1.5 },
      large: { radius: 40, points: 60, speed: 1 },
    };

    const config = sizeConfig[size];
    
    // Spawn from edges if no position specified
    if (x === undefined || y === undefined) {
      const edge = Math.floor(Math.random() * 4);
      const screenWidth = this.container.width || window.innerWidth;
      const screenHeight = this.container.height || window.innerHeight;
      
      switch (edge) {
        case 0: // Top
          x = Math.random() * screenWidth;
          y = -config.radius;
          break;
        case 1: // Right
          x = screenWidth + config.radius;
          y = Math.random() * screenHeight;
          break;
        case 2: // Bottom
          x = Math.random() * screenWidth;
          y = screenHeight + config.radius;
          break;
        case 3: // Left
          x = -config.radius;
          y = Math.random() * screenHeight;
          break;
      }
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = config.speed + Math.random();

    const sprite = new PIXI.Graphics();
    
    // Draw irregular asteroid shape
    const points = 8;
    sprite.moveTo(config.radius, 0);
    for (let i = 1; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const variance = 0.7 + Math.random() * 0.3;
      const r = config.radius * variance;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      sprite.lineTo(px, py);
    }
    sprite.fill({ color: 0x666666 });
    sprite.stroke({ color: 0x888888, width: 2 });
    
    sprite.x = x!;
    sprite.y = y!;
    
    this.container.addChild(sprite);

    return {
      sprite,
      x: x!,
      y: y!,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      size,
      radius: config.radius,
      points: config.points,
    };
  }

  public update(delta: number) {
    if (this.isSpawning) {
      this.spawnTimer += delta * 16.67; // Convert to ms
      if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;
        const size = Math.random() < 0.5 ? 'small' : Math.random() < 0.7 ? 'medium' : 'large';
        this.asteroids.push(this.createAsteroid(size as any));
      }
    }

    for (const asteroid of this.asteroids) {
      asteroid.x += asteroid.vx * delta;
      asteroid.y += asteroid.vy * delta;
      asteroid.rotation += asteroid.rotationSpeed * delta;
      
      asteroid.sprite.x = asteroid.x;
      asteroid.sprite.y = asteroid.y;
      asteroid.sprite.rotation = asteroid.rotation;

      // Screen wrapping
      const screenWidth = this.container.width || window.innerWidth;
      const screenHeight = this.container.height || window.innerHeight;
      const margin = asteroid.radius + 50;
      
      if (asteroid.x < -margin) asteroid.x = screenWidth + margin;
      if (asteroid.x > screenWidth + margin) asteroid.x = -margin;
      if (asteroid.y < -margin) asteroid.y = screenHeight + margin;
      if (asteroid.y > screenHeight + margin) asteroid.y = -margin;
    }
  }

  public destroyAsteroid(asteroid: Asteroid) {
    const index = this.asteroids.indexOf(asteroid);
    if (index > -1) {
      asteroid.sprite.destroy();
      this.asteroids.splice(index, 1);
    }
  }

  public getAsteroids(): Asteroid[] {
    return this.asteroids;
  }

  public startSpawning() {
    this.isSpawning = true;
  }

  public destroy() {
    for (const asteroid of this.asteroids) {
      asteroid.sprite.destroy();
    }
    this.asteroids = [];
  }
}
