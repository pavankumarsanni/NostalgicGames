import { Room, HousieTicket, HousieClaimType, HousieWin } from './types';

// ─── Ticket generation ────────────────────────────────────────────────────────
// Standard Tambola ticket: 3 rows × 9 columns
// Col ranges: 1→1-9, 2→10-19, 3→20-29, 4→30-39, 5→40-49, 6→50-59, 7→60-69, 8→70-79, 9→80-90
// Each row has exactly 5 numbers and 4 blanks, each column has at most 2 numbers.

const COL_RANGES: [number, number][] = [
  [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
  [50, 59], [60, 69], [70, 79], [80, 90],
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateTicket(): HousieTicket {
  // Pick how many numbers go in each column: either 1 or 2, total = 15 (5 per row × 3 rows)
  // Each column gets 1 or 2 numbers; total across all 9 columns = 15
  // Constraint: exactly 5 per row means we need exactly one arrangement.

  // Strategy: assign column counts (each 1 or 2, summing to 15)
  // 9 cols, need sum=15 → 6 cols get 2, 3 cols get 1
  const colCounts = shuffle([2, 2, 2, 2, 2, 2, 1, 1, 1]);

  // For each column, pick that many unique numbers from its range
  const colNumbers: (number[] | null[])[] = colCounts.map((count, ci) => {
    const [min, max] = COL_RANGES[ci];
    const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return shuffle(pool).slice(0, count).sort((a, b) => a - b);
  });

  // Build a 3×9 grid, placing numbers from colNumbers into rows
  // Each row needs exactly 5 numbers → distribute colNumbers across 3 rows
  const grid: (number | null)[][] = [
    Array(9).fill(null),
    Array(9).fill(null),
    Array(9).fill(null),
  ];

  // Decide which row(s) each column's numbers go to
  for (let col = 0; col < 9; col++) {
    const nums = colNumbers[col] as number[];
    if (nums.length === 1) {
      // Place in a random row
      grid[randInt(0, 2)][col] = nums[0];
    } else {
      // Place one in each of two different rows chosen randomly
      const rows = shuffle([0, 1, 2]).slice(0, 2);
      grid[rows[0]][col] = nums[0];
      grid[rows[1]][col] = nums[1];
    }
  }

  // Fix: ensure each row has exactly 5 numbers — swap to balance if needed
  // Count per row
  for (let attempts = 0; attempts < 1000; attempts++) {
    const counts = grid.map(row => row.filter(v => v !== null).length);
    if (counts[0] === 5 && counts[1] === 5 && counts[2] === 5) break;

    // Find over-full and under-full rows
    const over = counts.findIndex(c => c > 5);
    const under = counts.findIndex(c => c < 5);
    if (over === -1 || under === -1) break;

    // Find a column in the over row that has null in the under row, swap
    for (let col = 0; col < 9; col++) {
      if (grid[over][col] !== null && grid[under][col] === null) {
        grid[under][col] = grid[over][col];
        grid[over][col] = null;
        break;
      }
    }
  }

  return { grid };
}

// ─── Game init ────────────────────────────────────────────────────────────────

export function dealHousie(room: Room): Room {
  const tickets: Record<string, HousieTicket> = {};
  room.players.forEach(p => {
    tickets[p.id] = generateTicket();
  });

  return {
    ...room,
    housiePhase: 'playing',
    housieData: {
      tickets,
      calledNumbers: [],
      lastCalled: null,
      wins: [],
    },
  };
}

// ─── Draw next number ─────────────────────────────────────────────────────────

export function drawNumber(room: Room): Room {
  const data = room.housieData!;
  const uncalled = Array.from({ length: 90 }, (_, i) => i + 1)
    .filter(n => !data.calledNumbers.includes(n));

  if (uncalled.length === 0) return room; // all drawn

  const num = uncalled[Math.floor(Math.random() * uncalled.length)];
  const calledNumbers = [...data.calledNumbers, num];

  return {
    ...room,
    housieData: { ...data, calledNumbers, lastCalled: num },
  };
}

// ─── Claim verification ───────────────────────────────────────────────────────

export function verifyClaim(
  ticket: HousieTicket,
  calledNumbers: number[],
  claimType: HousieClaimType
): boolean {
  const called = new Set(calledNumbers);
  const { grid } = ticket;

  const rowNumbers = (row: number) =>
    grid[row].filter((v): v is number => v !== null);

  const rowComplete = (row: number) =>
    rowNumbers(row).every(n => called.has(n));

  const totalMarked = grid.flat().filter((v): v is number => v !== null && called.has(v)).length;

  switch (claimType) {
    case 'early-five':   return totalMarked >= 5;
    case 'top-line':     return rowComplete(0);
    case 'middle-line':  return rowComplete(1);
    case 'bottom-line':  return rowComplete(2);
    case 'full-house':   return totalMarked === 15;
  }
}

export function processClaim(
  room: Room,
  playerId: string,
  claimType: HousieClaimType
): { room: Room; valid: boolean; reason?: string } {
  const data = room.housieData!;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return { room, valid: false, reason: 'Player not found' };

  // Already claimed by someone else?
  if (data.wins.some(w => w.claimType === claimType)) {
    return { room, valid: false, reason: 'Already claimed by someone else' };
  }

  const ticket = data.tickets[playerId];
  if (!ticket) return { room, valid: false, reason: 'No ticket found' };

  if (!verifyClaim(ticket, data.calledNumbers, claimType)) {
    return { room, valid: false, reason: 'Claim not valid yet' };
  }

  const win: HousieWin = { claimType, winnerId: playerId, winnerName: player.name };
  const wins = [...data.wins, win];
  const isGameOver = claimType === 'full-house';

  return {
    room: {
      ...room,
      housiePhase: isGameOver ? 'game-over' : 'playing',
      housieData: { ...data, wins },
    },
    valid: true,
  };
}
