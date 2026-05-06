export type RoleCard = {
  id: string;
  name: string;
  emoji: string;
  rank: number; // 1 = King (highest), higher = lower rank
};

export type Player = {
  id: string;   // client-generated UUID stored in sessionStorage
  name: string;
  card?: RoleCard;
  score: number;
  isHost: boolean;
};

export type GamePhase =
  | 'waiting'
  | 'card-reveal'
  | 'round-end'
  | 'game-over';

export type GuessResult = 'correct' | 'incorrect';

export type TurnState = {
  guesserPlayerId: string;
  targetRoleName: string;
};

export type Room = {
  id: string;
  code: string;
  gameType: 'raja-mantri';
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
