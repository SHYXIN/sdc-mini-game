import { Vector2 } from '../../utils/Vector2';
import { LayerName } from '../../core/Layer';
import { Entity } from './Entity';

/** Who fired this bullet. */
export type BulletSource = 'player' | 'enemy';

/**
 * Bullet entity — fast-moving projectile with limited lifetime.
 */
export class Bullet extends Entity {
  layer = LayerName.Projectiles as const;
  radius = 3;

  direction: Vector2;
  speed: number;
  damage: number;
  lifetime: number;
  source: BulletSource;

  private static readonly MAX_LIFETIME = 2; // seconds

  constructor(
    pos: Vector2,
    dir: Vector2,
    speed: number,
    damage: number,
    source: BulletSource
  ) {
    super();
    this.position = pos;
    this.direction = dir;
    this.speed = speed;
    this.damage = damage;
    this.source = source;
    this.lifetime = Bullet.MAX_LIFETIME;
  }

  /**
   * Move the bullet and decrement lifetime.
   * Marks inactive when lifetime expires.
   */
  update(dt: number): void {
    this.position = this.position.add(this.direction.scale(this.speed * dt));
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Player bullets: yellow, enemy bullets: red
    ctx.fillStyle = this.source === 'player' ? '#ffcc00' : '#ff4444';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
