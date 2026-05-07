import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/PusherContext';
import { useGameActions } from '../hooks/useGameActions';
import { ChitTheme, RoleCard } from '../types';
import CardSetupPanel from '../games/RajaMantriChorSipahi/CardSetupPanel';
import ThemeSelector from '../games/ChitChase/ThemeSelector';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { room, playerId, error, setError } = useGame();
  const { startGame, updateCards, chitChaseStart } = useGameActions();
  const isChitChase = room?.gameType === 'chit-chase';
  const [copied, setCopied] = useState(false);
  const [showCardSetup, setShowCardSetup] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ChitTheme>('animals');
  const [pointTarget, setPointTarget] = useState(100);

  useEffect(() => { if (!room) navigate('/'); }, [room, navigate]);

  useEffect(() => {
    if (room?.phase === 'card-reveal') navigate('/game');
    if (room?.ptcPhase === 'selecting' || room?.ptcPhase === 'round-over' || room?.ptcPhase === 'game-over') navigate('/game');
  }, [room?.phase, room?.ptcPhase, navigate]);

  if (!room) return null;

  const me = room.players.find(p => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const canStart = isChitChase
    ? room.players.length >= 2 && room.players.length <= 8
    : room.players.length >= 3 && room.cards.length >= room.players.length;

  function copyCode() {
    navigator.clipboard.writeText(room!.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      {/* Game badge */}
      <div className="text-center">
        <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">
          {isChitChase ? '🃏 Chit Chase' : '👑 Raja Mantri Chor Sipahi'}
        </span>
      </div>

      {/* Room Code */}
      <div className="card-glass p-6 w-full max-w-md text-center">
        <p className="text-gray-400 text-sm mb-2">Share this code with friends</p>
        <div
          className="font-retro text-3xl text-amber-400 tracking-widest cursor-pointer hover:text-amber-300 transition-colors"
          onClick={copyCode}
        >
          {room.code}
        </div>
        <button onClick={copyCode} className="mt-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          {copied ? '✓ Copied!' : '📋 Copy code'}
        </button>
      </div>

      {/* Players */}
      <div className="card-glass p-5 w-full max-w-md">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          👥 Players
          <span className="text-sm text-gray-500 font-normal">({room.players.length} joined)</span>
        </h2>
        <div className="space-y-2">
          {room.players.map(player => (
            <div key={player.id} className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm">
                {player.name[0].toUpperCase()}
              </div>
              <span className="font-semibold flex-1">{player.name}</span>
              {player.isHost && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">Host</span>}
              {player.id === playerId && <span className="text-xs text-gray-500">(you)</span>}
            </div>
          ))}
        </div>
        {!isChitChase && room.players.length < 3 && (
          <p className="text-gray-500 text-sm mt-3 text-center">Waiting for at least 3 players…</p>
        )}
        {isChitChase && room.players.length < 2 && (
          <p className="text-gray-500 text-sm mt-3 text-center">Waiting for at least 2 players…</p>
        )}
      </div>

      {/* Chit Chase Theme Selector (host only) */}
      {isHost && isChitChase && (
        <div className="card-glass p-5 w-full max-w-md">
          <h2 className="font-bold text-lg mb-4">🎨 Card Theme</h2>
          <ThemeSelector selected={selectedTheme} onChange={setSelectedTheme} />
        </div>
      )}

      {/* Chit Chase Point Target (host only) */}
      {isHost && isChitChase && (
        <div className="card-glass p-5 w-full max-w-md">
          <h2 className="font-bold text-lg mb-1">🏆 Point Target</h2>
          <p className="text-gray-500 text-xs mb-4">First to reach this score wins the game. Each round win = 10 pts.</p>
          <div className="flex gap-2 flex-wrap">
            {[50, 100, 200, 300].map(t => (
              <button
                key={t}
                onClick={() => setPointTarget(t)}
                className={`flex-1 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                  pointTarget === t
                    ? 'border-amber-400 bg-amber-900/40 text-amber-300'
                    : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">≈ {Math.ceil(pointTarget / 10)} rounds to win</p>
        </div>
      )}

      {/* Raja Mantri Card Setup (host only) */}
      {isHost && !isChitChase && (
        <div className="card-glass p-5 w-full max-w-md">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">🃏 Card Setup</h2>
            <button onClick={() => setShowCardSetup(!showCardSetup)} className="text-sm text-purple-400 hover:text-purple-300">
              {showCardSetup ? 'Hide ▲' : 'Customize ▼'}
            </button>
          </div>
          {!showCardSetup && (
            <div className="flex gap-2 flex-wrap">
              {room.cards.map(c => (
                <span key={c.id} className="bg-gray-800 rounded-lg px-3 py-1 text-sm">{c.emoji} {c.name}</span>
              ))}
            </div>
          )}
          {showCardSetup && (
            <CardSetupPanel cards={room.cards} playerCount={room.players.length} onUpdate={updateCards} />
          )}
        </div>
      )}

      {/* Non-host theme display */}
      {!isHost && isChitChase && (
        <div className="card-glass p-4 w-full max-w-md text-center">
          <p className="text-gray-400 text-sm">Host will choose a card theme before starting</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3 w-full max-w-md flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-2">✕</button>
        </div>
      )}

      {isHost ? (
        <button
          onClick={() => isChitChase ? chitChaseStart(selectedTheme, pointTarget) : startGame()}
          disabled={!canStart}
          className="btn-gold w-full max-w-md text-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🚀 Start Game
        </button>
      ) : (
        <div className="text-gray-500 text-sm animate-pulse">Waiting for host to start the game…</div>
      )}

      <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
        ← Leave room
      </button>
    </div>
  );
}
