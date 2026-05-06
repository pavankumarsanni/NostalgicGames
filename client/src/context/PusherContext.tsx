import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import Pusher, { Channel } from 'pusher-js';
import { Room, GuessResultEvent } from '../types';

type PusherContextType = {
  room: Room | null;
  setRoom: (room: Room) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  playerId: string;
  lastGuessResult: GuessResultEvent | null;
  error: string | null;
  setError: (msg: string | null) => void;
};

const PusherContext = createContext<PusherContextType>({
  room: null,
  setRoom: () => {},
  roomCode: '',
  setRoomCode: () => {},
  playerId: '',
  lastGuessResult: null,
  error: null,
  setError: () => {},
});

// Stable player ID persisted across refreshes within the session
function getOrCreatePlayerId(): string {
  let id = sessionStorage.getItem('playerId');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('playerId', id);
  }
  return id;
}

export function PusherProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(() => {
    const stored = sessionStorage.getItem('room');
    return stored ? JSON.parse(stored) : null;
  });
  const [roomCode, setRoomCodeState] = useState<string>(
    () => sessionStorage.getItem('roomCode') || ''
  );
  const [lastGuessResult, setLastGuessResult] = useState<GuessResultEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerId = useRef(getOrCreatePlayerId()).current;
  const channelRef = useRef<Channel | null>(null);
  const pusherRef = useRef<Pusher | null>(null);

  // Persist room to sessionStorage so page refresh keeps state
  useEffect(() => {
    if (room) sessionStorage.setItem('room', JSON.stringify(room));
    else sessionStorage.removeItem('room');
  }, [room]);

  function setRoomCode(code: string) {
    setRoomCodeState(code);
    sessionStorage.setItem('roomCode', code);
  }

  // Subscribe to Pusher channel when roomCode is known
  useEffect(() => {
    if (!roomCode) return;

    if (!pusherRef.current) {
      pusherRef.current = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      });
    }

    // Unsubscribe from previous channel if any
    if (channelRef.current) {
      channelRef.current.unbind_all();
      pusherRef.current.unsubscribe(channelRef.current.name);
    }

    const channel = pusherRef.current.subscribe(`room-${roomCode}`);
    channelRef.current = channel;

    channel.bind('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    channel.bind('guess-result', (result: GuessResultEvent) => {
      setLastGuessResult(result);
      setTimeout(() => setLastGuessResult(null), 3500);
    });

    return () => {
      channel.unbind_all();
      pusherRef.current?.unsubscribe(`room-${roomCode}`);
    };
  }, [roomCode]);

  return (
    <PusherContext.Provider value={{
      room,
      setRoom,
      roomCode,
      setRoomCode,
      playerId,
      lastGuessResult,
      error,
      setError,
    }}>
      {children}
    </PusherContext.Provider>
  );
}

export const useGame = () => useContext(PusherContext);
