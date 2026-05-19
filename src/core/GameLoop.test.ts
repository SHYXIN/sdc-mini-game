import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from './GameLoop';

// Mock requestAnimationFrame for Node test environment
beforeEach(() => {
  vi.useFakeTimers();
  let rafId = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
    return setTimeout(() => cb(performance.now()), 16) as unknown as number;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    clearTimeout(id);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('GameLoop', () => {
  it('calls update at fixed intervals after start', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ update, render });

    loop.start();

    // Advance enough time for at least one frame + fixed step
    vi.advanceTimersByTime(33);

    expect(update).toHaveBeenCalled();
    // update must be called with the fixed dt (1/60)
    expect(update).toHaveBeenCalledWith(1 / 60);
  });

  it('stops calling update after stop is called', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ update, render });

    loop.start();

    // Run a few frames
    vi.advanceTimersByTime(100);
    const callCountAfterStart = update.mock.calls.length;
    expect(callCountAfterStart).toBeGreaterThan(0);

    loop.stop();

    // Advance more time and verify no further calls
    vi.advanceTimersByTime(200);
    const callCountAfterStop = update.mock.calls.length;
    expect(callCountAfterStop).toBe(callCountAfterStart);
  });
});
