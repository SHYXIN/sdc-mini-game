export class Canvas {
  public width: number;
  public height: number;
  private ctx: CanvasRenderingContext2D;

  constructor(element: HTMLCanvasElement) {
    this.width = element.width;
    this.height = element.height;
    const ctx = element.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}
