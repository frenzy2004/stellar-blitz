interface InputState {
  moveX: number;
  moveY: number;
  isShooting: boolean;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private input: InputState = { moveX: 0, moveY: 0, isShooting: false };
  private touchStartPos: { x: number; y: number } | null = null;
  private keys: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);

    // Keyboard events for desktop
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Left side = movement, right side = shooting
    if (x < rect.width / 2) {
      this.touchStartPos = { x, y };
    } else {
      this.input.isShooting = true;
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!this.touchStartPos) return;

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Calculate movement vector
    const dx = x - this.touchStartPos.x;
    const dy = y - this.touchStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 10) {
      this.input.moveX = dx / distance;
      this.input.moveY = dy / distance;
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.touchStartPos = null;
    this.input.moveX = 0;
    this.input.moveY = 0;
    this.input.isShooting = false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase());
    if (e.key === ' ') {
      this.input.isShooting = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
    if (e.key === ' ') {
      this.input.isShooting = false;
    }
  };

  public getInput(): InputState {
    // Update keyboard input
    let moveX = 0;
    let moveY = 0;

    if (this.keys.has('w') || this.keys.has('arrowup')) moveY -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) moveY += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) moveX -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) moveX += 1;

    // Prioritize keyboard over touch if both are active
    if (moveX !== 0 || moveY !== 0) {
      this.input.moveX = moveX;
      this.input.moveY = moveY;
    }

    return { ...this.input };
  }

  public destroy() {
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
