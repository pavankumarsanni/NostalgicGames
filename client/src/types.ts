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

// ─── Pass The Card ──────────────────────────────────────────────────────────

export type ChitCard = {
  uid: string;
  setId: string;
  emoji: string;
  name: string;
};

export type PTCPhase = 'waiting' | 'selecting' | 'round-result' | 'game-over';

export type PTCData = {
  hands: Record<string, ChitCard[]>;
  selections: Record<string, string | null>;
  round: number;
  winnerId: string | null;
  lastPassedTo: Record<string, string>;
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
  gameType: 'raja-mantri' | 'pass-the-card';
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
