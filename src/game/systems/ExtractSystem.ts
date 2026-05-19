import { Player } from '../entities/Player';
import { MapSystem } from './MapSystem';
import { InventorySystem } from './InventorySystem';

const EXTRACT_DELAY = 3;           // 第 3 分钟触发撤离点
const EXTRACT_TIME_LIMIT = 120;    // 2 分钟限时（秒）
const EXTRACT_CHANNEL_TIME = 5;    // 读条 5 秒
const EXTRACT_RADIUS = 30;         // 撤离点作用半径（像素）

export interface ExtractEvents {
  onExtractPointSpawned?: (x: number, y: number) => void;
  onExtractSuccess?: (goldEarned: number) => void;
  onExtractFailed?: () => void;
}

export class ExtractSystem {
  private player: Player;
  private mapSystem: MapSystem;
  private inventory: InventorySystem;
  private events: ExtractEvents;

  private gameTimer: number = 0;           // 游戏计时器
  private extractActive: boolean = false;  // 撤离点是否已激活
  private extractX: number = 0;            // 撤离点像素坐标 X
  private extractY: number = 0;            // 撤离点像素坐标 Y
  private channelTimer: number = 0;        // 读条计时器
  private isChanneling: boolean = false;   // 是否正在读条
  private extracted: boolean = false;      // 是否已成功撤离

  constructor(player: Player, mapSystem: MapSystem, inventory: InventorySystem, events: ExtractEvents = {}) {
    this.player = player;
    this.mapSystem = mapSystem;
    this.inventory = inventory;
    this.events = events;
  }

  get isActive(): boolean { return this.extractActive; }
  get isExtracted(): boolean { return this.extracted; }
  get channelProgress(): number { return this.isChanneling ? this.channelTimer / EXTRACT_CHANNEL_TIME : 0; }
  get extractPosition(): { x: number; y: number } | null {
    return this.extractActive ? { x: this.extractX, y: this.extractY } : null;
  }
  get timeUntilExtract(): number { return Math.max(0, EXTRACT_DELAY * 60 - this.gameTimer); }
  get timeRemaining(): number { return Math.max(0, EXTRACT_TIME_LIMIT - (this.gameTimer - EXTRACT_DELAY * 60)); }

  update(dt: number): void {
    this.gameTimer += dt;

    // 触发撤离点
    if (!this.extractActive && this.gameTimer >= EXTRACT_DELAY * 60) {
      this.spawnExtractPoint();
    }

    // 超时检查
    if (this.extractActive && !this.extracted && !this.isChanneling) {
      const elapsed = this.gameTimer - EXTRACT_DELAY * 60;
      if (elapsed >= EXTRACT_TIME_LIMIT) {
        this.events.onExtractFailed?.();
        return;
      }
    }

    // 读条检查
    if (this.extractActive && !this.extracted) {
      const dist = Math.sqrt(
        (this.player.position.x - this.extractX) ** 2 +
        (this.player.position.y - this.extractY) ** 2
      );

      if (dist <= EXTRACT_RADIUS) {
        if (!this.isChanneling) {
          this.isChanneling = true;
          this.channelTimer = 0;
        }
        this.channelTimer += dt;

        if (this.channelTimer >= EXTRACT_CHANNEL_TIME) {
          this.extracted = true;
          const gold = this.inventory.getInventoryValue();
          this.events.onExtractSuccess?.(gold);
        }
      } else {
        // 离开范围，打断读条
        this.isChanneling = false;
        this.channelTimer = 0;
      }
    }
  }

  private spawnExtractPoint(): void {
    const candidates = this.mapSystem.data.extractCandidates;
    if (candidates.length === 0) return;
    const idx = Math.floor(Math.random() * candidates.length);
    const spawn = candidates[idx];
    const pixel = this.mapSystem.tileToPixel(spawn.x, spawn.y);
    this.extractX = pixel.x;
    this.extractY = pixel.y;
    this.extractActive = true;
    this.events.onExtractPointSpawned?.(this.extractX, this.extractY);
  }

  // 渲染撤离点
  drawExtractPoint(ctx: CanvasRenderingContext2D): void {
    if (!this.extractActive) return;

    // 撤离点圆圈（脉冲动画）
    const pulse = Math.sin(this.gameTimer * 4) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(255, 200, 0, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.extractX, this.extractY, EXTRACT_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 200, 0, ${pulse * 0.3})`;
    ctx.fill();

    // 读条进度条
    if (this.isChanneling) {
      const barWidth = 40;
      const barHeight = 6;
      const progress = this.channelProgress;
      ctx.fillStyle = '#333';
      ctx.fillRect(this.extractX - barWidth / 2, this.extractY - EXTRACT_RADIUS - 15, barWidth, barHeight);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(this.extractX - barWidth / 2, this.extractY - EXTRACT_RADIUS - 15, barWidth * progress, barHeight);
    }
  }
}
