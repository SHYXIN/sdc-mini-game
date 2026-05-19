import { describe, it, expect } from 'vitest';
import { Vector2 } from './Vector2';

describe('Vector2', () => {
  describe('add', () => {
    it('returns a new vector that is the sum of two vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      const result = a.add(b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('does not mutate the original vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      a.add(b);
      expect(a.x).toBe(1);
      expect(a.y).toBe(2);
    });
  });

  describe('sub', () => {
    it('returns a new vector that is the difference of two vectors', () => {
      const a = new Vector2(5, 7);
      const b = new Vector2(2, 3);
      const result = a.sub(b);
      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
    });
  });

  describe('scale', () => {
    it('returns a new vector multiplied by a scalar', () => {
      const v = new Vector2(3, 4);
      const result = v.scale(2);
      expect(result.x).toBe(6);
      expect(result.y).toBe(8);
    });
  });

  describe('lengthSq', () => {
    it('returns x squared plus y squared', () => {
      const v = new Vector2(3, 4);
      expect(v.lengthSq()).toBe(25);
    });
  });

  describe('length', () => {
    it('returns the square root of x squared plus y squared', () => {
      const v = new Vector2(3, 4);
      expect(v.length()).toBe(5);
    });
  });

  describe('normalize', () => {
    it('returns a unit vector in the same direction', () => {
      const v = new Vector2(3, 4);
      const n = v.normalize();
      expect(n.length()).toBeCloseTo(1, 10);
      expect(n.x).toBeCloseTo(0.6, 10);
      expect(n.y).toBeCloseTo(0.8, 10);
    });

    it('returns (0, 0) for a zero vector', () => {
      const v = new Vector2(0, 0);
      const n = v.normalize();
      expect(n.x).toBe(0);
      expect(n.y).toBe(0);
    });
  });

  describe('distanceSqTo', () => {
    it('returns the squared distance between two vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(4, 6);
      expect(a.distanceSqTo(b)).toBe(25);
    });
  });

  describe('zero', () => {
    it('returns a vector with components (0, 0)', () => {
      const z = Vector2.zero();
      expect(z.x).toBe(0);
      expect(z.y).toBe(0);
    });
  });
});
