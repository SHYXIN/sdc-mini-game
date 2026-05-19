import { Vector2 } from '../../utils/Vector2';
import { LayerName } from '../../core/Layer';
import { Entity } from './Entity';
import { EnemyId, EnemyConfig, ENEMIES } from '../../data/enemies';
import { Bullet } from './Bullet';

/** AI state for enemy behavior. */
export type EnemyAIState = 'idle' | 'chase' | 'attack';

/**
 * Enemy entity — AI-driven opponent.
 * Specific AI behaviors will be implemented in Slice 6.
 * Currently moves slowly toward the player.
 */
export class Enemy extends Entity {
  layer = LayerName.Entities as const;

  enemyId: EnemyId;
  config: EnemyConfig;

  hp: number;
  maxHp: number;

  aiState: EnemyAIState = 'idle';
  aiTimer = 0;
  shootCooldown = 0;

  constructor(enemyId: EnemyId, spawnPos: Vector2) {
    super();
    this.enemyId = enemyId;
    this.config = ENEMIES[enemyId];
    this.position = spawnPos;
    this.radius = this.config.radius;
    this.hp = this.config.hp;
    this.maxHp = this.config.hp;
  }

  /**
   * Update enemy AI and movement.
   * Currently a placeholder: moves slowly toward the player.
   * Returns any new bullets (empty for now; shooting in Slice 6).
   */
  update(dt: number, playerPos: Vector2): Bullet[] {
    // Placeholder AI: move toward player at half the enemy's speed
    const dir = playerPos.sub(this.position);
    const distSq = dir.lengthSq();

    if (distSq > 1) {
      const moveDir = dir.normalize();
      const speed = this.config.speed * 0.5;
      this.position = this.position.add(moveDir.scale(speed * dt));
    }

    // Tick down shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    }

    // AI timer
    this.aiTimer += dt;

    // TODO: Slice 6 — implement idle/chase/attack state machine
    return [];
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
