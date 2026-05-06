import { Room, Player, RoleCard, TurnState } from '../types';

export const DEFAULT_CARDS: RoleCard[] = [
  { id: 'king',     name: 'King',     emoji: '👑', rank: 1 },
  { id: 'queen',    name: 'Queen',    emoji: '👸', rank: 2 },
  { id: 'minister', name: 'Minister', emoji: '🧙', rank: 3 },
  { id: 'police',   name: 'Police',   emoji: '👮', rank: 4 },
  { id: 'thief',    name: 'Thief',    emoji: '🦹', rank: 5 },
];

// Points awarded for each successful guess in the turn chain
export const POINTS_PER_GUESS: Record<string, number> = {
  King: 10,
  Queen: 8,
  Minister: 6,
  Police: 4,
};

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

  // Find who got King — they go first
  const kingPlayer = players.find(p => p.card?.name === 'King')!;
  const kingCard = room.cards.find(c => c.name === 'King')!;

  // Build turn sequence: King finds Queen, Queen finds Minister, etc.
  const sortedCards = [...room.cards].sort((a, b) => a.rank - b.rank);
  const turnSequence = sortedCards
    .slice(0, -1) // last card holder (thief) doesn't guess
    .map(card => players.find(p => p.card?.id === card.id)?.id)
    .filter(Boolean) as string[];

  const firstTurn: TurnState = {
    guesserPlayerId: kingPlayer.id,
    targetRoleName: sortedCards[1]?.name ?? 'Queen', // King finds Queen
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
  const currentTurn = room.currentTurn!;
  const correct = target?.card?.name === currentTurn.targetRoleName;

  let players = [...room.players];

  if (correct) {
    // Award points to guesser
    players = players.map(p =>
      p.id === guesserPlayerId
        ? { ...p, score: p.score + (POINTS_PER_GUESS[p.card?.name ?? ''] ?? 0) }
        : p
    );

    // Advance to next turn
    const nextIndex = room.currentTurnIndex + 1;
    const sortedCards = [...room.cards].sort((a, b) => a.rank - b.rank);

    if (nextIndex >= room.turnSequence.length) {
      // Round over
      return {
        room: { ...room, players, phase: 'round-end', currentTurn: null },
        correct: true,
      };
    }

    const nextGuesserPlayerId = room.turnSequence[nextIndex];
    const nextGuesser = players.find(p => p.id === nextGuesserPlayerId)!;
    const nextTargetCard = sortedCards[nextIndex + 1];

    const nextTurn: TurnState = {
      guesserPlayerId: nextGuesserPlayerId,
      targetRoleName: nextTargetCard.name,
    };

    return {
      room: {
        ...room,
        players,
        currentTurn: nextTurn,
        currentTurnIndex: nextIndex,
      },
      correct: true,
    };
  } else {
    // Wrong guess — swap cards between guesser and target
    const guesser = players.find(p => p.id === guesserPlayerId)!;
    const targetPlayer = players.find(p => p.id === targetPlayerId)!;
    const guesserCard = guesser.card;
    const targetCard = targetPlayer.card;

    players = players.map(p => {
      if (p.id === guesserPlayerId) return { ...p, card: targetCard };
      if (p.id === targetPlayerId) return { ...p, card: guesserCard };
      return p;
    });

    // Rebuild turn sequence with updated cards
    const sortedCards = [...room.cards].sort((a, b) => a.rank - b.rank);
    const turnSequence = sortedCards
      .slice(0, -1)
      .map(card => players.find(p => p.card?.id === card.id)?.id)
      .filter(Boolean) as string[];

    // Current guesser still tries again (same turn index, new sequence)
    const newGuesserPlayerId = turnSequence[room.currentTurnIndex];
    const nextTargetCard = sortedCards[room.currentTurnIndex + 1];

    const newTurn: TurnState = {
      guesserPlayerId: newGuesserPlayerId,
      targetRoleName: nextTargetCard.name,
    };

    return {
      room: {
        ...room,
        players,
        currentTurn: newTurn,
        turnSequence,
      },
      correct: false,
    };
  }
}

export function startNextRound(room: Room): Room {
  if (room.round >= room.maxRounds) {
    return { ...room, phase: 'game-over' };
  }

  // Reset cards but keep scores
  const players = room.players.map(p => ({ ...p, card: undefined }));
  return {
    ...room,
    players,
    phase: 'card-reveal',
    round: room.round + 1,
    currentTurn: null,
    turnSequence: [],
    currentTurnIndex: 0,
  };
}
