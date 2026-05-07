import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/PusherContext';
import { useGameActions } from '../hooks/useGameActions';
import { GameInfo } from '../types';

const GAMES: GameInfo[] = [
  {
    id: 'raja-mantri',
    title: 'Raja Mantri Chor Sipahi',
    emoji: '👑',
    description: 'The classic card guessing game — can the King find the Queen before the Thief escapes?',
    players: '3–8 players',
    status: 'available',
    gradient: 'from-purple-900/80 to-indigo-900/80',
  },
  {
    id: 'chit-chase',
    title: 'Chit Chase',
    emoji: '🃏',
    description: 'Pass chits around and collect 4 of the same! Choose from animals, sports, music & more.',
    players: '2–8 players',
    status: 'available',
    gradient: 'from-red-900/80 to-orange-900/80',
  },
  {
    id: 'dumb-charades',
    title: 'Dumb Charades',
    emoji: '🎬',
    description: 'Act out a movie title without speaking. Your team has to guess!',
    players: '4–10 players',
    status: 'coming-soon',
    gradient: 'from-green-900/80 to-teal-900/80',
  },
  {
    id: 'antakshari',
    title: 'Antakshari',
    emoji: '🎵',
    description: 'Sing a song starting from the last letter of the previous one.',
    players: '4–12 players',
    status: 'coming-soon',
    gradient: 'from-pink-900/80 to-rose-900/80',
  },
  {
    id: 'housie',
    title: 'Housie / Tambola',
    emoji: '🎱',
    description: 'Classic bingo with an auto number caller and digital tickets.',
    players: '2–20 players',
    status: 'coming-soon',
    gradient: 'from-yellow-900/80 to-amber-900/80',
  },
  {
    id: 'memory',
    title: 'Memory Card Match',
    emoji: '🧠',
    description: 'Flip cards and find matching pairs before your opponents.',
    players: '2–4 players',
    status: 'coming-soon',
    gradient: 'from-cyan-900/80 to-sky-900/80',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { error, setError } = useGame();
  const { createRoom, joinRoom } = useGameActions();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [loading, setLoading] = useState(false);

  function openCreate(game: GameInfo) {
    setSelectedGame(game);
    setModalMode('create');
    setShowModal(true);
  }

  function openJoin(game: GameInfo) {
    setSelectedGame(game);
    setModalMode('join');
    setShowModal(true);
  }

  async function handleCreate() {
    if (!playerName.trim()) return;
    setLoading(true);
    const gameType = selectedGame?.id === 'chit-chase' ? 'chit-chase' : 'raja-mantri';
    const room = await createRoom(playerName, gameType);
    setLoading(false);
    if (room) navigate('/lobby');
  }

  async function handleJoin() {
    if (!playerName.trim() || !roomCode.trim()) return;
    setLoading(true);
    const room = await joinRoom(roomCode, playerName);
    setLoading(false);
    if (room) navigate('/lobby');
  }

  function closeModal() {
    setShowModal(false);
    setError(null);
    setLoading(false);
  }

  return (
    <div className="min-h-screen stars-bg">
      <header className="text-center py-12 px-4">
        <div className="text-5xl mb-4">🎮</div>
        <h1 className="font-retro text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
          Nostalgic Games
        </h1>
        <p className="text-gray-400 font-body text-lg max-w-md mx-auto">
          Relive the games we grew up playing — now with friends online!
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-gray-400 font-body text-sm uppercase tracking-widest mb-6 text-center">
          Choose a game
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className={`card-glass bg-gradient-to-br ${game.gradient} p-5 flex flex-col gap-3 animate-slide-up`}
            >
              <div className="text-4xl">{game.emoji}</div>
              <div>
                <h3 className="font-bold text-lg text-white leading-tight">{game.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{game.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs text-gray-500">{game.players}</span>
                {game.status === 'available' ? (
                  <div className="flex gap-2">
                    <button onClick={() => openJoin(game)} className="btn-secondary text-sm py-2 px-3">
                      Join
                    </button>
                    <button onClick={() => openCreate(game)} className="btn-primary text-sm py-2 px-3">
                      Create
                    </button>
                  </div>
                ) : (
                  <span className="text-xs bg-gray-800 text-gray-500 px-3 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && selectedGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-glass p-6 w-full max-w-sm animate-bounce-in">
            <div className="text-3xl mb-2">{selectedGame.emoji}</div>
            <h2 className="font-bold text-xl mb-1">
              {modalMode === 'create' ? 'Create Room' : 'Join Room'}
            </h2>
            <p className="text-gray-400 text-sm mb-5">{selectedGame.title}</p>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3 mb-4 flex items-start justify-between gap-2">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 shrink-0">✕</button>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Your name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Pavan"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={20}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && (modalMode === 'create' ? handleCreate() : handleJoin())}
                />
              </div>

              {modalMode === 'join' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Room code</label>
                  <input
                    className="input-field uppercase tracking-widest font-bold"
                    placeholder="e.g. XKQP3"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={5}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={modalMode === 'create' ? handleCreate : handleJoin}
                  disabled={loading || !playerName.trim() || (modalMode === 'join' && !roomCode.trim())}
                  className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳' : modalMode === 'create' ? '🚀 Create' : '🎮 Join'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
