import { GameLoop, Canvas, KeyboardInput, LayerRenderer, LayerName } from './core';
import { Vector2 } from './utils/Vector2';

const canvas = new Canvas(document.getElementById('game') as HTMLCanvasElement);
const ctx = canvas.getContext();
const input = new KeyboardInput(canvas as unknown as HTMLCanvasElement);
const layers = new LayerRenderer();

const playerPos = new Vector2(canvas.width / 2, canvas.height / 2);
const PLAYER_SPEED = 120;
const PLAYER_RADIUS = 12;

let shootCooldown = 0;

const loop = new GameLoop({
  update: (dt: number) => {
    input.setPlayerPosition(playerPos);
    input.update();

    playerPos.x += input.moveDirection.x * PLAYER_SPEED * dt;
    playerPos.y += input.moveDirection.y * PLAYER_SPEED * dt;

    playerPos.x = Math.max(PLAYER_RADIUS, Math.min(canvas.width - PLAYER_RADIUS, playerPos.x));
    playerPos.y = Math.max(PLAYER_RADIUS, Math.min(canvas.height - PLAYER_RADIUS, playerPos.y));

    shootCooldown = Math.max(0, shootCooldown - dt);

    // submit player to render layer
    layers.submit({
      layer: LayerName.Entities,
      y: playerPos.y,
      draw: (c: CanvasRenderingContext2D) => {
        c.fillStyle = '#00ff88';
        c.beginPath();
        c.arc(playerPos.x, playerPos.y, PLAYER_RADIUS, 0, Math.PI * 2);
        c.fill();

        // aim line
        const aimEnd = playerPos.add(input.aimDirection.scale(24));
        c.strokeStyle = '#00ff8855';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(playerPos.x, playerPos.y);
        c.lineTo(aimEnd.x, aimEnd.y);
        c.stroke();
      },
    });
  },
  render: () => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    layers.flush(ctx);

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('WASD 移动 | 鼠标 瞄准', 10, 20);
  },
});

loop.start();
