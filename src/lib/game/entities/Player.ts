import * as PIXI from 'pixi.js';

interface InputState {
  moveX: number;
  moveY: number;
  isShooting: boolean;
}

export class Player {
  public sprite: PIXI.Graphics;
  public x: number;
  public y: number;
  public lives = 3;
  private velocity = { x: 0, y: 0 };
  private readonly speed = 5;
  private readonly friction = 0.9;
  private lastShotTime = 0;
  private readonly fireRate = 150;
  public weaponLevel = 1;

  constructor(container: PIXI.Container, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = this.createSprite();
    container.addChild(this.sprite);
  }

  private createSprite(): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    
    // Outer glow
    graphics.moveTo(0, -18);
    graphics.lineTo(-12, 12);
    graphics.lineTo(12, 12);
    graphics.lineTo(0, -18);
    graphics.fill({ color: 0x00ffff, alpha: 0.3 });
    
    // Main ship body (triangle)
    graphics.moveTo(0, -15);
    graphics.lineTo(-10, 10);
    graphics.lineTo(10, 10);
    graphics.lineTo(0, -15);
    graphics.fill({ color: 0x00ffff });
    graphics.stroke({ color: 0x00ffff, width: 3 });
    
    // Inner detail lines
    graphics.moveTo(0, -15);
    graphics.lineTo(0, 5);
    graphics.stroke({ color: 0x00cccc, width: 1 });
    
    // Wing details
    graphics.moveTo(-8, 5);
    graphics.lineTo(-5, 5);
    graphics.stroke({ color: 0x00cccc, width: 1 });
    
    graphics.moveTo(8, 5);
    graphics.lineTo(5, 5);
    graphics.stroke({ color: 0x00cccc, width: 1 });
    
    // Cockpit glow (brighter)
    graphics.circle(0, 0, 5);
    graphics.fill({ color: 0xffffff });
    graphics.circle(0, 0, 3);
    graphics.fill({ color: 0x00ffff });
    
    graphics.x = this.x;
    graphics.y = this.y;
    
    return graphics;
  }

  public update(delta: number, input: InputState, screenWidth: number, screenHeight: number) {
    // Apply input to velocity
    if (input.moveX !== 0 || input.moveY !== 0) {
      const magnitude = Math.sqrt(input.moveX ** 2 + input.moveY ** 2);
      this.velocity.x += (input.moveX / magnitude) * this.speed * delta * 0.1;
      this.velocity.y += (input.moveY / magnitude) * this.speed * delta * 0.1;
    }

    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    // Update position
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;

    // Screen wrapping
    const margin = 20;
    if (this.x < -margin) this.x = screenWidth + margin;
    if (this.x > screenWidth + margin) this.x = -margin;
    if (this.y < -margin) this.y = screenHeight + margin;
    if (this.y > screenHeight + margin) this.y = -margin;

    // Update sprite position
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    // Rotate towards velocity direction
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.sprite.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
    }
  }

  public canShoot(): boolean {
    const now = Date.now();
    return now - this.lastShotTime > this.fireRate;
  }

  public shoot() {
    this.lastShotTime = Date.now();

    const angle = this.sprite.rotation - Math.PI / 2;
    const projectiles = [];

    if (this.weaponLevel === 1) {
      projectiles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * 12,
        vy: Math.sin(angle) * 12,
      });
    } else if (this.weaponLevel >= 2) {
      const spreadAngle = Math.PI / 12;
      const leftAngle = angle - spreadAngle;
      const rightAngle = angle + spreadAngle;

      projectiles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(leftAngle) * 12,
        vy: Math.sin(leftAngle) * 12,
      });

      projectiles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(rightAngle) * 12,
        vy: Math.sin(rightAngle) * 12,
      });
    }

    return projectiles;
  }

  public upgradeWeapon() {
    this.weaponLevel = 2;
  }

  public takeDamage() {
    this.lives--;
  }

  public destroy() {
    this.sprite.destroy();
  }
}
