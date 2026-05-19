import type { GameState } from '../StateStack';

/**
 * Pixel-art main menu with title and start button.
 * Button click is detected via canvas coordinate hit-testing (no DOM).
 */
export class MainMenuState implements GameState {
  private readonly onStartGame: () => void;
  private hovered = false;

  // Button dimensions (centered)
  private readonly btnX: number;
  private readonly btnY: number;
  private readonly btnW = 200;
  private readonly btnH = 50;

  constructor(onStartGame: () => void, canvasWidth = 480, canvasHeight = 640) {
    this.onStartGame = onStartGame;
    this.btnX = (canvasWidth - this.btnW) / 2;
    this.btnY = canvasHeight * 0.6;
  }

  onEnter(): void {
    window.addEventListener('click', this.handleClick);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  onExit(): void {
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  update(_dt: number): void {
    // nothing to update yet
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, cw, ch);

    // Title
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('搜打撤', cw / 2, ch * 0.3);

    // Subtitle
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '16px monospace';
    ctx.fillText('Search · Destroy · Extract', cw / 2, ch * 0.38);

    // Button background
    ctx.fillStyle = this.hovered ? '#ffffff' : '#e0e0e0';
    ctx.fillRect(this.btnX, this.btnY, this.btnW, this.btnH);

    // Button border
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.btnX, this.btnY, this.btnW, this.btnH);

    // Button text
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('开始游戏', this.btnX + this.btnW / 2, this.btnY + this.btnH / 2);
  }

  private inButton(x: number, y: number): boolean {
    return (
      x >= this.btnX &&
      x <= this.btnX + this.btnW &&
      y >= this.btnY &&
      y <= this.btnY + this.btnH
    );
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const canvas = e.target as HTMLCanvasElement | null;
    if (!canvas || canvas.tagName !== 'CANVAS') {
      this.hovered = false;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.hovered = this.inButton(x, y);
  };

  private handleClick = (e: MouseEvent): void => {
    const canvas = e.target as HTMLCanvasElement | null;
    if (!canvas || canvas.tagName !== 'CANVAS') return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this.inButton(x, y)) {
      this.onStartGame();
    }
  };
}
