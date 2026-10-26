export const CELL_COUNT = 25;
export const FREE_INDEX = 12;

// 縦（B I N G O の列）・横・斜めの 12 ライン。インデックスは row * 5 + col
export const LINES: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export type CardState = {
  numbers: number[];
  opened: boolean[];
};

export type LineStatus = {
  complete: boolean;
  // 残り 1 マスのときだけそのマスのインデックス（リーチ）
  reachCell: number | null;
};

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// 列ごとに 1〜15 / 16〜30 / 31〜45 / 46〜60 / 61〜75 から 5 つ選ぶ（真ん中は FREE）
export function createCard(): CardState {
  const numbers = new Array<number>(CELL_COUNT).fill(0);
  for (let col = 0; col < 5; col++) {
    const pool = Array.from({ length: 15 }, (_, i) => col * 15 + i + 1);
    const picked = shuffle(pool).slice(0, 5);
    for (let row = 0; row < 5; row++) {
      const index = row * 5 + col;
      if (index === FREE_INDEX) continue;
      numbers[index] = picked[row];
    }
  }
  const opened = new Array<boolean>(CELL_COUNT).fill(false);
  opened[FREE_INDEX] = true;
  return { numbers, opened };
}

export function isCardState(value: unknown): value is CardState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<CardState>;
  return (
    Array.isArray(v.numbers) &&
    v.numbers.length === CELL_COUNT &&
    Array.isArray(v.opened) &&
    v.opened.length === CELL_COUNT
  );
}

export function lineStatuses(opened: boolean[]): LineStatus[] {
  return LINES.map((line) => {
    const closed = line.filter((index) => !opened[index]);
    return {
      complete: closed.length === 0,
      reachCell: closed.length === 1 ? closed[0] : null,
    };
  });
}
