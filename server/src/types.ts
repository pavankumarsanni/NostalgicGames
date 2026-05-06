export type RoleCard = {
  id: string;
  name: string;
  emoji: string;
  rank: number; // 1 = highest (King), higher number = lower rank
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
  guesserPlayerId: string;   // who is guessing
  targetRoleName: string;    // what role they're trying to find
  guessedPlayerId?: string;  // who they pointed at
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
  turnSequence: string[]; // ordered list of playerIds for turns
  currentTurnIndex: number;
  round: number;
  maxRounds: number;
};

export type SocketEvents = {
  // Client → Server
  'create-room': { playerName: string; gameType: Room['gameType'] };
  'join-room': { code: string; playerName: string };
  'update-cards': { cards: RoleCard[] };
  'start-game': {};
  'deal-cards': {};
  'make-guess': { targetPlayerId: string };
  'next-round': {};

  // Server → Client
  'room-updated': Room;
  'error': { message: string };
  'guess-result': { result: GuessResult; guesserName: string; guessedName: string; targetRole: string };
  'game-started': {};
};
