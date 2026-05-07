import { Room, ChitCard, PTCData } from './types';

const ANIMAL_SETS = [
  { setId: 'dog',    emoji: '🐶', name: 'Dog' },
  { setId: 'cat',    emoji: '🐱', name: 'Cat' },
  { setId: 'frog',   emoji: '🐸', name: 'Frog' },
  { setId: 'fox',    emoji: '🦊', name: 'Fox' },
  { setId: 'koala',  emoji: '🐨', name: 'Koala' },
  { setId: 'tiger',  emoji: '🐯', name: 'Tiger' },
  { setId: 'lion',   emoji: '🦁', name: 'Lion' },
  { setId: 'panda',  emoji: '🐼', name: 'Panda' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dealPTC(room: Room): Room {
  const n = room.players.length;
  const sets = ANIMAL_SETS.slice(0, n);

  // Create 4 copies of each set
  const allCards: ChitCard[] = sets.flatMap(s =>
    [0, 1, 2, 3].map(i => ({
      uid: `${s.setId}-${i}`,
      setId: s.setId,
      emoji: s.emoji,
      name: s.name,
    }))
  );

  const shuffled = shuffle(allCards);
  const hands: Record<string, ChitCard[]> = {};
  room.players.forEach((p, i) => {
    hands[p.id] = shuffled.slice(i * 4, i * 4 + 4);
  });

  const selections: Record<string, string | null> = {};
  room.players.forEach(p => { selections[p.id] = null; });

  return {
    ...room,
    ptcPhase: 'selecting',
    ptcData: {
      hands,
      selections,
      round: 1,
      winnerId: null,
      lastPassedTo: {},
    },
  };
}

export function selectCard(room: Room, playerId: string, cardUid: string): Room {
  const ptcData = room.ptcData!;
  const hand = ptcData.hands[playerId];
  if (!hand.find(c => c.uid === cardUid)) return room; // card not in hand

  const selections = { ...ptcData.selections, [playerId]: cardUid };

  // Check if all players have selected
  const allSelected = room.players.every(p => selections[p.id] !== null);

  if (!allSelected) {
    return { ...room, ptcData: { ...ptcData, selections } };
  }

  // Execute the pass — each player passes their selected card to the next player (left)
  const playerIds = room.players.map(p => p.id);
  const newHands: Record<string, ChitCard[]> = {};
  const lastPassedTo: Record<string, string> = {};

  playerIds.forEach((pid, idx) => {
    const nextIdx = (idx + 1) % playerIds.length;
    const nextPid = playerIds[nextIdx];
    const cardToPass = ptcData.hands[pid].find(c => c.uid === selections[pid])!;

    newHands[pid] = newHands[pid] || [...ptcData.hands[pid]];
    newHands[nextPid] = newHands[nextPid] || [...ptcData.hands[nextPid]];

    // Remove selected card from sender
    newHands[pid] = newHands[pid].filter(c => c.uid !== cardToPass.uid);
    // Add to receiver
    newHands[nextPid] = [...(newHands[nextPid].filter(c => c.uid !== cardToPass.uid)), cardToPass];
    lastPassedTo[nextPid] = cardToPass.uid;
  });

  // Check for winner (4 of same setId)
  let winnerId: string | null = null;
  for (const pid of playerIds) {
    const hand = newHands[pid];
    if (hand.length === 4 && hand.every(c => c.setId === hand[0].setId)) {
      winnerId = pid;
      break;
    }
  }

  const newSelections: Record<string, string | null> = {};
  playerIds.forEach(pid => { newSelections[pid] = null; });

  return {
    ...room,
    ptcPhase: winnerId ? 'game-over' : 'selecting',
    ptcData: {
      hands: newHands,
      selections: newSelections,
      round: ptcData.round + 1,
      winnerId,
      lastPassedTo,
    },
  };
}
