export const TILE = {
  FLOOR: 0,
  WALL: 1,
} as const;

export type TileType = (typeof TILE)[keyof typeof TILE];

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface MapData {
  id: string;
  name: string;
  width: number;  // in tiles
  height: number; // in tiles
  tileSize: number; // in pixels
  layout: TileType[][];
  itemSpawnPoints: SpawnPoint[];
  extractCandidates: SpawnPoint[];
  playerSpawn: SpawnPoint;
}

/**
 * Warehouse map — 15x20 tiles, medium openness with crate cover.
 * 0 = floor, 1 = wall
 */
export const WAREHOUSE: MapData = {
  id: 'warehouse',
  name: '仓库',
  width: 15,
  height: 20,
  tileSize: 32,
  layout: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,0,0,0,1,1,0,0,1],
    [1,0,0,1,1,0,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,1,0,1,1,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  itemSpawnPoints: [
    { x: 2, y: 2 },
    { x: 12, y: 2 },
    { x: 7, y: 7 },
    { x: 2, y: 10 },
    { x: 12, y: 10 },
    { x: 7, y: 13 },
    { x: 3, y: 17 },
    { x: 11, y: 17 },
    { x: 7, y: 18 },
    { x: 5, y: 5 },
    { x: 9, y: 5 },
    { x: 7, y: 10 },
  ],
  extractCandidates: [
    { x: 1, y: 10 },
    { x: 13, y: 10 },
    { x: 7, y: 1 },
  ],
  playerSpawn: { x: 7, y: 18 },
};

export const MAPS = {
  warehouse: WAREHOUSE,
} as const;

export type MapId = keyof typeof MAPS;
