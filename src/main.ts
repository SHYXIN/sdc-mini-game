import { GameLoop, Canvas, KeyboardInput } from './core';
import { StateStack } from './game/StateStack';
import { MainMenuState, PlayingState, ResultState, ArmoryState } from './game/states';
import { AudioSystem } from './game/audio';
import { loadProgression } from './game/progression/ProgressionData';

const canvas = new Canvas(document.getElementById('game') as HTMLCanvasElement);
const ctx = canvas.getContext();
const input = new KeyboardInput(canvas as unknown as HTMLCanvasElement);
const stack = new StateStack();

// --- Audio system (lazy-init on first user gesture) ---
const audio = new AudioSystem();

function bindAudioUnlock(el: HTMLElement | Window, events: string[]): void {
  const handler = () => {
    audio.unlock();
    for (const e of events) {
      el.removeEventListener(e, handler);
    }
  };
  for (const e of events) {
    el.addEventListener(e, handler);
  }
}

bindAudioUnlock(canvas as unknown as HTMLElement, ['click', 'touchstart']);
bindAudioUnlock(window, ['keydown']);

// Helper: create a PlayingState with progression bonuses and audio wired in
function createPlayingState(
  onGameEnd: (success: boolean, goldEarned: number) => void,
): PlayingState {
  const progression = loadProgression();
  return new PlayingState(canvas, input, onGameEnd, audio, progression);
}

// Helper: create a MainMenuState with armory support
function createMainMenuState(): MainMenuState {
  return new MainMenuState(
    () => {
      stack.replace(createPlayingState((success, goldEarned) => {
        stack.replace(new ResultState(success, goldEarned, () => {
          stack.replace(createMainMenuState());
        }));
      }));
    },
    () => {
      stack.push(new ArmoryState(() => {
        stack.pop();
      }));
    }
  );
}

stack.push(createMainMenuState());

const loop = new GameLoop({
  update: (dt) => stack.update(dt),
  render: () => {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stack.render(ctx);
  },
});

loop.start();
