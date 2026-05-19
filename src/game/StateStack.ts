export interface GameState {
  onEnter?(): void;
  onExit?(): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export class StateStack {
  private states: GameState[] = [];

  push(state: GameState): void {
    state.onEnter?.();
    this.states.push(state);
  }

  pop(): void {
    if (this.states.length === 0) return;
    const top = this.states.pop()!;
    top.onExit?.();
  }

  replace(state: GameState): void {
    if (this.states.length > 0) {
      const top = this.states.pop()!;
      top.onExit?.();
    }
    state.onEnter?.();
    this.states.push(state);
  }

  update(dt: number): void {
    if (this.states.length === 0) return;
    this.states[this.states.length - 1].update(dt);
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const state of this.states) {
      state.render(ctx);
    }
  }
}
