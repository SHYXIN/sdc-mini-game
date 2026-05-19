import { GameLoop, Canvas, KeyboardInput } from './core';
import { StateStack } from './game/StateStack';
import { MainMenuState, PlayingState } from './game/states';

const canvas = new Canvas(document.getElementById('game') as HTMLCanvasElement);
const ctx = canvas.getContext();
const input = new KeyboardInput(canvas as unknown as HTMLCanvasElement);
const stack = new StateStack();

stack.push(new MainMenuState(() => {
  stack.replace(new PlayingState(canvas, input));
}));

const loop = new GameLoop({
  update: (dt) => stack.update(dt),
  render: () => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stack.render(ctx);
  },
});

loop.start();
