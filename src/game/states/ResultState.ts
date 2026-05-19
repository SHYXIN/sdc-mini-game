import type { GameState } from '../StateStack';
import { loadProgression, saveProgression } from '../progression/ProgressionData';

/**
 * Result state — shows extract success/failure and earnings.
 * Persists gold and extraction/death stats to localStorage on enter.
 * Click to return to main menu (callback handled externally).
 */
export class ResultState implements GameState {
  private readonly success: boolean;
  private readonly earnings: number;
  private readonly onBackToMenu: () => void;
  private hovered = false;

  private readonly btnX: number;
  private readonly btnY: number;
  private readonly btnW = 200;
  private readonly btnH = 50;

  constructor(
    success: boolean,
    earnings: number,
    onBackToMenu: () => void,
    canvasWidth = 480,
    canvasHeight = 640
  ) {
    this.success = success;
    this.earnings = earnings;
    this.onBackToMenu = onBackToMenu;
    this.btnX = (canvasWidth - this.btnW) / 2;
    this.btnY = canvasHeight * 0.7;
  }

  onEnter(): void {
    // Persist progression data
    const prog = loadProgression();
    if (this.success) {
      prog.gold += this.earnings;
      prog.totalExtractions += 1;
    } else {
      prog.totalDeaths += 1;
    }
    saveProgression(prog);

    window.addEventListener('click', this.handleClick);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  onExit(): void {
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  update(_dt: number): void {
    // static screen
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, cw, ch);

    // Result title
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.success ? '#00ff88' : '#e94560';
    ctx.fillText(this.success ? '撤离成功！' : '撤离失败', cw / 2, ch * 0.3);

    // Earnings
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText(`本局收益: ${this.earnings}`, cw / 2, ch * 0.45);

    // Back button
    ctx.fillStyle = this.hovered ? '#ffffff' : '#e0e0e0';
    ctx.fillRect(this.btnX, this.btnY, this.btnW, this.btnH);

    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.btnX, this.btnY, this.btnW, this.btnH);

    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('返回主菜单', this.btnX + this.btnW / 2, this.btnY + this.btnH / 2);
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
      this.onBackToMenu();
    }
  };
}
