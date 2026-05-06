import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { saveRoom } from '../../lib/kv';
import { broadcastRoom } from '../../lib/pusher';
import { DEFAULT_CARDS } from '../../lib/rajaMantri';
import { Room, Player } from '../../lib/types';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { playerName, playerId } = req.body as { playerName: string; playerId: string };
  if (!playerName?.trim() || !playerId) return res.status(400).json({ error: 'Missing fields' });

  const player: Player = {
    id: playerId,
    name: playerName.trim(),
    score: 0,
    isHost: true,
  };

  const room: Room = {
    id: uuidv4(),
    code: generateCode(),
    gameType: 'raja-mantri',
    players: [player],
    phase: 'waiting',
    cards: DEFAULT_CARDS,
    currentTurn: null,
    turnSequence: [],
    currentTurnIndex: 0,
    round: 1,
    maxRounds: 3,
  };

  try {
    await saveRoom(room);
    await broadcastRoom(room);
    res.json(room);
  } catch (err: any) {
    console.error('create-room error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
}
