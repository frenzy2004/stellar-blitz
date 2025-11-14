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
  private spawnInterval = 800;
  private baseSpawnInterval = 800;
  private minSpawnInterval = 300;
  private isSpawning = false;
  private currentScore = 0;
  private readonly asteroidColors = [
    0xff6b9d, // Hot pink
    0xffd700, // Gold
    0x00ff88, // Bright green
    0xff4500, // Orange red
    0x9d4edd, // Purple
    0x06ffa5, // Cyan green
    0xffa500, // Orange
    0xff1493, // Deep pink
  ];

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  private darkenColor(color: number): number {
    const r = ((color >> 16) & 0xff) * 0.5;
    const g = ((color >> 8) & 0xff) * 0.5;
    const b = (color & 0xff) * 0.5;
    return (r << 16) | (g << 8) | b;
  }

  private lightenColor(color: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) * 1.3);
    const g = Math.min(255, ((color >> 8) & 0xff) * 1.3);
    const b = Math.min(255, (color & 0xff) * 1.3);
    return (r << 16) | (g << 8) | b;
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
    
    // Pick random color
    const color = this.asteroidColors[Math.floor(Math.random() * this.asteroidColors.length)];
    const darkerColor = this.darkenColor(color);
    
    // Draw irregular asteroid shape with more detail
    const points = 10 + Math.floor(Math.random() * 5);
    const vertices: { x: number; y: number }[] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const variance = 0.6 + Math.random() * 0.4;
      const r = config.radius * variance;
      vertices.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }
    
    // Draw filled shape
    sprite.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      sprite.lineTo(vertices[i].x, vertices[i].y);
    }
    sprite.lineTo(vertices[0].x, vertices[0].y);
    sprite.fill({ color });
    
    // Add bright outline
    sprite.stroke({ color: this.lightenColor(color), width: 2 });
    
    // Add some crater details
    const craters = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < craters; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * config.radius * 0.5;
      const craterSize = 2 + Math.random() * 4;
      sprite.circle(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist,
        craterSize
      );
      sprite.fill({ color: darkerColor, alpha: 0.5 });
    }
    
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

  public updateDifficulty(score: number) {
    this.currentScore = score;
    const difficultyLevel = Math.floor(score / 100);
    this.spawnInterval = Math.max(
      this.minSpawnInterval,
      this.baseSpawnInterval - (difficultyLevel * 80)
    );
  }

  public update(delta: number) {
    if (this.isSpawning) {
      this.spawnTimer += delta * 16.67;
      if (this.spawnTimer > this.spawnInterval) {
        this.spawnTimer = 0;

        const asteroidsToSpawn = 1 + Math.floor(this.currentScore / 200);

        for (let i = 0; i < asteroidsToSpawn; i++) {
          const rand = Math.random();
          let size: 'small' | 'medium' | 'large';

          if (this.currentScore < 100) {
            size = rand < 0.6 ? 'small' : rand < 0.9 ? 'medium' : 'large';
          } else if (this.currentScore < 300) {
            size = rand < 0.4 ? 'small' : rand < 0.8 ? 'medium' : 'large';
          } else {
            size = rand < 0.3 ? 'small' : rand < 0.65 ? 'medium' : 'large';
          }

          this.asteroids.push(this.createAsteroid(size));
        }
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
