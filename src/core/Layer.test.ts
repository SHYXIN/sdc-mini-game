import { describe, it, expect, vi } from 'vitest';
import { LayerRenderer, LayerName, Drawable } from './Layer';

function createMockDrawable(layer: LayerName, y: number): Drawable {
  return { layer, y, draw: vi.fn() };
}

describe('LayerRenderer', () => {
  it('draws layers in order from Background to HUD', () => {
    const renderer = new LayerRenderer();
    const ctx = {} as CanvasRenderingContext2D;

    const background = createMockDrawable(LayerName.Background, 0);
    const hud = createMockDrawable(LayerName.HUD, 0);
    const entities = createMockDrawable(LayerName.Entities, 0);
    const items = createMockDrawable(LayerName.Items, 0);
    const projectiles = createMockDrawable(LayerName.Projectiles, 0);

    // Submit in reverse order
    renderer.submit(hud);
    renderer.submit(entities);
    renderer.submit(items);
    renderer.submit(projectiles);
    renderer.submit(background);

    renderer.flush(ctx);

    const callOrder = [
      background.draw.mock.invocationCallOrder[0],
      items.draw.mock.invocationCallOrder[0],
      entities.draw.mock.invocationCallOrder[0],
      projectiles.draw.mock.invocationCallOrder[0],
      hud.draw.mock.invocationCallOrder[0],
    ];

    expect(callOrder).toEqual([...callOrder].sort((a, b) => a - b));
  });

  it('sorts drawables within the same layer by Y coordinate ascending', () => {
    const renderer = new LayerRenderer();
    const ctx = {} as CanvasRenderingContext2D;

    const top = createMockDrawable(LayerName.Entities, 100);
    const middle = createMockDrawable(LayerName.Entities, 50);
    const bottom = createMockDrawable(LayerName.Entities, 10);

    // Submit in reverse Y order
    renderer.submit(top);
    renderer.submit(bottom);
    renderer.submit(middle);

    renderer.flush(ctx);

    expect(bottom.draw.mock.invocationCallOrder[0])
      .toBeLessThan(middle.draw.mock.invocationCallOrder[0]);
    expect(middle.draw.mock.invocationCallOrder[0])
      .toBeLessThan(top.draw.mock.invocationCallOrder[0]);
  });

  it('clears the draw queue after flush', () => {
    const renderer = new LayerRenderer();
    const ctx = {} as CanvasRenderingContext2D;

    const drawable = createMockDrawable(LayerName.Entities, 0);
    renderer.submit(drawable);

    // First flush should call draw
    renderer.flush(ctx);
    expect(drawable.draw).toHaveBeenCalledTimes(1);

    // Second flush should not call draw again (queue was cleared)
    renderer.flush(ctx);
    expect(drawable.draw).toHaveBeenCalledTimes(1);
  });
});
