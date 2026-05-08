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

// ─── Housie / Tambola ────────────────────────────────────────────────────────

export type HousiePhase = 'waiting' | 'playing' | 'game-over';

export type HousieClaimType = 'early-five' | 'top-line' | 'middle-line' | 'bottom-line' | 'full-house';

export type HousieTicket = {
  // 3 rows × 9 cols; null = blank cell
  grid: (number | null)[][];
};

export type HousieWin = {
  claimType: HousieClaimType;
  winnerId: string;
  winnerName: string;
};

export type HousieData = {
  tickets: Record<string, HousieTicket>;
  calledNumbers: number[];
  lastCalled: number | null;
  wins: HousieWin[];
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
  gameType: 'raja-mantri' | 'chit-chase' | 'housie';
  players: Player[];
  // Raja Mantri
  phase: GamePhase;
  cards: RoleCard[];
  currentTurn: TurnState | null;
  turnSequence: string[];
  currentTurnIndex: number;
  round: number;
  maxRounds: number;
  // Chit Chase
  ptcPhase?: PTCPhase;
  ptcData?: PTCData;
  pointTarget?: number;
  scores?: Record<string, number>;
  // Housie
  housiePhase?: HousiePhase;
  housieData?: HousieData;
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
