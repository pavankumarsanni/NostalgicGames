import { Room, Player, RoleCard, TurnState } from './types';

export const DEFAULT_CARDS: RoleCard[] = [
  { id: 'king',     name: 'King',     emoji: '👑', rank: 1 },
  { id: 'queen',    name: 'Queen',    emoji: '👸', rank: 2 },
  { id: 'minister', name: 'Minister', emoji: '🧙', rank: 3 },
  { id: 'police',   name: 'Police',   emoji: '👮', rank: 4 },
  { id: 'thief',    name: 'Thief',    emoji: '🦹', rank: 5 },
];

// Points awarded at round-end based on the card held.
// Cards sorted by rank ascending: index 0 = highest role (King), last index = lowest (Thief).
// Formula: (n - 1 - index) * 10  →  King always max, last card always 0.
function calcRoundPoints(room: Room): Player[] {
  const n = room.players.length;
  const usedCards = room.cards.slice(0, n).sort((a, b) => a.rank - b.rank);
  return room.players.map(p => {
    const idx = usedCards.findIndex(c => c.id === p.card?.id);
    const earned = idx >= 0 ? (n - 1 - idx) * 10 : 0;
    return { ...p, score: p.score + earned };
  });
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
    const nextIndex = room.currentTurnIndex + 1;
    if (nextIndex >= room.turnSequence.length) {
      // Round over — award points based on final cards held
      const scoredPlayers = calcRoundPoints({ ...room, players });
      return { room: { ...room, players: scoredPlayers, phase: 'round-end', currentTurn: null }, correct: true };
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
