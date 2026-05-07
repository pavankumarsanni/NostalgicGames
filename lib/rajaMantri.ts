import { Room, Player, RoleCard, TurnState } from './types';

export const DEFAULT_CARDS: RoleCard[] = [
  { id: 'king',     name: 'King',     emoji: '👑', rank: 1 },
  { id: 'queen',    name: 'Queen',    emoji: '👸', rank: 2 },
  { id: 'minister', name: 'Minister', emoji: '🧙', rank: 3 },
  { id: 'police',   name: 'Police',   emoji: '👮', rank: 4 },
  { id: 'thief',    name: 'Thief',    emoji: '🦹', rank: 5 },
];

// Points earned when a player successfully identifies the next card.
// Based on the guesser's current card rank: King earns the most, Thief earns 0.
// Formula: (n - 1 - rankIndex) * 10  (0-based index in sorted used-cards list)
function pointsForCorrectGuess(room: Room, guesserPlayerId: string): number {
  const n = room.players.length;
  const usedCards = room.cards.slice(0, n).sort((a, b) => a.rank - b.rank);
  const guesser = room.players.find(p => p.id === guesserPlayerId);
  const idx = usedCards.findIndex(c => c.id === guesser?.card?.id);
  return idx >= 0 ? (n - 1 - idx) * 10 : 0;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dealCards(room: Room): Room {
  const cards = shuffle(room.cards.slice(0, room.players.length));
  const players = room.players.map((p, i) => ({ ...p, card: cards[i] }));
  const sortedCards = [...room.cards].sort((a, b) => a.rank - b.rank);

  const turnSequence = sortedCards
    .slice(0, -1)
    .map(card => players.find(p => p.card?.id === card.id)?.id)
    .filter(Boolean) as string[];

  const kingPlayer = players.find(p => p.card?.name === 'King')!;
  const firstTurn: TurnState = {
    guesserPlayerId: kingPlayer.id,
    targetRoleName: sortedCards[1]?.name ?? 'Queen',
  };

  return {
    ...room,
    players,
    phase: 'card-reveal',
    currentTurn: firstTurn,
    turnSequence,
    currentTurnIndex: 0,
  };
}

export function processGuess(
  room: Room,
  guesserPlayerId: string,
  targetPlayerId: string
): { room: Room; correct: boolean } {
  const target = room.players.find(p => p.id === targetPlayerId);
  const correct = target?.card?.name === room.currentTurn!.targetRoleName;
  const sortedCards = [...room.cards].sort((a, b) => a.rank - b.rank);
  let players = [...room.players];

  if (correct) {
    // Award points to the guesser based on their current card
    const earned = pointsForCorrectGuess(room, guesserPlayerId);
    players = players.map(p =>
      p.id === guesserPlayerId ? { ...p, score: p.score + earned } : p
    );

    const nextIndex = room.currentTurnIndex + 1;
    if (nextIndex >= room.turnSequence.length) {
      return { room: { ...room, players, phase: 'round-end', currentTurn: null }, correct: true };
    }

    const nextGuesserPlayerId = room.turnSequence[nextIndex];
    const nextTurn: TurnState = {
      guesserPlayerId: nextGuesserPlayerId,
      targetRoleName: sortedCards[nextIndex + 1].name,
    };

    return {
      room: { ...room, players, currentTurn: nextTurn, currentTurnIndex: nextIndex },
      correct: true,
    };
  } else {
    // Swap cards
    const guesserCard = players.find(p => p.id === guesserPlayerId)!.card;
    const targetCard = players.find(p => p.id === targetPlayerId)!.card;
    players = players.map(p => {
      if (p.id === guesserPlayerId) return { ...p, card: targetCard };
      if (p.id === targetPlayerId) return { ...p, card: guesserCard };
      return p;
    });

    // Rebuild turn sequence after swap
    const turnSequence = sortedCards
      .slice(0, -1)
      .map(card => players.find(p => p.card?.id === card.id)?.id)
      .filter(Boolean) as string[];

    const newGuesserPlayerId = turnSequence[room.currentTurnIndex];
    const newTurn: TurnState = {
      guesserPlayerId: newGuesserPlayerId,
      targetRoleName: sortedCards[room.currentTurnIndex + 1].name,
    };

    return { room: { ...room, players, currentTurn: newTurn, turnSequence }, correct: false };
  }
}

export function startNextRound(room: Room): Room {
  if (room.round >= room.maxRounds) {
    return { ...room, phase: 'game-over' };
  }
  const players = room.players.map(p => ({ ...p, card: undefined }));
  return {
    ...room,
    players,
    round: room.round + 1,
    currentTurn: null,
    turnSequence: [],
    currentTurnIndex: 0,
    phase: 'card-reveal',
  };
}
