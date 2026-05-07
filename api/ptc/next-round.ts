import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../lib/kv';
import { broadcastRoom } from '../../lib/pusher';
import { startNextRound } from '../../lib/chitChase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, playerId } = req.body as { code: string; playerId: string };

  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const player = room.players.find(p => p.id === playerId);
  if (!player?.isHost) return res.status(403).json({ error: 'Only the host can start the next round.' });
  if (room.ptcPhase !== 'round-over') return res.status(400).json({ error: 'Not in round-over phase.' });

  try {
    const updated = startNextRound(room);
    await saveRoom(updated);
    await broadcastRoom(updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
}
