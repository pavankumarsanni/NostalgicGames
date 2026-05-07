import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../lib/kv';
import { broadcastRoom } from '../../lib/pusher';
import { dealChitChase } from '../../lib/chitChase';
import { ChitTheme } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, playerId, theme = 'animals' } = req.body as {
    code: string;
    playerId: string;
    theme?: ChitTheme;
  };

  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) return res.status(403).json({ error: 'Only the host can start.' });
  if (room.players.length < 2) return res.status(400).json({ error: 'Need at least 2 players.' });
  if (room.players.length > 8) return res.status(400).json({ error: 'Max 8 players.' });

  try {
    const updated = dealChitChase(room, theme);
    await saveRoom(updated);
    await broadcastRoom(updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
}
