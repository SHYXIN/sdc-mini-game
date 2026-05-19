import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Item } from '../entities/Item';
import { MapSystem } from './MapSystem';
import { getItemsByRarity, type ItemTypeId } from '../../data/items';

/**
 * Callbacks for combat-related game events.
 */
export interface CombatEvents {
  onEnemyKilled?: (enemy: Enemy) => void;
  onPlayerDied?: () => void;
  onBulletHit?: (bullet: Bullet, target: Enemy | Player) => void;
}

/**
 * CombatSystem manages all entity interactions:
 *   - Bullet movement and collision (vs walls, enemies, player)
 *   - Enemy-to-player contact damage
 *   - Cleanup of inactive entities
 *   - Event callbacks (kills, deaths, hits)
 *   - Enemy death loot drops (30% chance for a white-rarity item)
 */
export class CombatSystem {
  private player: Player;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private items: Item[] = [];
  private mapSystem: MapSystem;
  private events: CombatEvents;

  /** Probability that a killed enemy drops loot. */
  private static readonly DROP_CHANCE = 0.3;

  constructor(player: Player, mapSystem: MapSystem, events: CombatEvents = {}) {
    this.player = player;
    this.mapSystem = mapSystem;
    this.events = events;
  }

  // ------------------------------------------------------------------  spawn / add

  spawnEnemy(enemy: Enemy): void {
    this.enemies.push(enemy);
  }

  spawnItem(item: Item): void {
    this.items.push(item);
  }

  addBullet(bullet: Bullet): void {
    this.bullets.push(bullet);
  }

  // ------------------------------------------------------------------  main update

  update(dt: number): void {
    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.checkBulletWallCollisions();
    this.checkBulletEnemyCollisions();
    this.checkBulletPlayerCollisions();
    this.checkEnemyPlayerContact(dt);
    this.cleanupInactive();
  }

  // ------------------------------------------------------------------  enemy AI

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.update(dt, this.player.position, (b) => this.addBullet(b));
      }
    }
  }

  // ------------------------------------------------------------------  bullet movement

  private updateBullets(dt: number): void {
    for (const bullet of this.bullets) {
      if (bullet.active) {
        bullet.update(dt);
      }
    }
  }

  // ------------------------------------------------------------------  bullet vs wall

  private checkBulletWallCollisions(): void {
    for (const bullet of this.bullets) {
      if (!bullet.active) continue;
      if (!this.mapSystem.isPassable(bullet.position.x, bullet.position.y, bullet.radius)) {
        bullet.active = false;
      }
    }
  }

  // ------------------------------------------------------------------  bullet vs enemy

  private checkBulletEnemyCollisions(): void {
    for (const bullet of this.bullets) {
      if (!bullet.active || bullet.source !== 'player') continue;

      for (const enemy of this.enemies) {
        if (!enemy.active) continue;

        if (bullet.collidesWith(enemy)) {
          enemy.takeDamage(bullet.damage);
          bullet.active = false;

          if (this.events.onBulletHit) {
            this.events.onBulletHit(bullet, enemy);
          }

          if (!enemy.active) {
            this.handleEnemyKilled(enemy);
          }

          break; // bullet already consumed
        }
      }
    }
  }

  // ------------------------------------------------------------------  bullet vs player

  private checkBulletPlayerCollisions(): void {
    for (const bullet of this.bullets) {
      if (!bullet.active || bullet.source !== 'enemy') continue;

      if (this.player.active && bullet.collidesWith(this.player)) {
        this.player.takeDamage(bullet.damage);
        bullet.active = false;

        if (this.events.onBulletHit) {
          this.events.onBulletHit(bullet, this.player);
        }

        if (!this.player.active && this.events.onPlayerDied) {
          this.events.onPlayerDied();
        }

        break; // bullet already consumed
      }
    }
  }

  // ------------------------------------------------------------------  enemy vs player (contact damage)

  private checkEnemyPlayerContact(dt: number): void {
    if (!this.player.active) return;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      if (enemy.collidesWith(this.player)) {
        const damage = enemy.config.attackDamage * dt;
        this.player.takeDamage(damage);

        if (!this.player.active && this.events.onPlayerDied) {
          this.events.onPlayerDied();
          return; // no further checks once dead
        }
      }
    }
  }

  // ------------------------------------------------------------------  enemy death + loot drop

  private handleEnemyKilled(enemy: Enemy): void {
    // 30% chance to drop a white-rarity item at the enemy's position
    if (Math.random() < CombatSystem.DROP_CHANCE) {
      const whiteItems = getItemsByRarity('white');
      if (whiteItems.length > 0) {
        const itemTypeId = whiteItems[Math.floor(Math.random() * whiteItems.length)];
        const ts = this.mapSystem.data.tileSize;
        const tileX = Math.floor(enemy.position.x / ts);
        const tileY = Math.floor(enemy.position.y / ts);
        this.items.push(new Item(itemTypeId, tileX, tileY, ts));
      }
    }

    if (this.events.onEnemyKilled) {
      this.events.onEnemyKilled(enemy);
    }
  }

  // ------------------------------------------------------------------  cleanup

  private cleanupInactive(): void {
    this.bullets = this.bullets.filter((b) => b.active);
    this.enemies = this.enemies.filter((e) => e.active);
    this.items = this.items.filter((i) => i.active);
  }

  // ------------------------------------------------------------------  queries

  getEntities(): { player: Player; enemies: Enemy[]; bullets: Bullet[]; items: Item[] } {
    return {
      player: this.player,
      enemies: this.enemies,
      bullets: this.bullets,
      items: this.items,
    };
  }

  isPlayerDead(): boolean {
    return !this.player.active;
  }

  getAliveEnemyCount(): number {
    return this.enemies.filter((e) => e.active).length;
  }
}
