import { useGame } from '../context/PusherContext';
import { RoleCard, Room } from '../types';

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data as T;
}

export function useGameActions() {
  const { playerId, roomCode, setRoom, setRoomCode, setError } = useGame();

  async function createRoom(playerName: string, gameType: 'raja-mantri' | 'pass-the-card' = 'raja-mantri') {
    try {
      const room = await post<Room>('/api/rooms/create', { playerName, playerId, gameType });
      setRoomCode(room.code);
      setRoom(room);
      return room;
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function joinRoom(code: string, playerName: string) {
    try {
      const room = await post<Room>('/api/rooms/join', { code, playerName, playerId });
      setRoomCode(room.code);
      setRoom(room);
      return room;
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function startGame() {
    try {
      await post('/api/game/start', { code: roomCode, playerId });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function makeGuess(targetPlayerId: string) {
    try {
      await post('/api/game/guess', { code: roomCode, playerId, targetPlayerId });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function nextRound() {
    try {
      await post('/api/game/next-round', { code: roomCode, playerId });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function updateCards(cards: RoleCard[]) {
    try {
      await post('/api/game/update-cards', { code: roomCode, playerId, cards });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function ptcStartGame() {
    try {
      await post('/api/ptc/start', { code: roomCode, playerId });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function ptcSelectCard(cardUid: string) {
    try {
      await post('/api/ptc/select', { code: roomCode, playerId, cardUid });
    } catch (e: any) {
      setError(e.message);
    }
  }

  return { createRoom, joinRoom, startGame, makeGuess, nextRound, updateCards, ptcStartGame, ptcSelectCard };
}
