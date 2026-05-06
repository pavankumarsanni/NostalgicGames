import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../lib/kv';
import { broadcastRoom } from '../../lib/pusher';
import { Player } from '../../lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, playerName, playerId } = req.body as {
    code: string;
    playerName: string;
    playerId: string;
  };

  if (!code || !playerName?.trim() || !playerId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const room = await getRoom(code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found. Check the code and try again.' });
  if (room.phase !== 'waiting') return res.status(400).json({ error: 'Game already in progress.' });
  if (room.players.length >= 8) return res.status(400).json({ error: 'Room is full (max 8 players).' });

  // If player is rejoining (same playerId), just return current room
  if (room.players.find(p => p.id === playerId)) {
    return res.json(room);
  }

  const player: Player = {
    id: playerId,
    name: playerName.trim(),
    score: 0,
    isHost: false,
  };

  room.players.push(player);
  await saveRoom(room);
  await broadcastRoom(room);
  res.json(room);
}
