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
}

export class ParticleManager {
  private container: PIXI.Container;
  private particles: Particle[] = [];

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  public createExplosion(x: number, y: number, size: 'small' | 'medium' | 'large') {
    const particleCount = size === 'large' ? 20 : size === 'medium' ? 12 : 8;
    const colors = [0xffff00, 0xff9900, 0xff0000];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const sprite = new PIXI.Graphics();
      sprite.circle(0, 0, 2 + Math.random() * 3);
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
        maxLife: 500 + Math.random() * 500,
        scale: 1,
      });
    }
  }

  public createMuzzleFlash(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      
      const sprite = new PIXI.Graphics();
      sprite.circle(0, 0, 1 + Math.random() * 2);
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
        maxLife: 200 + Math.random() * 200,
        scale: 1,
      });
    }
  }

  public update(delta: number) {
    const toRemove: Particle[] = [];

    for (const particle of this.particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.life += delta * 16.67;
      
      const lifeRatio = particle.life / particle.maxLife;
      particle.scale = 1 - lifeRatio;
      particle.sprite.alpha = 1 - lifeRatio;

      particle.sprite.x = particle.x;
      particle.sprite.y = particle.y;
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
