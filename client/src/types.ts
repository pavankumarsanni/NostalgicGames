// ─── Raja Mantri ────────────────────────────────────────────────────────────

export type RoleCard = {
  id: string;
  name: string;
  emoji: string;
  rank: number;
};

export type GuessResult = 'correct' | 'incorrect';

export type TurnState = {
  guesserPlayerId: string;
  targetRoleName: string;
};

export type GuessResultEvent = {
  result: GuessResult;
  guesserName: string;
  guessedName: string;
  targetRole: string;
};

// ─── Chit Chase ─────────────────────────────────────────────────────────────

export type ChitTheme = 'animals' | 'flowers' | 'sports' | 'fruits' | 'countries' | 'music';

export type ChitCard = {
  uid: string;
  setId: string;
  emoji: string;
  name: string;
};

export type PTCPhase = 'waiting' | 'selecting' | 'round-over' | 'game-over';

export type LastAction = {
  fromName: string;
  toName: string;
} | null;

export type PTCData = {
  hands: Record<string, ChitCard[]>;
  activePlayerIdx: number;
  round: number;
  winnerId: string | null;
  theme: ChitTheme;
  lastAction: LastAction;
};

// ─── Shared ─────────────────────────────────────────────────────────────────

export type GamePhase = 'waiting' | 'card-reveal' | 'round-end' | 'game-over';

export type Player = {
  id: string;
  name: string;
  card?: RoleCard;
  score: number;
  isHost: boolean;
};

export type Room = {
  id: string;
  code: string;
  gameType: 'raja-mantri' | 'chit-chase';
  players: Player[];
  phase: GamePhase;
  cards: RoleCard[];
  currentTurn: TurnState | null;
  turnSequence: string[];
  currentTurnIndex: number;
  round: number;
  maxRounds: number;
  ptcPhase?: PTCPhase;
  ptcData?: PTCData;
  pointTarget?: number;
  scores?: Record<string, number>;
};

export type GameInfo = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  players: string;
  status: 'available' | 'coming-soon';
  gradient: string;
};
