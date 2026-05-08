import { HousieTicket, HousieClaimType } from '../../types';

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
