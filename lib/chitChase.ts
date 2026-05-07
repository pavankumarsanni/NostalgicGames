import { Room, ChitCard, ChitTheme } from './types';

export const THEMES: Record<ChitTheme, { name: string; emoji: string; cards: { setId: string; emoji: string; name: string }[] }> = {
  animals: {
    name: 'Animals', emoji: '🐾',
    cards: [
      { setId: 'dog',   emoji: '🐶', name: 'Dog' },
      { setId: 'cat',   emoji: '🐱', name: 'Cat' },
      { setId: 'frog',  emoji: '🐸', name: 'Frog' },
      { setId: 'fox',   emoji: '🦊', name: 'Fox' },
      { setId: 'koala', emoji: '🐨', name: 'Koala' },
      { setId: 'tiger', emoji: '🐯', name: 'Tiger' },
      { setId: 'lion',  emoji: '🦁', name: 'Lion' },
      { setId: 'panda', emoji: '🐼', name: 'Panda' },
    ],
  },
  flowers: {
    name: 'Flowers', emoji: '🌸',
    cards: [
      { setId: 'rose',      emoji: '🌹', name: 'Rose' },
      { setId: 'sunflower', emoji: '🌻', name: 'Sunflower' },
      { setId: 'tulip',     emoji: '🌷', name: 'Tulip' },
      { setId: 'hibiscus',  emoji: '🌺', name: 'Hibiscus' },
      { setId: 'blossom',   emoji: '🌸', name: 'Blossom' },
      { setId: 'bouquet',   emoji: '💐', name: 'Bouquet' },
      { setId: 'lotus',     emoji: '🪷', name: 'Lotus' },
      { setId: 'daisy',     emoji: '🌼', name: 'Daisy' },
    ],
  },
  sports: {
    name: 'Sports', emoji: '⚽',
    cards: [
      { setId: 'soccer',     emoji: '⚽', name: 'Soccer' },
      { setId: 'basketball', emoji: '🏀', name: 'Basketball' },
      { setId: 'football',   emoji: '🏈', name: 'Football' },
      { setId: 'baseball',   emoji: '⚾', name: 'Baseball' },
      { setId: 'tennis',     emoji: '🎾', name: 'Tennis' },
      { setId: 'volleyball', emoji: '🏐', name: 'Volleyball' },
      { setId: 'billiards',  emoji: '🎱', name: 'Billiards' },
      { setId: 'pingpong',   emoji: '🏓', name: 'Ping Pong' },
    ],
  },
  fruits: {
    name: 'Fruits', emoji: '🍎',
    cards: [
      { setId: 'apple',      emoji: '🍎', name: 'Apple' },
      { setId: 'orange',     emoji: '🍊', name: 'Orange' },
      { setId: 'lemon',      emoji: '🍋', name: 'Lemon' },
      { setId: 'grapes',     emoji: '🍇', name: 'Grapes' },
      { setId: 'strawberry', emoji: '🍓', name: 'Strawberry' },
      { setId: 'peach',      emoji: '🍑', name: 'Peach' },
      { setId: 'pineapple',  emoji: '🍍', name: 'Pineapple' },
      { setId: 'mango',      emoji: '🥭', name: 'Mango' },
    ],
  },
  countries: {
    name: 'Countries', emoji: '🌍',
    cards: [
      { setId: 'india',   emoji: '🇮🇳', name: 'India' },
      { setId: 'usa',     emoji: '🇺🇸', name: 'USA' },
      { setId: 'uk',      emoji: '🇬🇧', name: 'UK' },
      { setId: 'aus',     emoji: '🇦🇺', name: 'Australia' },
      { setId: 'japan',   emoji: '🇯🇵', name: 'Japan' },
      { setId: 'brazil',  emoji: '🇧🇷', name: 'Brazil' },
      { setId: 'france',  emoji: '🇫🇷', name: 'France' },
      { setId: 'germany', emoji: '🇩🇪', name: 'Germany' },
    ],
  },
  music: {
    name: 'Music', emoji: '🎵',
    cards: [
      { setId: 'guitar',    emoji: '🎸', name: 'Guitar' },
      { setId: 'piano',     emoji: '🎹', name: 'Piano' },
      { setId: 'drums',     emoji: '🥁', name: 'Drums' },
      { setId: 'trumpet',   emoji: '🎺', name: 'Trumpet' },
      { setId: 'violin',    emoji: '🎻', name: 'Violin' },
      { setId: 'accordion', emoji: '🪗', name: 'Accordion' },
      { setId: 'saxophone', emoji: '🎷', name: 'Saxophone' },
      { setId: 'bongo',     emoji: '🪘', name: 'Bongo' },
    ],
  },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dealHands(room: Room, theme: ChitTheme, roundNum = 1): Room {
  const n = room.players.length;
  const themeData = THEMES[theme];
  const sets = themeData.cards.slice(0, n);

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

  return {
    ...room,
    ptcPhase: 'selecting',
    ptcData: {
      hands,
      activePlayerIdx: 0,
      round: roundNum,
      winnerId: null,
      theme,
      lastAction: null,
    },
  };
}

export function dealChitChase(room: Room, theme: ChitTheme, pointTarget: number): Room {
  const scores: Record<string, number> = {};
  room.players.forEach(p => { scores[p.id] = 0; });
  return dealHands({ ...room, pointTarget, scores }, theme, 1);
}

export function startNextRound(room: Room): Room {
  const theme = room.ptcData!.theme;
  return dealHands(room, theme, 1);
}

export function passCard(room: Room, fromPlayerId: string, cardUid: string): Room {
  const ptcData = room.ptcData!;
  const playerIds = room.players.map(p => p.id);
  const activeIdx = ptcData.activePlayerIdx;
  const activePlayerId = playerIds[activeIdx];

  if (fromPlayerId !== activePlayerId) return room;

  const fromHand = ptcData.hands[fromPlayerId];
  const card = fromHand.find(c => c.uid === cardUid);
  if (!card) return room;

  // Move card: remove from sender, add to receiver
  const nextIdx = (activeIdx + 1) % playerIds.length;
  const toPlayerId = playerIds[nextIdx];

  const newHands = { ...ptcData.hands };
  newHands[fromPlayerId] = fromHand.filter(c => c.uid !== cardUid); // 3 cards
  newHands[toPlayerId] = [...ptcData.hands[toPlayerId], card];       // 5 cards

  // Check if receiver now has 4 matching
  const receiverHand = newHands[toPlayerId];
  const matchCount = receiverHand.filter(c => c.setId === card.setId).length;
  const roundWinnerId = matchCount >= 4 ? toPlayerId : null;

  const lastAction = {
    fromName: room.players.find(p => p.id === fromPlayerId)!.name,
    toName: room.players.find(p => p.id === toPlayerId)!.name,
  };

  if (!roundWinnerId) {
    return {
      ...room,
      ptcPhase: 'selecting',
      ptcData: {
        ...ptcData,
        hands: newHands,
        activePlayerIdx: nextIdx,
        round: ptcData.round + 1,
        winnerId: null,
        lastAction,
      },
    };
  }

  // Award points and check if target reached
  const newScores = { ...(room.scores ?? {}) };
  newScores[roundWinnerId] = (newScores[roundWinnerId] ?? 0) + 10;
  const targetReached = (room.pointTarget ?? 100) <= newScores[roundWinnerId];

  return {
    ...room,
    scores: newScores,
    ptcPhase: targetReached ? 'game-over' : 'round-over',
    ptcData: {
      ...ptcData,
      hands: newHands,
      activePlayerIdx: nextIdx,
      round: ptcData.round + 1,
      winnerId: roundWinnerId,
      lastAction,
    },
  };
}
