import * as PIXI from 'pixi.js';

interface Projectile {
  sprite: PIXI.Graphics;
  trail: PIXI.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number;
  trailPoints: { x: number; y: number; alpha: number }[];
}

export class ProjectileManager {
  private container: PIXI.Container;
  private projectiles: Projectile[] = [];
  private readonly maxLifetime = 2000; // ms
  private readonly maxTrailLength = 15;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  public addProjectile(data: { x: number; y: number; vx: number; vy: number }) {
    // Main projectile with glow
    const sprite = new PIXI.Graphics();
    
    // Outer glow
    sprite.circle(0, 0, 6);
    sprite.fill({ color: 0x00ffff, alpha: 0.3 });
    
    // Bright core
    sprite.circle(0, 0, 4);
    sprite.fill({ color: 0xffffff });
    
    // Inner bright
    sprite.circle(0, 0, 2);
    sprite.fill({ color: 0x00ffff });
    
    sprite.x = data.x;
    sprite.y = data.y;
    
    // Trail graphics
    const trail = new PIXI.Graphics();
    
    this.container.addChild(trail);
    this.container.addChild(sprite);

    this.projectiles.push({
      sprite,
      trail,
      x: data.x,
      y: data.y,
      vx: data.vx,
      vy: data.vy,
      lifetime: 0,
      trailPoints: [],
    });
  }

  public update(delta: number, screenWidth: number, screenHeight: number) {
    const toRemove: Projectile[] = [];

    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx * delta;
      projectile.y += projectile.vy * delta;
      projectile.lifetime += delta * 16.67;

      projectile.sprite.x = projectile.x;
      projectile.sprite.y = projectile.y;

      // Update trail
      projectile.trailPoints.unshift({ 
        x: projectile.x, 
        y: projectile.y,
        alpha: 1,
      });
      
      if (projectile.trailPoints.length > this.maxTrailLength) {
        projectile.trailPoints.pop();
      }

      // Draw trail
      projectile.trail.clear();
      for (let i = 0; i < projectile.trailPoints.length - 1; i++) {
        const point = projectile.trailPoints[i];
        const nextPoint = projectile.trailPoints[i + 1];
        const alpha = 1 - (i / projectile.trailPoints.length);
        const width = 4 * alpha;
        
        projectile.trail.moveTo(point.x, point.y);
        projectile.trail.lineTo(nextPoint.x, nextPoint.y);
        projectile.trail.stroke({ 
          color: 0x00ffff, 
          width, 
          alpha: alpha * 0.8,
        });
      }

      // Remove if off screen or expired
      const margin = 50;
      if (
        projectile.x < -margin ||
        projectile.x > screenWidth + margin ||
        projectile.y < -margin ||
        projectile.y > screenHeight + margin ||
        projectile.lifetime > this.maxLifetime
      ) {
        toRemove.push(projectile);
      }
    }

    for (const projectile of toRemove) {
      this.removeProjectile(projectile);
    }
  }

  public removeProjectile(projectile: Projectile) {
    const index = this.projectiles.indexOf(projectile);
    if (index > -1) {
      projectile.sprite.destroy();
      projectile.trail.destroy();
      this.projectiles.splice(index, 1);
    }
  }

  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  public destroy() {
    for (const projectile of this.projectiles) {
      projectile.sprite.destroy();
      projectile.trail.destroy();
    }
    this.projectiles = [];
  }
}
