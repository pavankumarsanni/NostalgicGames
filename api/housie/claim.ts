import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../lib/kv';
import { broadcastRoom } from '../../lib/pusher';
import { processClaim } from '../../lib/housie';
import { HousieClaimType } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, playerId, claimType } = req.body as {
    code: string;
    playerId: string;
    claimType: HousieClaimType;
  };

  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.housiePhase !== 'playing') return res.status(400).json({ error: 'Game not in playing phase.' });

  const { room: updated, valid, reason } = processClaim(room, playerId, claimType);

  if (!valid) return res.status(400).json({ error: reason ?? 'Invalid claim' });

  try {
    await saveRoom(updated);
    await broadcastRoom(updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
}
