import * as PIXI from 'pixi.js';

interface Particle {
  sprite: PIXI.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  color: number;
}

export class ParticleManager {
  private container: PIXI.Container;
  private particles: Particle[] = [];

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  public createExplosion(x: number, y: number, size: 'small' | 'medium' | 'large') {
    // FIREWORK STYLE EXPLOSION!
    const particleCount = size === 'large' ? 40 : size === 'medium' ? 25 : 15;
    const colors = [
      0xff0000, // Red
      0xff4500, // Orange red
      0xffa500, // Orange
      0xffff00, // Yellow
      0xffd700, // Gold
      0xff1493, // Deep pink
      0xff6b9d, // Hot pink
      0x9d4edd, // Purple
      0x00ff88, // Green
      0x06ffa5, // Cyan
    ];

    // Main explosion burst
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const sprite = new PIXI.Graphics();
      
      // Particle shapes
      const shape = Math.random();
      if (shape < 0.33) {
        // Star shape
        sprite.star(0, 0, 5, 3 + Math.random() * 3, 1 + Math.random() * 2);
      } else if (shape < 0.66) {
        // Circle
        sprite.circle(0, 0, 2 + Math.random() * 4);
      } else {
        // Diamond
        sprite.moveTo(0, -3);
        sprite.lineTo(3, 0);
        sprite.lineTo(0, 3);
        sprite.lineTo(-3, 0);
        sprite.lineTo(0, -3);
      }
      
      sprite.fill({ color });
      sprite.x = x;
      sprite.y = y;
      
      this.container.addChild(sprite);

      this.particles.push({
        sprite,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 800 + Math.random() * 700,
        scale: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color,
      });
    }

    // Secondary sparkles
    for (let i = 0; i < particleCount / 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const color = 0xffffff;
      
      const sprite = new PIXI.Graphics();
      sprite.circle(0, 0, 1 + Math.random() * 2);
      sprite.fill({ color });
      sprite.x = x;
      sprite.y = y;
      
      this.container.addChild(sprite);

      this.particles.push({
        sprite,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 600 + Math.random() * 400,
        scale: 1,
        rotation: 0,
        rotationSpeed: 0,
        color,
      });
    }

    // Center flash
    for (let i = 0; i < 5; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const sprite = new PIXI.Graphics();
      sprite.circle(0, 0, 8 + Math.random() * 8);
      sprite.fill({ color, alpha: 0.6 });
      sprite.x = x;
      sprite.y = y;
      
      this.container.addChild(sprite);

      this.particles.push({
        sprite,
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 200 + Math.random() * 200,
        scale: 1,
        rotation: 0,
        rotationSpeed: 0,
        color,
      });
    }
  }

  public createMuzzleFlash(x: number, y: number) {
    // Enhanced muzzle flash
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      
      const sprite = new PIXI.Graphics();
      sprite.star(0, 0, 4, 2 + Math.random() * 2, 1);
      sprite.fill({ color: 0x00ffff });
      sprite.x = x;
      sprite.y = y;
      
      this.container.addChild(sprite);

      this.particles.push({
        sprite,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 150 + Math.random() * 150,
        scale: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        color: 0x00ffff,
      });
    }
  }

  public update(delta: number) {
    const toRemove: Particle[] = [];

    for (const particle of this.particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.life += delta * 16.67;
      particle.rotation += particle.rotationSpeed * delta;
      
      // Add gravity effect
      particle.vy += 0.1 * delta;
      
      const lifeRatio = particle.life / particle.maxLife;
      particle.scale = 1 - lifeRatio * 0.5;
      particle.sprite.alpha = 1 - lifeRatio;

      particle.sprite.x = particle.x;
      particle.sprite.y = particle.y;
      particle.sprite.rotation = particle.rotation;
      particle.sprite.scale.set(particle.scale);

      if (particle.life >= particle.maxLife) {
        toRemove.push(particle);
      }
    }

    for (const particle of toRemove) {
      particle.sprite.destroy();
      const index = this.particles.indexOf(particle);
      if (index > -1) {
        this.particles.splice(index, 1);
      }
    }
  }

  public destroy() {
    for (const particle of this.particles) {
      particle.sprite.destroy();
    }
    this.particles = [];
  }
}
