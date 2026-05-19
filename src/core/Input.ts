import { Vector2 } from '../utils/Vector2';

export interface InputState {
  moveDirection: Vector2;
  aimDirection: Vector2;
}

/**
 * Keyboard input: WASD = move, Mouse = aim
 */
export class KeyboardInput implements InputState {
  private keys = new Set<string>();
  private mousePos = new Vector2();
  private playerPos = new Vector2();
  private canvas: HTMLCanvasElement;

  moveDirection = Vector2.zero();
  aimDirection = Vector2.zero();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('mousemove', this.onMouseMove);
  }

  setPlayerPosition(pos: Vector2): void {
    this.playerPos = pos;
  }

  update(): void {
    const dir = Vector2.zero();
    if (this.keys.has('w') || this.keys.has('arrowup')) dir.y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dir.y += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dir.x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) dir.x += 1;
    this.moveDirection = dir.lengthSq() > 0 ? dir.normalize() : dir;

    const aim = this.mousePos.sub(this.playerPos);
    this.aimDirection = aim.lengthSq() > 0 ? aim.normalize() : new Vector2(1, 0);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.key.toLowerCase());
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
  };

  private onMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = new Vector2(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };
}
