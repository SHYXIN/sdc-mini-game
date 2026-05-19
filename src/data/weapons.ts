export const WEAPONS = {
  pistol: {
    id: 'pistol',
    name: '手枪',
    damage: 10,
    fireRate: 4, // rounds per second
    ammoCapacity: Infinity,
    reloadTime: 0,
    bulletSpeed: 300,
    spread: 0,
  },
  rifle: {
    id: 'rifle',
    name: '步枪',
    damage: 18,
    fireRate: 8,
    ammoCapacity: 30,
    reloadTime: 2.0,
    bulletSpeed: 450,
    spread: 0.05,
  },
  shotgun: {
    id: 'shotgun',
    name: '霰弹枪',
    damage: 8, // per pellet
    fireRate: 1.5,
    ammoCapacity: 8,
    reloadTime: 3.0,
    bulletSpeed: 350,
    spread: 0.15,
    pellets: 5,
  },
} as const;

export type WeaponId = keyof typeof WEAPONS;
export type WeaponConfig = (typeof WEAPONS)[WeaponId];
