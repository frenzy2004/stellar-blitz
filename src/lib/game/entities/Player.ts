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
  private readonly fireRate = 200; // ms between shots

  constructor(container: PIXI.Container, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.sprite = this.createSprite();
    container.addChild(this.sprite);
  }

  private createSprite(): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    
    // Ship body (triangle)
    graphics.moveTo(0, -15);
    graphics.lineTo(-10, 10);
    graphics.lineTo(10, 10);
    graphics.lineTo(0, -15);
    graphics.fill({ color: 0x00ffff });
    graphics.stroke({ color: 0x00ffff, width: 2 });
    
    // Cockpit glow
    graphics.circle(0, 0, 4);
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
    
    // Calculate direction from rotation
    const angle = this.sprite.rotation - Math.PI / 2;
    
    return {
      x: this.x,
      y: this.y,
      vx: Math.cos(angle) * 10,
      vy: Math.sin(angle) * 10,
    };
  }

  public takeDamage() {
    this.lives--;
  }

  public destroy() {
    this.sprite.destroy();
  }
}
