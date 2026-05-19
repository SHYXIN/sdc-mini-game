import { Canvas } from './Canvas';

export enum LayerName {
  Background = 0,
  Items = 1,
  Entities = 2,
  Projectiles = 3,
  HUD = 4,
}

export interface Drawable {
  layer: LayerName;
  y: number;
  draw(ctx: CanvasRenderingContext2D): void;
}

export class LayerRenderer {
  private layers: Map<LayerName, Drawable[]> = new Map();

  constructor() {
    for (const name of Object.values(LayerName).filter(v => typeof v === 'number')) {
      this.layers.set(name as LayerName, []);
    }
  }

  submit(drawable: Drawable): void {
    this.layers.get(drawable.layer)?.push(drawable);
  }

  flush(ctx: CanvasRenderingContext2D): void {
    for (const [, drawables] of this.layers) {
      drawables.sort((a, b) => a.y - b.y);
      for (const d of drawables) {
        d.draw(ctx);
      }
      drawables.length = 0;
    }
  }
}
