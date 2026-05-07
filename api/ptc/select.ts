import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../lib/kv';
import { broadcastRoom } from '../../lib/pusher';
import { passCard } from '../../lib/chitChase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, playerId, cardUid } = req.body as {
    code: string;
    playerId: string;
    cardUid: string;
  };

  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.ptcPhase !== 'selecting') return res.status(400).json({ error: 'Not in selecting phase' });

  const activePlayerId = room.players[room.ptcData!.activePlayerIdx]?.id;
  if (playerId !== activePlayerId) {
    return res.status(403).json({ error: "It's not your turn." });
  }

  try {
    const updated = passCard(room, playerId, cardUid);
    await saveRoom(updated);
    await broadcastRoom(updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
}
