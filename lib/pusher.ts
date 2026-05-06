import Pusher from 'pusher';
import { Room, GuessResultEvent } from './types';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export function broadcastRoom(room: Room) {
  return pusherServer.trigger(`room-${room.code}`, 'room-updated', room);
}

export function broadcastGuessResult(roomCode: string, payload: GuessResultEvent) {
  return pusherServer.trigger(`room-${roomCode}`, 'guess-result', payload);
}
