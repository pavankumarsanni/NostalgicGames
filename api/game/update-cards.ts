import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../lib/kv';
import { broadcastRoom } from '../../lib/pusher';
import { RoleCard } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, playerId, cards } = req.body as { code: string; playerId: string; cards: RoleCard[] };
  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) return res.status(403).json({ error: 'Only the host can update cards.' });

  room.cards = cards;
  await saveRoom(room);
  await broadcastRoom(room);
  res.json(room);
}
