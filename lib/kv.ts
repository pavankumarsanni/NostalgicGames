import { kv } from '@vercel/kv';
import { Room } from './types';

const ROOM_TTL = 60 * 60 * 6; // 6 hours

export async function getRoom(code: string): Promise<Room | null> {
  return kv.get<Room>(`room:${code}`);
}

export async function saveRoom(room: Room): Promise<void> {
  await kv.set(`room:${room.code}`, room, { ex: ROOM_TTL });
}

export async function deleteRoom(code: string): Promise<void> {
  await kv.del(`room:${code}`);
}
