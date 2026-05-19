import type { Canvas } from '../../core/Canvas';
import type { KeyboardInput } from '../../core/Input';
import type { GameState } from '../StateStack';
import { MapSystem, CombatSystem, InventorySystem, ExtractSystem } from '../systems';
import { Player } from '../entities/Player';
import { WAREHOUSE } from '../../data';
import type { AudioSystem } from '../audio';
import type { ProgressionData } from '../progression/ProgressionData';

/**
 * Playing state — core gameplay loop.
 * Integrates MapSystem, CombatSystem, InventorySystem, and ExtractSystem.
 * Applies progression bonuses (maxHp, speed, inventorySlots) on construction.
 * Transitions to ResultState on extract success or failure / player death.
 */
export class PlayingState implements GameState {
  private readonly canvas: Canvas;
  private readonly input: KeyboardInput;
  private readonly onGameEnd: (success: boolean, goldEarned: number) => void;
  private readonly audio: AudioSystem | null;

  private mapSystem: MapSystem;
  private player: Player;
  private combatSystem: CombatSystem;
  private inventorySystem: InventorySystem;
  private extractSystem: ExtractSystem;

  constructor(
    canvas: Canvas,
    input: KeyboardInput,
    onGameEnd: (success: boolean, goldEarned: number) => void,
    audio?: AudioSystem,
    progression?: ProgressionData
  ) {
    this.canvas = canvas;
    this.input = input;
    this.onGameEnd = onGameEnd;
    this.audio = audio ?? null;

    // Initialize systems
    this.mapSystem = new MapSystem(WAREHOUSE.id);

    const spawnPixel = this.mapSystem.tileToPixel(
      WAREHOUSE.playerSpawn.x,
      WAREHOUSE.playerSpawn.y
    );
    this.player = new Player(spawnPixel);

    // Apply progression bonuses
    if (progression) {
      const hpBonus = progression.attributeLevels.maxHp * 20;    // +20 HP per level
      const slotBonus = progression.attributeLevels.inventorySlots; // +1 slot per level

      this.player.maxHp = 100 + hpBonus;
      this.player.hp = this.player.maxHp;

      this.inventorySystem = new InventorySystem(this.player, 6 + slotBonus);
    } else {
      this.inventorySystem = new InventorySystem(this.player);
    }

    this.combatSystem = new CombatSystem(this.player, this.mapSystem, {
      onBulletHit: () => {
        this.audio?.playHit();
      },
      onEnemyKilled: () => {
        this.audio?.playHit();
      },
      onPlayerHurt: () => {
        this.audio?.playHurt();
      },
      onPlayerDied: () => {
        this.audio?.playDeath();
        this.onGameEnd(false, 0);
      },
    });

    this.inventorySystem.onPickup = () => {
      this.audio?.playPickup();
    };

    this.extractSystem = new ExtractSystem(
      this.player,
      this.mapSystem,
      this.inventorySystem,
      {
        onExtractSuccess: (goldEarned: number) => {
          this.audio?.playExtract();
          this.onGameEnd(true, goldEarned);
        },
        onExtractFailed: () => {
          this.onGameEnd(false, 0);
        },
      }
    );
  }

  onEnter(): void {
    // gameplay logic initialized in constructor
  }

  onExit(): void {
    // cleanup gameplay resources
  }

  update(dt: number): void {
    // Player update — movement + shooting
    const bullets = this.player.update(
      dt,
      this.input,
      this.combatSystem.getEntities().enemies
    );
    if (bullets.length > 0) {
      this.audio?.playShoot();
    }
    for (const b of bullets) {
      this.combatSystem.addBullet(b);
    }

    // Combat — bullets, enemies, collisions
    this.combatSystem.update(dt);

    // Inventory — auto-pickup + regen
    this.inventorySystem.update(dt, this.combatSystem.getEntities().items);

    // Extract — timer, channel, success/failure
    this.extractSystem.update(dt);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;

    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, cw, ch);

    // Draw map
    const mapDrawable = this.mapSystem.getDrawable();
    mapDrawable.draw(ctx);

    // Draw extract point
    this.extractSystem.drawExtractPoint(ctx);

    // Draw entities
    const entities = this.combatSystem.getEntities();
    for (const item of entities.items) {
      if (item.active) item.draw(ctx);
    }
    for (const enemy of entities.enemies) {
      if (enemy.active) enemy.draw(ctx);
    }
    for (const bullet of entities.bullets) {
      if (bullet.active) bullet.draw(ctx);
    }
    if (this.player.active) this.player.draw(ctx);

    // HUD — timer info
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (!this.extractSystem.isActive) {
      const t = Math.ceil(this.extractSystem.timeUntilExtract);
      ctx.fillText(`撤离点激活: ${t}s`, 10, 10);
    } else {
      const t = Math.ceil(this.extractSystem.timeRemaining);
      ctx.fillText(`撤离限时: ${t}s`, 10, 10);
      if (this.extractSystem.channelProgress > 0) {
        ctx.fillText(`撤离中... ${Math.ceil(this.extractSystem.channelProgress * 100)}%`, 10, 30);
      }
    }

    // HP bar
    const hpPercent = this.player.hp / this.player.maxHp;
    ctx.fillStyle = '#333';
    ctx.fillRect(10, ch - 30, 100, 10);
    ctx.fillStyle = hpPercent > 0.3 ? '#00ff88' : '#e94560';
    ctx.fillRect(10, ch - 30, 100 * hpPercent, 10);
  }
}
