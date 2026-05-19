import { Player } from '../entities/Player';
import { Item } from '../entities/Item';
import { ITEM_TYPES, type ItemTypeId, type ItemTypeConfig, type WeaponId } from '../../data';

const INITIAL_SLOTS = 6;
const REGEN_DELAY = 5;      // 脱离战斗 5 秒后开始回血
const REGEN_RATE = 0.05;    // 每秒回 5% 最大血量
const PICKUP_RADIUS = 35;   // 自动拾取半径

export interface InventorySlot {
  itemTypeId: ItemTypeId;
  config: ItemTypeConfig;
}

/**
 * InventorySystem — manages the player's backpack, item pickups,
 * medicine usage, and automatic health regeneration.
 *
 * Slot-based inventory: ammo is consumed directly (no slot cost),
 * weapons replace the current weapon, medicine and valuables occupy slots.
 * Health regenerates at 5% maxHp/s after 5 seconds out of combat.
 */
export class InventorySystem {
  private player: Player;
  private slots: (InventorySlot | null)[];
  private maxSlots: number;
  private combatTimer: number;

  /** Optional callback fired when an item is successfully picked up. */
  onPickup?: () => void;

  constructor(player: Player, maxSlots: number = INITIAL_SLOTS) {
    this.player = player;
    this.maxSlots = maxSlots;
    this.slots = new Array(maxSlots).fill(null);
    this.combatTimer = REGEN_DELAY; // start eligible for regen
  }

  get inventory(): (InventorySlot | null)[] { return this.slots; }
  get usedSlots(): number { return this.slots.filter(s => s !== null).length; }
  get freeSlots(): number { return this.maxSlots - this.usedSlots; }
  get totalSlots(): number { return this.maxSlots; }

  /**
   * Attempt to pick up an item. Returns true if the item was consumed.
   */
  tryPickup(item: Item): boolean {
    if (!item.active) return false;

    // Distance check
    const distSq = this.player.distanceSqTo(item);
    if (distSq > PICKUP_RADIUS * PICKUP_RADIUS) return false;

    const category = item.config.category;

    if (category === 'ammo') {
      const weaponId = this.getWeaponIdForAmmo(item.itemTypeId);
      if (weaponId) {
        const amount = 10;
        this.player.addAmmo(weaponId, amount);
      }
      item.active = false;
      this.onPickup?.();
      return true;
    }

    if (category === 'weapon') {
      const weaponId = item.config.weaponId as WeaponId;
      this.player.switchWeapon(weaponId);
      item.active = false;
      this.onPickup?.();
      return true;
    }

    if (category === 'medicine' || category === 'valuable') {
      const freeIndex = this.slots.findIndex(s => s === null);
      if (freeIndex === -1) return false; // inventory full
      this.slots[freeIndex] = { itemTypeId: item.itemTypeId, config: item.config };
      item.active = false;
      this.onPickup?.();
      return true;
    }

    return false;
  }

  /**
   * Use the item in the given slot index. Returns true on success.
   */
  useItem(slotIndex: number): boolean {
    const slot = this.slots[slotIndex];
    if (!slot) return false;

    if (slot.config.category === 'medicine') {
      const healAmount = (slot.config as any).healAmount as number;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
      this.slots[slotIndex] = null;
      this.combatTimer = 0;
      return true;
    }

    if (slot.config.category === 'weapon') {
      const weaponId = (slot.config as any).weaponId as WeaponId;
      this.player.switchWeapon(weaponId);
      this.slots[slotIndex] = null;
      return true;
    }

    return false;
  }

  /**
   * Per-frame update: auto-pickup nearby items, tick combat timer,
   * and apply health regeneration when out of combat long enough.
   */
  update(dt: number, items: Item[]): void {
    // 1. Auto-pickup
    for (const item of items) {
      if (item.active) {
        this.tryPickup(item);
      }
    }

    // 2. Tick combat timer
    this.tickCombatTimer(dt);

    // 3. Health regen when out of combat
    if (this.combatTimer >= REGEN_DELAY) {
      if (this.player.hp < this.player.maxHp) {
        this.player.hp = Math.min(
          this.player.maxHp,
          this.player.hp + this.player.maxHp * REGEN_RATE * dt
        );
      }
    }
  }

  /**
   * Reset the combat timer — call when the player takes damage or shoots.
   */
  resetCombatTimer(): void {
    this.combatTimer = 0;
  }

  /**
   * Advance the combat timer by dt seconds.
   */
  tickCombatTimer(dt: number): void {
    this.combatTimer += dt;
  }

  /**
   * Calculate the total value of all valuable items in the inventory.
   */
  getInventoryValue(): number {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.config.category === 'valuable') {
        total += (slot.config as any).value as number;
      }
    }
    return total;
  }

  private getWeaponIdForAmmo(itemTypeId: ItemTypeId): WeaponId | null {
    const map: Record<string, WeaponId> = {
      ammoPistol: 'pistol',
      ammoRifle: 'rifle',
      ammoShotgun: 'shotgun',
    };
    return map[itemTypeId] ?? null;
  }
}
