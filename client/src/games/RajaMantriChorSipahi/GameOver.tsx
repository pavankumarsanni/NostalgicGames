import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/PusherContext';

export default function GameOver() {
  const { room } = useGame();
  const navigate = useNavigate();
  if (!room) return null;

  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 max-w-md mx-auto">
      <div className="text-center animate-bounce-in">
        <div className="text-6xl mb-3">🏆</div>
        <h1 className="font-retro text-xl text-amber-400">Game Over!</h1>
        <p className="text-gray-400 mt-2">
          <strong className="text-white">{winner.name}</strong> wins with{' '}
          <strong className="text-amber-400">{winner.score} points!</strong>
        </p>
      </div>

      <div className="card-glass p-5 w-full">
        <h3 className="font-bold mb-4 text-gray-300 text-center uppercase tracking-widest text-sm">
          Final Standings
        </h3>
        <div className="space-y-3">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-4 rounded-2xl px-4 py-3 ${
                i === 0
                  ? 'bg-gradient-to-r from-amber-900/50 to-yellow-900/30 border border-amber-600/50'
                  : i === sorted.length - 1
                  ? 'bg-gray-900/30 border border-gray-800'
                  : 'bg-gray-800/30'
              }`}
            >
              <span className="text-2xl">{medals[i] || `${i + 1}.`}</span>
              <div className="flex-1">
                <div className="font-bold">{player.name}</div>
                {player.id === loser.id && i === sorted.length - 1 && (
                  <div className="text-xs text-red-400 mt-0.5">🦹 Was the Thief last round</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-amber-400">{player.score}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => navigate('/')} className="btn-primary w-full text-lg">
        🏠 Back to Home
      </button>
    </div>
  );
}
