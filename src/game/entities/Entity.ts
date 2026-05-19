import { Vector2 } from '../../utils/Vector2';
import { Drawable } from '../../core/Layer';
import { LayerName } from '../../core/Layer';

/**
 * Abstract base class for all game entities.
 * Implements the Drawable interface for layer-sorted rendering.
 */
export abstract class Entity implements Drawable {
  position: Vector2;
  radius: number;
  active: boolean = true;
  abstract layer: LayerName;

  get y(): number {
    return this.position.y;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;

  distanceSqTo(other: Entity): number {
    return this.position.distanceSqTo(other.position);
  }

  collidesWith(other: Entity): boolean {
    const distSq = this.distanceSqTo(other);
    const radiusSum = this.radius + other.radius;
    return distSq < radiusSum * radiusSum;
  }
}
