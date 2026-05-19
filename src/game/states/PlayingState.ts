import type { Canvas } from '../../core/Canvas';
import type { KeyboardInput } from '../../core/Input';
import type { GameState } from '../StateStack';

/**
 * Playing state — skeleton for now.
 * Will be expanded with actual gameplay logic in later slices.
 */
export class PlayingState implements GameState {
  private readonly canvas: Canvas;
  private readonly input: KeyboardInput;

  constructor(canvas: Canvas, input: KeyboardInput) {
    this.canvas = canvas;
    this.input = input;
  }

  onEnter(): void {
    // gameplay logic will be initialized in later slices
  }

  onExit(): void {
    // cleanup gameplay resources
  }

  update(_dt: number): void {
    // gameplay update will be implemented in later slices
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, cw, ch);

    // Placeholder text
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏中...', cw / 2, ch / 2);

    ctx.fillStyle = '#a0a0b0';
    ctx.font = '14px monospace';
    ctx.fillText('按 ESC 暂停', cw / 2, ch / 2 + 40);
  }
}
