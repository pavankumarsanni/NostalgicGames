export type RoleCard = {
  id: string;
  name: string;
  emoji: string;
  rank: number;
};

export type Player = {
  id: string;
  name: string;
  card?: RoleCard;
  score: number;
  isHost: boolean;
};

export type GamePhase =
  | 'waiting'
  | 'card-setup'
  | 'card-reveal'
  | 'playing'
  | 'round-end'
  | 'game-over';

export type GuessResult = 'correct' | 'incorrect';

export type TurnState = {
  guesserPlayerId: string;
  targetRoleName: string;
  guessedPlayerId?: string;
  result?: GuessResult;
};

export type Room = {
  id: string;
  code: string;
  gameType: 'raja-mantri' | null;
  players: Player[];
  phase: GamePhase;
  cards: RoleCard[];
  currentTurn: TurnState | null;
  turnSequence: string[];
  currentTurnIndex: number;
  round: number;
  maxRounds: number;
};

export type GuessResultEvent = {
  result: GuessResult;
  guesserName: string;
  guessedName: string;
  targetRole: string;
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
