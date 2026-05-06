import { Redis } from '@upstash/redis';
import { Room } from './types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ROOM_TTL = 60 * 60 * 6; // 6 hours

export async function getRoom(code: string): Promise<Room | null> {
  return redis.get<Room>(`room:${code}`);
}

export async function saveRoom(room: Room): Promise<void> {
  await redis.set(`room:${room.code}`, room, { ex: ROOM_TTL });
}

export async function deleteRoom(code: string): Promise<void> {
  await redis.del(`room:${code}`);
}
