export const ITEM_TYPES = {
  // Ammo
  ammoPistol: { id: 'ammoPistol', name: '手枪弹药', category: 'ammo', rarity: 'white' as const },
  ammoRifle: { id: 'ammoRifle', name: '步枪弹药', category: 'ammo', rarity: 'green' as const },
  ammoShotgun: { id: 'ammoShotgun', name: '霰弹枪弹药', category: 'ammo', rarity: 'green' as const },
  // Medicine
  medkitSmall: { id: 'medkitSmall', name: '小医疗包', category: 'medicine', rarity: 'white' as const, healAmount: 20 },
  medkitLarge: { id: 'medkitLarge', name: '大医疗包', category: 'medicine', rarity: 'blue' as const, healAmount: 50 },
  // Weapons
  weaponRifle: { id: 'weaponRifle', name: '步枪', category: 'weapon', rarity: 'green' as const, weaponId: 'rifle' as const },
  weaponShotgun: { id: 'weaponShotgun', name: '霰弹枪', category: 'weapon', rarity: 'blue' as const, weaponId: 'shotgun' as const },
  // Valuables
  gold: { id: 'gold', name: '金币', category: 'valuable', rarity: 'white' as const, value: 10 },
  jewelry: { id: 'jewelry', name: '珠宝', category: 'valuable', rarity: 'blue' as const, value: 50 },
  artifact: { id: 'artifact', name: '古董', category: 'valuable', rarity: 'purple' as const, value: 100 },
} as const;

export type ItemTypeId = keyof typeof ITEM_TYPES;
export type ItemTypeConfig = (typeof ITEM_TYPES)[ItemTypeId];

export type Rarity = 'white' | 'green' | 'blue' | 'purple';

export const DROP_WEIGHTS: Record<Rarity, number> = {
  white: 60,
  green: 25,
  blue: 12,
  purple: 3,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  white: '#aaaaaa',
  green: '#44cc44',
  blue: '#4488ff',
  purple: '#cc44ff',
};

/**
 * Pick a random rarity based on drop weights.
 */
export function rollRarity(): Rarity {
  const total = Object.values(DROP_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(DROP_WEIGHTS) as [Rarity, number][]) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return 'white';
}

/**
 * Get all item types of a given rarity.
 */
export function getItemsByRarity(rarity: Rarity): ItemTypeId[] {
  return Object.entries(ITEM_TYPES)
    .filter(([, config]) => config.rarity === rarity)
    .map(([id]) => id as ItemTypeId);
}
