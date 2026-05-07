import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/PusherContext';

export default function PTCWinScreen() {
  const { room, playerId } = useGame();
  const navigate = useNavigate();
  if (!room?.ptcData) return null;

  const { winnerId, hands, round } = room.ptcData;
  const winner = room.players.find(p => p.id === winnerId);
  const isWinner = winnerId === playerId;
  const winningCard = hands[winnerId ?? '']?.[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 max-w-md mx-auto">
      <div className="text-center animate-bounce-in">
        <div className="text-7xl mb-3">{isWinner ? '🏆' : winningCard?.emoji ?? '🎉'}</div>
        <h1 className="font-retro text-xl text-amber-400 mb-2">
          {isWinner ? 'You Win!' : `${winner?.name} Wins!`}
        </h1>
        <p className="text-gray-400">
          Collected 4 {winningCard?.emoji} <strong className="text-white">{winningCard?.name}s</strong> in {round - 1} rounds!
        </p>
      </div>

      {/* All hands reveal */}
      <div className="card-glass p-5 w-full">
        <h3 className="font-bold mb-4 text-center text-gray-300">Final Hands</h3>
        <div className="space-y-3">
          {room.players.map(p => {
            const hand = hands[p.id] ?? [];
            const isWin = p.id === winnerId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  isWin ? 'bg-amber-900/30 border border-amber-600/50' : 'bg-gray-800/30'
                }`}
              >
                <span className="font-semibold flex-1 text-sm">{p.name} {isWin && '👑'}</span>
                <div className="flex gap-1">
                  {hand.map(c => (
                    <span key={c.uid} className="text-xl">{c.emoji}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={() => navigate('/')} className="btn-primary w-full text-lg">
        🏠 Back to Home
      </button>
    </div>
  );
}
