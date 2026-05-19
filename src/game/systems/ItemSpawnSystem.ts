import { getItemsByRarity, rollRarity, type ItemTypeId } from '../../data';

export interface ItemSpawnResult {
  itemTypeId: ItemTypeId;
  tileX: number;
  tileY: number;
}

/**
 * Item spawn system — generates loot at the start of each run.
 * Each spawn point rolls a rarity and picks a matching item type.
 */
export class ItemSpawnSystem {
  private spawnPoints: { x: number; y: number }[];

  constructor(spawnPoints: { x: number; y: number }[]) {
    this.spawnPoints = spawnPoints;
  }

  /**
   * Called once at the beginning of a run.
   * Returns a list of item spawn results, one per spawn point.
   */
  generate(): ItemSpawnResult[] {
    const results: ItemSpawnResult[] = [];

    for (const point of this.spawnPoints) {
      const rarity = rollRarity();
      const items = getItemsByRarity(rarity);
      if (items.length === 0) continue;
      const itemTypeId = items[Math.floor(Math.random() * items.length)];
      results.push({ itemTypeId, tileX: point.x, tileY: point.y });
    }

    return results;
  }
}
