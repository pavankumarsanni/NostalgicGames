import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { Room, Player, RoleCard } from './types';
import { DEFAULT_CARDS, dealCards, processGuess, startNextRound } from './games/rajaMantri';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const rooms = new Map<string, Room>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function getRoomByCode(code: string): Room | undefined {
  return [...rooms.values()].find(r => r.code === code);
}

function broadcastRoom(room: Room) {
  io.to(room.id).emit('room-updated', room);
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('create-room', ({ playerName, gameType }) => {
    const roomId = uuidv4();
    const code = generateCode();
    const player: Player = {
      id: socket.id,
      name: playerName,
      score: 0,
      isHost: true,
    };
    const room: Room = {
      id: roomId,
      code,
      gameType: gameType ?? 'raja-mantri',
      players: [player],
      phase: 'waiting',
      cards: DEFAULT_CARDS,
      currentTurn: null,
      turnSequence: [],
      currentTurnIndex: 0,
      round: 1,
      maxRounds: 3,
    };
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.emit('room-updated', room);
    console.log(`Room created: ${code}`);
  });

  socket.on('join-room', ({ code, playerName }) => {
    const room = getRoomByCode(code.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Room not found. Check the code and try again.' });
      return;
    }
    if (room.phase !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress.' });
      return;
    }
    if (room.players.length >= 8) {
      socket.emit('error', { message: 'Room is full (max 8 players).' });
      return;
    }

    const player: Player = {
      id: socket.id,
      name: playerName,
      score: 0,
      isHost: false,
    };
    room.players.push(player);
    socket.join(room.id);
    socket.data.roomId = room.id;
    broadcastRoom(room);
  });

  socket.on('update-cards', ({ cards }: { cards: RoleCard[] }) => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) return;
    room.cards = cards;
    broadcastRoom(room);
  });

  socket.on('start-game', () => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) return;
    if (room.players.length < 3) {
      socket.emit('error', { message: 'Need at least 3 players to start.' });
      return;
    }
    if (room.cards.length < room.players.length) {
      socket.emit('error', { message: `Need at least ${room.players.length} cards for ${room.players.length} players.` });
      return;
    }

    const updatedRoom = dealCards(room);
    rooms.set(room.id, updatedRoom);
    broadcastRoom(updatedRoom);
  });

  socket.on('make-guess', ({ targetPlayerId }: { targetPlayerId: string }) => {
    const room = rooms.get(socket.data.roomId);
    if (!room || room.phase !== 'card-reveal') return;
    if (room.currentTurn?.guesserPlayerId !== socket.id) return;

    const guesser = room.players.find(p => p.id === socket.id)!;
    const target = room.players.find(p => p.id === targetPlayerId)!;

    const { room: updatedRoom, correct } = processGuess(room, socket.id, targetPlayerId);
    rooms.set(room.id, updatedRoom);

    io.to(room.id).emit('guess-result', {
      result: correct ? 'correct' : 'incorrect',
      guesserName: guesser.name,
      guessedName: target.name,
      targetRole: room.currentTurn!.targetRoleName,
    });

    broadcastRoom(updatedRoom);
  });

  socket.on('next-round', () => {
    const room = rooms.get(socket.data.roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) return;
    const updatedRoom = startNextRound(room);
    if (updatedRoom.phase !== 'game-over') {
      const dealtRoom = dealCards(updatedRoom);
      rooms.set(room.id, dealtRoom);
      broadcastRoom(dealtRoom);
    } else {
      rooms.set(room.id, updatedRoom);
      broadcastRoom(updatedRoom);
    }
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.players.length === 0) {
      rooms.delete(roomId);
      return;
    }

    // Transfer host if needed
    if (!room.players.some(p => p.isHost)) {
      room.players[0].isHost = true;
    }

    broadcastRoom(room);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
