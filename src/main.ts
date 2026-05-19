import { GameLoop } from './core/GameLoop';
import { Canvas } from './core/Canvas';

const canvas = new Canvas(document.getElementById('game') as HTMLCanvasElement);
const ctx = canvas.getContext();

const loop = new GameLoop({
  update: (dt: number) => {
    // game logic placeholder
  },
  render: () => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('搜打撤 — Loading...', canvas.width / 2, canvas.height / 2);
  },
});

loop.start();
