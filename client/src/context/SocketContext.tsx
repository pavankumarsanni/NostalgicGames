import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, GuessResultEvent } from '../types';

type SocketContextType = {
  socket: Socket | null;
  room: Room | null;
  lastGuessResult: GuessResultEvent | null;
  error: string | null;
  clearError: () => void;
  clearGuessResult: () => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  room: null,
  lastGuessResult: null,
  error: null,
  clearError: () => {},
  clearGuessResult: () => {},
});

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [lastGuessResult, setLastGuessResult] = useState<GuessResultEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: true });
    socketRef.current = socket;

    socket.on('room-updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on('guess-result', (result: GuessResultEvent) => {
      setLastGuessResult(result);
      setTimeout(() => setLastGuessResult(null), 3000);
    });

    socket.on('error', ({ message }: { message: string }) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        room,
        lastGuessResult,
        error,
        clearError: () => setError(null),
        clearGuessResult: () => setLastGuessResult(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
