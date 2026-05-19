import { Vector2 } from '../../utils/Vector2';
import { LayerName } from '../../core/Layer';
import { Entity } from './Entity';
import { EnemyId, EnemyConfig, ENEMIES } from '../../data/enemies';
import { Bullet } from './Bullet';
import { MapSystem } from '../systems/MapSystem';

/** AI state for enemy behavior. */
export type EnemyAIState = 'idle' | 'chase' | 'attack';

/** How long (seconds) the enemy keeps chasing after player leaves detectionRadius. */
const CHASE_MEMORY_DURATION = 3;

/** Bullet speed for enemy projectiles. */
const ENEMY_BULLET_SPEED = 250;

/**
 * Enemy entity — AI-driven opponent with a three-state FSM:
 *
 *   idle  --[player in detectionRadius]-->  chase
 *   chase --[player in attackRange]------>  attack
 *   attack-[player outside attackRange]-->  chase
 *   chase --[player outside detectionRadius for 3s]--> idle
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

  private mapSystem: MapSystem;

  constructor(enemyId: EnemyId, spawnPos: Vector2, mapSystem: MapSystem) {
    super();
    this.enemyId = enemyId;
    this.config = ENEMIES[enemyId];
    this.position = spawnPos;
    this.radius = this.config.radius;
    this.hp = this.config.hp;
    this.maxHp = this.config.hp;
    this.mapSystem = mapSystem;
  }

  /**
   * Update enemy AI state machine, movement, and shooting.
   *
   * @param dt         Delta time in seconds.
   * @param playerPos  Current player position.
   * @param addBullet  Callback to register a new bullet with the combat system.
   */
  update(dt: number, playerPos: Vector2, addBullet: (b: Bullet) => void): void {
    // --- distance to player (squared) ---
    const toPlayer = playerPos.sub(this.position);
    const distSq = toPlayer.lengthSq();
    const detectionSq = this.config.detectionRadius * this.config.detectionRadius;
    const attackSq = this.config.attackRange * this.config.attackRange;

    // --- state transitions ---
    this.resolveState(distSq, detectionSq, attackSq, dt);

    // --- state behaviour ---
    switch (this.aiState) {
      case 'idle':
        this.execIdle();
        break;
      case 'chase':
        this.execChase(dt, toPlayer, distSq);
        break;
      case 'attack':
        this.execAttack(dt, toPlayer, addBullet);
        break;
    }
  }

  // ------------------------------------------------------------------  state transitions

  private resolveState(distSq: number, detectionSq: number, attackSq: number, dt: number): void {
    switch (this.aiState) {
      case 'idle':
        if (distSq <= detectionSq) {
          this.aiState = 'chase';
          this.aiTimer = 0;
        }
        break;

      case 'chase':
        if (distSq <= attackSq) {
          this.aiState = 'attack';
        } else if (distSq > detectionSq) {
          this.aiTimer += dt;
          if (this.aiTimer >= CHASE_MEMORY_DURATION) {
            this.aiState = 'idle';
            this.aiTimer = 0;
          }
        } else {
          // Player is inside detectionRadius but outside attackRange — reset timer
          this.aiTimer = 0;
        }
        break;

      case 'attack':
        if (distSq > attackSq) {
          this.aiState = 'chase';
          this.aiTimer = 0;
        }
        break;
    }
  }

  // ------------------------------------------------------------------  state behaviour

  /** Idle: stand still. */
  private execIdle(): void {
    // No movement. Optional small patrol can be added later.
  }

  /** Chase: move toward the player while respecting wall collisions. */
  private execChase(dt: number, toPlayer: Vector2, distSq: number): void {
    if (distSq <= 1) return;

    const moveDir = toPlayer.normalize();
    const speed = this.config.speed;
    const newPos = this.position.add(moveDir.scale(speed * dt));

    // Only move if the new position is passable
    if (this.mapSystem.isPassable(newPos.x, newPos.y, this.radius)) {
      this.position = newPos;
    }
  }

  /** Attack: stop moving and shoot at the player at a fixed interval. */
  private execAttack(dt: number, toPlayer: Vector2, addBullet: (b: Bullet) => void): void {
    // Tick down shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    }

    if (this.shootCooldown <= 0 && toPlayer.lengthSq() > 0) {
      const dir = toPlayer.normalize();
      const bullet = new Bullet(
        new Vector2(this.position.x, this.position.y),
        dir,
        ENEMY_BULLET_SPEED,
        this.config.attackDamage,
        'enemy'
      );
      addBullet(bullet);
      this.shootCooldown = this.config.attackInterval;
    }
  }

  // ------------------------------------------------------------------  public helpers

  get state(): EnemyAIState { return this.aiState; }

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
