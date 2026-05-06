import { useGame } from '../../context/PusherContext';
import { useGameActions } from '../../hooks/useGameActions';
import clsx from 'clsx';

export default function RoundEnd() {
  const { room, playerId } = useGame();
  const { nextRound } = useGameActions();
  if (!room) return null;

  const me = room.players.find(p => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const isLastRound = room.round >= room.maxRounds;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 max-w-md mx-auto">
      <div className="text-center animate-bounce-in">
        <div className="text-5xl mb-2">🎊</div>
        <h2 className="font-bold text-2xl">Round {room.round} Over!</h2>
        <p className="text-gray-400 mt-1">Card reveal time</p>
      </div>

      {/* Card reveal */}
      <div className="card-glass p-5 w-full">
        <h3 className="font-bold mb-4 text-center text-gray-300">Who had what?</h3>
        <div className="grid grid-cols-2 gap-3">
          {room.players.map(player => (
            <div key={player.id} className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">{player.card?.emoji ?? '❓'}</span>
              <div>
                <div className="font-semibold text-sm">{player.name}</div>
                <div className="text-xs text-gray-400">{player.card?.name ?? 'Unknown'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scores */}
      <div className="card-glass p-5 w-full">
        <h3 className="font-bold mb-3 text-gray-300">Scores</h3>
        <div className="space-y-2">
          {sorted.map((player, i) => (
            <div
              key={player.id}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-4 py-3',
                i === 0 ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-gray-800/30'
              )}
            >
              <span className="text-xl">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
              <span className="flex-1 font-semibold">{player.name}</span>
              <span className="font-bold text-amber-400 text-lg">{player.score}</span>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button onClick={nextRound} className="btn-primary w-full text-lg">
          {isLastRound ? '🏆 See Final Results' : '▶️ Next Round'}
        </button>
      ) : (
        <p className="text-gray-500 text-sm animate-pulse">Waiting for host to continue…</p>
      )}
    </div>
  );
}
