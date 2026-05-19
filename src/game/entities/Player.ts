import { Vector2 } from '../../utils/Vector2';
import { LayerName } from '../../core/Layer';
import { Entity } from './Entity';
import { WEAPONS, WeaponId } from '../../data/weapons';
import { InputState } from '../../core/Input';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';

/**
 * Player entity — controlled by keyboard/mouse input.
 * Handles movement, weapon switching, ammo management, and auto-target shooting.
 */
export class Player extends Entity {
  layer = LayerName.Entities as const;
  radius = 12;

  hp = 100;
  maxHp = 100;

  weapon: WeaponId = 'pistol';
  ammo: Record<WeaponId, number> = {
    pistol: Infinity,
    rifle: 0,
    shotgun: 0,
  };

  shootCooldown = 0;
  invincibleTimer = 0;

  /** Stored aim direction from last update, used for drawing the aim line. */
  private lastAimDir: Vector2 = new Vector2(1, 0);

  constructor(spawnPos: Vector2) {
    super();
    this.position = spawnPos;
  }

  /**
   * Update player state: movement, shooting, timers.
   * Returns any newly created bullets for external management.
   */
  update(dt: number, input: InputState, enemies: Enemy[]): Bullet[] {
    // Store aim direction for rendering
    this.lastAimDir = input.aimDirection;

    // Movement: apply moveDirection at a fixed speed
    const moveSpeed = 120;
    this.position = this.position.add(input.moveDirection.scale(moveSpeed * dt));

    // Invincibility countdown
    if (this.invincibleTimer > 0) {
      this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
    }

    // Shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    }

    // Auto-target shooting
    const bullets = this.tryShoot(enemies);
    return bullets;
  }

  /**
   * Find the nearest enemy within attack range and shoot at it.
   * Returns an array of Bullets (multiple for shotgun).
   */
  private tryShoot(enemies: Enemy[]): Bullet[] {
    if (this.shootCooldown > 0) return [];

    const weaponConfig = WEAPONS[this.weapon];

    // Check ammo for non-pistol weapons
    if (this.weapon !== 'pistol' && (this.ammo[this.weapon] ?? 0) <= 0) {
      return [];
    }

    // Find nearest active enemy within weapon range
    // Use detection radius as effective range
    const range = weaponConfig.bulletSpeed * 2;
    let nearest: Enemy | null = null;
    let nearestDistSq = Infinity;

    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const distSq = this.distanceSqTo(enemy);
      if (distSq < nearestDistSq && distSq <= range * range) {
        nearest = enemy;
        nearestDistSq = distSq;
      }
    }

    if (!nearest) return [];

    // Consume ammo for non-pistol weapons
    if (this.weapon !== 'pistol') {
      this.ammo[this.weapon] = Math.max(0, this.ammo[this.weapon] - 1);
    }

    // Set cooldown based on fireRate
    this.shootCooldown = 1 / weaponConfig.fireRate;

    // Create bullet(s)
    const direction = nearest.position.sub(this.position).normalize();
    const pellets = weaponConfig.pellets ?? 1;
    const bulletSpeed = weaponConfig.bulletSpeed;
    const spread = weaponConfig.spread;
    const damage = weaponConfig.damage;

    const bullets: Bullet[] = [];
    for (let i = 0; i < pellets; i++) {
      let dir = direction;
      if (spread > 0 && pellets > 1) {
        const angle = (i - (pellets - 1) / 2) * spread;
        dir = new Vector2(
          direction.x * Math.cos(angle) - direction.y * Math.sin(angle),
          direction.x * Math.sin(angle) + direction.y * Math.cos(angle)
        );
      }
      bullets.push(
        new Bullet(
          new Vector2(this.position.x, this.position.y),
          dir,
          bulletSpeed,
          damage,
          'player'
        )
      );
    }

    return bullets;
  }

  takeDamage(amount: number): void {
    if (this.invincibleTimer > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincibleTimer = 0.5; // 0.5s invincibility after being hit
    if (this.hp <= 0) {
      this.active = false;
    }
  }

  switchWeapon(weaponId: WeaponId): void {
    this.weapon = weaponId;
    this.shootCooldown = 0;
  }

  addAmmo(weaponId: WeaponId, amount: number): void {
    if (weaponId === 'pistol') return; // pistol has infinite ammo
    this.ammo[weaponId] = (this.ammo[weaponId] ?? 0) + amount;
  }

  getAmmo(weaponId: WeaponId): number {
    return this.ammo[weaponId] ?? 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Flicker when invincible: toggle visibility every 0.1s
    const visible = this.invincibleTimer <= 0 || Math.floor(this.invincibleTimer * 10) % 2 === 0;

    if (visible) {
      // Body: green circle
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Aim line: 24px from center along last aim direction
      ctx.strokeStyle = '#00ff8888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(
        this.position.x + this.lastAimDir.x * 24,
        this.position.y + this.lastAimDir.y * 24
      );
      ctx.stroke();
    }
  }
}
