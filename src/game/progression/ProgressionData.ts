const STORAGE_KEY = 'sdc_progression';

export interface ProgressionData {
  gold: number;
  unlockedWeapons: string[];
  attributeLevels: {
    maxHp: number;
    speed: number;
    inventorySlots: number;
    reloadSpeed: number;
  };
  totalExtractions: number;
  totalDeaths: number;
}

export const DEFAULT_DATA: ProgressionData = {
  gold: 0,
  unlockedWeapons: ['pistol'],
  attributeLevels: {
    maxHp: 0,
    speed: 0,
    inventorySlots: 0,
    reloadSpeed: 0,
  },
  totalExtractions: 0,
  totalDeaths: 0,
};

export function loadProgression(): ProgressionData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA, attributeLevels: { ...DEFAULT_DATA.attributeLevels } };
    const data = JSON.parse(raw) as Partial<ProgressionData>;
    return {
      ...DEFAULT_DATA,
      ...data,
      attributeLevels: {
        ...DEFAULT_DATA.attributeLevels,
        ...(data.attributeLevels ?? {}),
      },
      unlockedWeapons: data.unlockedWeapons ?? [...DEFAULT_DATA.unlockedWeapons],
    };
  } catch {
    return { ...DEFAULT_DATA, attributeLevels: { ...DEFAULT_DATA.attributeLevels } };
  }
}

export function saveProgression(data: ProgressionData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function getUpgradeCost(
  attribute: keyof ProgressionData['attributeLevels'],
  currentLevel: number
): number {
  const baseCosts: Record<string, number> = {
    maxHp: 50,
    speed: 40,
    inventorySlots: 80,
    reloadSpeed: 60,
  };
  return (baseCosts[attribute] || 50) * (currentLevel + 1);
}

export function getAttributeMax(
  attribute: keyof ProgressionData['attributeLevels']
): number {
  const maxLevels: Record<string, number> = {
    maxHp: 5,
    speed: 5,
    inventorySlots: 3,
    reloadSpeed: 5,
  };
  return maxLevels[attribute] || 5;
}

export function getWeaponUnlockCost(weaponId: string): number {
  const costs: Record<string, number> = {
    pistol: 0,
    rifle: 100,
    shotgun: 200,
  };
  return costs[weaponId] || 999;
}
