import * as PIXI from 'pixi.js';
import { Player } from './entities/Player';
import { AsteroidManager } from './entities/AsteroidManager';
import { ProjectileManager } from './entities/ProjectileManager';
import { ParticleManager } from './effects/ParticleManager';
import { InputManager } from './input/InputManager';

interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onComboUpdate: (combo: number, multiplier: number) => void;
  onGameOver: (finalScore: number) => void;
}

export class GameEngine {
  private app: PIXI.Application;
  private player: Player;
  private asteroidManager: AsteroidManager;
  private projectileManager: ProjectileManager;
  private particleManager: ParticleManager;
  private inputManager: InputManager;
  private callbacks: GameCallbacks;
  private isPaused = false;
  private score = 0;
  private combo = 0;
  private comboTimer = 0;
  private multiplier = 1;
  private readonly COMBO_TIMEOUT = 2000;
  private readonly COMBO_FOR_MULTIPLIER = 5;

  constructor(app: PIXI.Application, callbacks: GameCallbacks) {
    this.app = app;
    this.callbacks = callbacks;

    this.particleManager = new ParticleManager(app.stage);
    this.projectileManager = new ProjectileManager(app.stage);
    this.asteroidManager = new AsteroidManager(app.stage);
    this.player = new Player(app.stage, app.screen.width / 2, app.screen.height / 2);
    this.inputManager = new InputManager(app.canvas as HTMLCanvasElement);

    this.setupGameLoop();
  }

  private setupGameLoop() {
    this.app.ticker.add((ticker) => {
      if (this.isPaused) return;

      const delta = ticker.deltaTime;
      this.update(delta);
    });
  }

  private update(delta: number) {
    // Update input
    const input = this.inputManager.getInput();

    // Update player
    this.player.update(delta, input, this.app.screen.width, this.app.screen.height);

    // Handle shooting
    if (input.isShooting && this.player.canShoot()) {
      const projectile = this.player.shoot();
      this.projectileManager.addProjectile(projectile);
      this.particleManager.createMuzzleFlash(projectile.x, projectile.y);
    }

    // Update game entities
    this.projectileManager.update(delta, this.app.screen.width, this.app.screen.height);
    this.asteroidManager.update(delta);
    this.particleManager.update(delta);

    // Collision detection
    this.checkCollisions();

    // Update combo timer
    if (this.combo > 0) {
      this.comboTimer += delta * 16.67; // Convert to ms
      if (this.comboTimer > this.COMBO_TIMEOUT) {
        this.resetCombo();
      }
    }

    // Update callbacks
    this.callbacks.onLivesUpdate(this.player.lives);
  }

  private checkCollisions() {
    const projectiles = this.projectileManager.getProjectiles();
    const asteroids = this.asteroidManager.getAsteroids();

    // Check projectile-asteroid collisions
    for (const projectile of projectiles) {
      for (const asteroid of asteroids) {
        if (this.checkCircleCollision(
          projectile.x, projectile.y, 3,
          asteroid.x, asteroid.y, asteroid.radius
        )) {
          // Hit!
          this.projectileManager.removeProjectile(projectile);
          this.asteroidManager.destroyAsteroid(asteroid);
          
          // Create explosion
          this.particleManager.createExplosion(asteroid.x, asteroid.y, asteroid.size);
          
          // Update score
          this.addScore(asteroid.points);
          
          // Update combo
          this.addCombo();
          
          break;
        }
      }
    }

    // Check player-asteroid collisions
    for (const asteroid of asteroids) {
      if (this.checkCircleCollision(
        this.player.x, this.player.y, 15,
        asteroid.x, asteroid.y, asteroid.radius
      )) {
        this.asteroidManager.destroyAsteroid(asteroid);
        this.particleManager.createExplosion(asteroid.x, asteroid.y, asteroid.size);
        this.player.takeDamage();
        this.resetCombo();
        
        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }
  }

  private checkCircleCollision(
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }

  private addScore(points: number) {
    this.score += points * this.multiplier;
    this.callbacks.onScoreUpdate(this.score);
  }

  private addCombo() {
    this.combo++;
    this.comboTimer = 0;
    
    if (this.combo >= this.COMBO_FOR_MULTIPLIER && this.multiplier < 2) {
      this.multiplier = 2;
    }
    
    this.callbacks.onComboUpdate(this.combo, this.multiplier);
  }

  private resetCombo() {
    this.combo = 0;
    this.multiplier = 1;
    this.comboTimer = 0;
    this.callbacks.onComboUpdate(0, 1);
  }

  private gameOver() {
    this.isPaused = true;
    this.callbacks.onGameOver(this.score);
  }

  public start() {
    this.isPaused = false;
    this.asteroidManager.startSpawning();
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public destroy() {
    this.inputManager.destroy();
    this.asteroidManager.destroy();
    this.projectileManager.destroy();
    this.particleManager.destroy();
  }
}
