import * as PIXI from 'pixi.js';

interface Projectile {
  sprite: PIXI.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifetime: number;
}

export class ProjectileManager {
  private container: PIXI.Container;
  private projectiles: Projectile[] = [];
  private readonly maxLifetime = 2000; // ms

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  public addProjectile(data: { x: number; y: number; vx: number; vy: number }) {
    const sprite = new PIXI.Graphics();
    sprite.circle(0, 0, 3);
    sprite.fill({ color: 0x00ffff });
    sprite.x = data.x;
    sprite.y = data.y;
    
    this.container.addChild(sprite);

    this.projectiles.push({
      sprite,
      x: data.x,
      y: data.y,
      vx: data.vx,
      vy: data.vy,
      lifetime: 0,
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
      this.projectiles.splice(index, 1);
    }
  }

  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  public destroy() {
    for (const projectile of this.projectiles) {
      projectile.sprite.destroy();
    }
    this.projectiles = [];
  }
}
