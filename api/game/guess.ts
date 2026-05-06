import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRoom, saveRoom } from '../../lib/kv';
import { broadcastRoom, broadcastGuessResult } from '../../lib/pusher';
import { processGuess } from '../../lib/rajaMantri';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, playerId, targetPlayerId } = req.body as {
    code: string;
    playerId: string;
    targetPlayerId: string;
  };

  const room = await getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.phase !== 'card-reveal') return res.status(400).json({ error: 'Not in playing phase' });
  if (room.currentTurn?.guesserPlayerId !== playerId) {
    return res.status(403).json({ error: "Not your turn" });
  }

  const guesser = room.players.find(p => p.id === playerId)!;
  const target = room.players.find(p => p.id === targetPlayerId)!;
  if (!target) return res.status(400).json({ error: 'Target player not found' });

  const { room: updated, correct } = processGuess(room, playerId, targetPlayerId);

  await saveRoom(updated);
  await broadcastGuessResult(room.code, {
    result: correct ? 'correct' : 'incorrect',
    guesserName: guesser.name,
    guessedName: target.name,
    targetRole: room.currentTurn!.targetRoleName,
  });
  await broadcastRoom(updated);
  res.json(updated);
}
