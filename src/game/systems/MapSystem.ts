import type { Drawable } from '../../core/Layer';
import { LayerName } from '../../core/Layer';
import { MAPS, TILE, type MapData, type TileType } from '../../data';

export class MapSystem {
  private mapData: MapData;

  constructor(mapId: string) {
    this.mapData = MAPS[mapId as keyof typeof MAPS];
  }

  get data(): MapData {
    return this.mapData;
  }

  get pixelWidth(): number {
    return this.mapData.width * this.mapData.tileSize;
  }

  get pixelHeight(): number {
    return this.mapData.height * this.mapData.tileSize;
  }

  /** Convert tile coordinates to pixel coordinates (center of tile). */
  tileToPixel(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: (tileX + 0.5) * this.mapData.tileSize,
      y: (tileY + 0.5) * this.mapData.tileSize,
    };
  }

  /** Convert pixel coordinates to tile coordinates. */
  pixelToTile(px: number, py: number): { x: number; y: number } {
    return {
      x: Math.floor(px / this.mapData.tileSize),
      y: Math.floor(py / this.mapData.tileSize),
    };
  }

  /** Check whether a tile is a wall. Out-of-bounds is treated as wall. */
  isWall(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.mapData.width || tileY < 0 || tileY >= this.mapData.height) {
      return true;
    }
    return this.mapData.layout[tileY][tileX] === TILE.WALL;
  }

  /**
   * Check whether a circle at the given pixel position is passable.
   * Used for entity movement collision.
   */
  isPassable(px: number, py: number, radius: number): boolean {
    const ts = this.mapData.tileSize;
    const minTileX = Math.floor((px - radius) / ts);
    const maxTileX = Math.floor((px + radius) / ts);
    const minTileY = Math.floor((py - radius) / ts);
    const maxTileY = Math.floor((py + radius) / ts);

    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        if (this.isWall(tx, ty)) return false;
      }
    }
    return true;
  }

  /** Return a Drawable that renders the full map on the Background layer. */
  getDrawable(): Drawable {
    const mapData = this.mapData;
    const ts = mapData.tileSize;

    return {
      layer: LayerName.Background,
      y: 0,
      draw: (ctx: CanvasRenderingContext2D) => {
        for (let y = 0; y < mapData.height; y++) {
          for (let x = 0; x < mapData.width; x++) {
            const px = x * ts;
            const py = y * ts;

            if (mapData.layout[y][x] === TILE.WALL) {
              // Wall tile — dark fill with pixel-style border
              ctx.fillStyle = '#3a3a4e';
              ctx.fillRect(px, py, ts, ts);
              ctx.strokeStyle = '#2a2a3e';
              ctx.lineWidth = 1;
              ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);
            } else {
              // Floor tile — subtle grid lines
              ctx.fillStyle = '#1e1e2e';
              ctx.fillRect(px, py, ts, ts);
              ctx.strokeStyle = '#252535';
              ctx.lineWidth = 1;
              ctx.strokeRect(px, py, ts, ts);
            }
          }
        }
      },
    };
  }
}
