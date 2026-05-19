import type { GameState } from '../StateStack';
import {
  loadProgression,
  saveProgression,
  getUpgradeCost,
  getAttributeMax,
  getWeaponUnlockCost,
  type ProgressionData,
} from '../progression/ProgressionData';

interface Button {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  action: () => void;
}

/**
 * Armory state — view/unlock weapons, upgrade attributes.
 * Uses canvas coordinate hit-testing for mouse interaction.
 */
export class ArmoryState implements GameState {
  private progression: ProgressionData;
  private readonly onBack: () => void;
  private hoveredBtn: number = -1;

  private readonly buttons: Button[] = [];
  private readonly backBtn = { x: 0, y: 0, w: 160, h: 40, label: '返回' };

  // Layout constants
  private readonly cw: number;
  private readonly ch: number;

  constructor(onBack: () => void, canvasWidth = 480, canvasHeight = 640) {
    this.onBack = onBack;
    this.cw = canvasWidth;
    this.ch = canvasHeight;
    this.progression = loadProgression();

    // Back button position (bottom center)
    this.backBtn.x = (canvasWidth - this.backBtn.w) / 2;
    this.backBtn.y = canvasHeight - 60;
  }

  onEnter(): void {
    this.progression = loadProgression();
    window.addEventListener('click', this.handleClick);
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  onExit(): void {
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  update(_dt: number): void {
    // Rebuild buttons each frame to reflect current state
    this.rebuildButtons();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const cw = this.cw;
    const ch = this.ch;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, cw, ch);

    // Title
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('军械库', cw / 2, 20);

    // Gold display
    ctx.fillStyle = '#ffcc00';
    ctx.font = '16px monospace';
    ctx.fillText(`金币: ${this.progression.gold}`, cw / 2, 55);

    // Stats line
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '12px monospace';
    ctx.fillText(
      `撤离: ${this.progression.totalExtractions} 次  |  死亡: ${this.progression.totalDeaths} 次`,
      cw / 2,
      78
    );

    // --- Weapons section ---
    const weaponY = 110;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('武器解锁', 30, weaponY);

    const weapons = [
      { id: 'rifle', name: '步枪' },
      { id: 'shotgun', name: '霰弹枪' },
    ];

    let wy = weaponY + 28;
    for (const w of weapons) {
      const unlocked = this.progression.unlockedWeapons.includes(w.id);
      const cost = getWeaponUnlockCost(w.id);

      ctx.fillStyle = '#c0c0c0';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(w.name, 40, wy);

      if (unlocked) {
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'right';
        ctx.fillText('已解锁', cw - 40, wy);
      } else {
        ctx.fillStyle = this.progression.gold >= cost ? '#ffcc00' : '#666';
        ctx.textAlign = 'right';
        ctx.fillText(`${cost} 金`, cw - 40, wy);
      }
      wy += 26;
    }

    // --- Attributes section ---
    const attrY = wy + 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('属性升级', 30, attrY);

    const attrKeys: (keyof ProgressionData['attributeLevels'])[] = [
      'maxHp',
      'speed',
      'inventorySlots',
      'reloadSpeed',
    ];
    const attrNames: Record<string, string> = {
      maxHp: '生命上限',
      speed: '移动速度',
      inventorySlots: '背包容量',
      reloadSpeed: '换弹速度',
    };

    let ay = attrY + 28;
    for (const key of attrKeys) {
      const level = this.progression.attributeLevels[key];
      const max = getAttributeMax(key);
      const cost = getUpgradeCost(key, level);
      const maxed = level >= max;

      // Attribute name and level
      ctx.fillStyle = '#c0c0c0';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${attrNames[key]}`, 40, ay);

      ctx.fillStyle = '#a0a0b0';
      ctx.fillText(`Lv.${level}/${max}`, 160, ay);

      // Cost or maxed
      ctx.textAlign = 'right';
      if (maxed) {
        ctx.fillStyle = '#00ff88';
        ctx.fillText('已满级', cw - 40, ay);
      } else {
        ctx.fillStyle = this.progression.gold >= cost ? '#ffcc00' : '#666';
        ctx.fillText(`${cost} 金`, cw - 40, ay);
      }

      ay += 26;
    }

    // --- Back button ---
    const bx = this.backBtn.x;
    const by = this.backBtn.y;
    const bw = this.backBtn.w;
    const bh = this.backBtn.h;

    ctx.fillStyle = this.hoveredBtn === this.buttons.length ? '#ffffff' : '#e0e0e0';
    ctx.fillRect(bx, by, bw, bh);

    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.backBtn.label, bx + bw / 2, by + bh / 2);
  }

  private rebuildButtons(): void {
    this.buttons.length = 0;

    const cw = this.cw;
    const ch = this.ch;

    // Weapon unlock buttons
    const weaponY = 110;
    const weapons = [
      { id: 'rifle', name: '步枪' },
      { id: 'shotgun', name: '霰弹枪' },
    ];

    let wy = weaponY + 28;
    for (const w of weapons) {
      const unlocked = this.progression.unlockedWeapons.includes(w.id);
      if (!unlocked) {
        const cost = getWeaponUnlockCost(w.id);
        this.buttons.push({
          x: cw - 100,
          y: wy - 14,
          w: 60,
          h: 22,
          label: '',
          action: () => this.tryUnlockWeapon(w.id, cost),
        });
      }
      wy += 26;
    }

    // Attribute upgrade buttons
    const attrY = wy + 20;
    const attrKeys: (keyof ProgressionData['attributeLevels'])[] = [
      'maxHp',
      'speed',
      'inventorySlots',
      'reloadSpeed',
    ];

    let ay = attrY + 28;
    for (const key of attrKeys) {
      const level = this.progression.attributeLevels[key];
      const max = getAttributeMax(key);
      if (level < max) {
        const cost = getUpgradeCost(key, level);
        this.buttons.push({
          x: cw - 100,
          y: ay - 14,
          w: 60,
          h: 22,
          label: '',
          action: () => this.tryUpgradeAttribute(key, cost),
        });
      }
      ay += 26;
    }

    // Back button is last
    this.buttons.push({
      x: this.backBtn.x,
      y: this.backBtn.y,
      w: this.backBtn.w,
      h: this.backBtn.h,
      label: this.backBtn.label,
      action: () => this.onBack(),
    });
  }

  private tryUnlockWeapon(weaponId: string, cost: number): void {
    if (this.progression.gold < cost) return;
    if (this.progression.unlockedWeapons.includes(weaponId)) return;
    this.progression.gold -= cost;
    this.progression.unlockedWeapons.push(weaponId);
    saveProgression(this.progression);
  }

  private tryUpgradeAttribute(
    attribute: keyof ProgressionData['attributeLevels'],
    cost: number
  ): void {
    if (this.progression.gold < cost) return;
    const current = this.progression.attributeLevels[attribute];
    if (current >= getAttributeMax(attribute)) return;
    this.progression.gold -= cost;
    this.progression.attributeLevels[attribute] = current + 1;
    saveProgression(this.progression);
  }

  private inRect(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean {
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const canvas = e.target as HTMLCanvasElement | null;
    if (!canvas || canvas.tagName !== 'CANVAS') {
      this.hoveredBtn = -1;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.hoveredBtn = -1;
    for (let i = 0; i < this.buttons.length; i++) {
      const b = this.buttons[i];
      if (this.inRect(x, y, b.x, b.y, b.w, b.h)) {
        this.hoveredBtn = i;
        break;
      }
    }
  };

  private handleClick = (e: MouseEvent): void => {
    const canvas = e.target as HTMLCanvasElement | null;
    if (!canvas || canvas.tagName !== 'CANVAS') return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const btn of this.buttons) {
      if (this.inRect(x, y, btn.x, btn.y, btn.w, btn.h)) {
        btn.action();
        return;
      }
    }
  };
}
