const FIXED_DT = 1 / 60; // 60 FPS logic update
const MAX_ACCUMULATED = 0.25; // prevent spiral of death

interface GameLoopOptions {
  update: (dt: number) => void;
  render: () => void;
}

export class GameLoop {
  private update: (dt: number) => void;
  private render: () => void;
  private running = false;
  private accumulated = 0;
  private lastTime = 0;

  constructor(options: GameLoopOptions) {
    this.update = options.update;
    this.render = options.render;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
  }

  private tick = (time: number): void => {
    if (!this.running) return;

    const frameTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.accumulated += Math.min(frameTime, MAX_ACCUMULATED);

    while (this.accumulated >= FIXED_DT) {
      this.update(FIXED_DT);
      this.accumulated -= FIXED_DT;
    }

    this.render();

    requestAnimationFrame(this.tick);
  };
}
