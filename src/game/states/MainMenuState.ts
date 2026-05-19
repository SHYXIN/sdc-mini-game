import type { GameState } from '../StateStack';

/**
 * Pixel-art main menu with title, start button, and armory button.
 * Button click is detected via canvas coordinate hit-testing (no DOM).
 */
export class MainMenuState implements GameState {
  private readonly onStartGame: () => void;
  private readonly onOpenArmory: () => void;
  private hoveredBtn: number = -1;

  // Button dimensions (centered)
  private readonly btnW = 200;
  private readonly btnH = 50;
  private readonly startBtnX: number;
  private readonly startBtnY: number;
  private readonly armoryBtnX: number;
  private readonly armoryBtnY: number;

  constructor(
    onStartGame: () => void,
    onOpenArmory: () => void,
    canvasWidth = 480,
    canvasHeight = 640
  ) {
    this.onStartGame = onStartGame;
    this.onOpenArmory = onOpenArmory;
    this.startBtnX = (canvasWidth - this.btnW) / 2;
    this.startBtnY = canvasHeight * 0.55;
    this.armoryBtnX = (canvasWidth - this.btnW) / 2;
    this.armoryBtnY = this.startBtnY + this.btnH + 16;
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

    // Start Game button
    ctx.fillStyle = this.hoveredBtn === 0 ? '#ffffff' : '#e0e0e0';
    ctx.fillRect(this.startBtnX, this.startBtnY, this.btnW, this.btnH);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.startBtnX, this.startBtnY, this.btnW, this.btnH);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('开始游戏', this.startBtnX + this.btnW / 2, this.startBtnY + this.btnH / 2);

    // Armory button
    ctx.fillStyle = this.hoveredBtn === 1 ? '#ffffff' : '#e0e0e0';
    ctx.fillRect(this.armoryBtnX, this.armoryBtnY, this.btnW, this.btnH);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.armoryBtnX, this.armoryBtnY, this.btnW, this.btnH);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('军械库', this.armoryBtnX + this.btnW / 2, this.armoryBtnY + this.btnH / 2);
  }

  private inStartBtn(x: number, y: number): boolean {
    return (
      x >= this.startBtnX &&
      x <= this.startBtnX + this.btnW &&
      y >= this.startBtnY &&
      y <= this.startBtnY + this.btnH
    );
  }

  private inArmoryBtn(x: number, y: number): boolean {
    return (
      x >= this.armoryBtnX &&
      x <= this.armoryBtnX + this.btnW &&
      y >= this.armoryBtnY &&
      y <= this.armoryBtnY + this.btnH
    );
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const canvas = e.target as HTMLCanvasElement | null;
    if (!canvas || canvas.tagName !== 'CANVAS') {
      this.hoveredBtn = -1;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this.inStartBtn(x, y)) {
      this.hoveredBtn = 0;
    } else if (this.inArmoryBtn(x, y)) {
      this.hoveredBtn = 1;
    } else {
      this.hoveredBtn = -1;
    }
  };

  private handleClick = (e: MouseEvent): void => {
    const canvas = e.target as HTMLCanvasElement | null;
    if (!canvas || canvas.tagName !== 'CANVAS') return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this.inStartBtn(x, y)) {
      this.onStartGame();
    } else if (this.inArmoryBtn(x, y)) {
      this.onOpenArmory();
    }
  };
}
