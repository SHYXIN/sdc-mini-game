import type { KeyboardInput } from '../../core/Input';
import type { GameState } from '../StateStack';

/**
 * Paused state — semi-transparent overlay with "Paused" text.
 * Press ESC to resume (pops itself from the stack).
 */
export class PausedState implements GameState {
  private readonly input: KeyboardInput;
  private readonly onResume: () => void;

  constructor(input: KeyboardInput, onResume: () => void) {
    this.input = input;
    this.onResume = onResume;
  }

  onEnter(): void {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  onExit(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  update(_dt: number): void {
    // paused — no gameplay update
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, cw, ch);

    // Pause text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂停', cw / 2, ch / 2 - 20);

    ctx.fillStyle = '#a0a0b0';
    ctx.font = '16px monospace';
    ctx.fillText('按 ESC 继续', cw / 2, ch / 2 + 30);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.onResume();
    }
  };
}
