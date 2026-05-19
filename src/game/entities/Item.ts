import { Vector2 } from '../../utils/Vector2';
import { LayerName } from '../../core/Layer';
import { Entity } from './Entity';
import { ItemTypeId, ItemTypeConfig, ITEM_TYPES, RARITY_COLORS } from '../../data/items';

/**
 * Item entity — lootable pickup dropped on the map.
 * Renders as a small colored square based on rarity.
 */
export class Item extends Entity {
  layer = LayerName.Items as const;
  radius = 8;

  itemTypeId: ItemTypeId;
  config: ItemTypeConfig;

  constructor(itemTypeId: ItemTypeId, tileX: number, tileY: number, tileSize: number) {
    super();
    this.itemTypeId = itemTypeId;
    this.config = ITEM_TYPES[itemTypeId];
    this.position = new Vector2(
      (tileX + 0.5) * tileSize,
      (tileY + 0.5) * tileSize
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const color = RARITY_COLORS[this.config.rarity];
    ctx.fillStyle = color;
    // Draw a 6x6px square centered on position
    ctx.fillRect(
      this.position.x - 3,
      this.position.y - 3,
      6,
      6
    );
  }
}
