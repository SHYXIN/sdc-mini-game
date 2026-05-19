export const ENEMIES = {
  grunt: {
    id: 'grunt',
    name: '普通小兵',
    hp: 30,
    speed: 60,
    attackDamage: 8,
    attackRange: 30,
    attackInterval: 1.5,
    detectionRadius: 150,
    color: '#cc4444',
    radius: 10,
  },
  heavy: {
    id: 'heavy',
    name: '重装兵',
    hp: 80,
    speed: 30,
    attackDamage: 15,
    attackRange: 35,
    attackInterval: 2.5,
    detectionRadius: 120,
    color: '#884422',
    radius: 14,
  },
  shooter: {
    id: 'shooter',
    name: '远程射手',
    hp: 20,
    speed: 40,
    attackDamage: 6,
    attackRange: 180,
    attackInterval: 2.0,
    detectionRadius: 200,
    color: '#44cc44',
    radius: 9,
  },
} as const;

export type EnemyId = keyof typeof ENEMIES;
export type EnemyConfig = (typeof ENEMIES)[EnemyId];
