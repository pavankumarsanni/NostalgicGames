import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/PusherContext';
import { useGameActions } from '../../hooks/useGameActions';

export default function ChitChaseWin() {
  const { room, playerId } = useGame();
  const { chitChaseNextRound } = useGameActions();
  const navigate = useNavigate();
  if (!room?.ptcData) return null;

  const { winnerId, hands } = room.ptcData;
  const isRoundOver = room.ptcPhase === 'round-over';
  const scores = room.scores ?? {};
  const pointTarget = room.pointTarget ?? 100;

  const roundWinner = room.players.find(p => p.id === winnerId);
  const winningCard = winnerId ? (hands[winnerId] ?? []).find(c =>
    (hands[winnerId] ?? []).filter(x => x.setId === c.setId).length >= 4
  ) : undefined;

  const isWinner = winnerId === playerId;
  const me = room.players.find(p => p.id === playerId);
  const isHost = me?.isHost ?? false;

  // For game-over, find overall champion (highest score)
  const champion = room.players.reduce((best, p) =>
    (scores[p.id] ?? 0) > (scores[best.id] ?? 0) ? p : best
  , room.players[0]);
  const isChampion = champion?.id === playerId;

  const sortedPlayers = [...room.players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-4 max-w-md mx-auto">

      {/* Header */}
      <div className="text-center animate-bounce-in">
        {isRoundOver ? (
          <>
            <div className="text-6xl mb-3">{isWinner ? '🎉' : winningCard?.emoji ?? '🃏'}</div>
            <h1 className="font-retro text-lg text-amber-400 mb-1">Round Over!</h1>
            <p className="text-gray-300">
              {isWinner
                ? 'You collected 4 matching chits!'
                : <><strong className="text-white">{roundWinner?.name}</strong> wins this round!</>
              }
            </p>
            {winningCard && (
              <p className="text-gray-500 text-sm mt-1">4 × {winningCard.emoji} {winningCard.name}s</p>
            )}
          </>
        ) : (
          <>
            <div className="text-6xl mb-3">{isChampion ? '🏆' : '🎊'}</div>
            <h1 className="font-retro text-lg text-amber-400 mb-1">Game Over!</h1>
            <p className="text-gray-300">
              {isChampion
                ? 'You are the champion!'
                : <><strong className="text-white">{champion?.name}</strong> wins the game!</>
              }
            </p>
            <p className="text-gray-500 text-sm mt-1">Reached {pointTarget} points first</p>
          </>
        )}
      </div>

      {/* Scoreboard */}
      <div className="card-glass p-5 w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-300">Scoreboard</h3>
          <span className="text-xs text-gray-500">Target: {pointTarget} pts</span>
        </div>
        <div className="space-y-2">
          {sortedPlayers.map((p, rank) => {
            const pts = scores[p.id] ?? 0;
            const isMe = p.id === playerId;
            const isTopPlayer = rank === 0;
            const pct = Math.min(100, Math.round((pts / pointTarget) * 100));
            return (
              <div key={p.id} className={`rounded-xl px-4 py-3 ${isTopPlayer && !isRoundOver ? 'bg-amber-900/30 border border-amber-600/50' : 'bg-gray-800/40'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-gray-500 w-4">{rank + 1}.</span>
                  <span className="flex-1 text-sm font-semibold">
                    {p.name} {isMe && <span className="text-gray-500 text-xs">(you)</span>}
                    {p.id === winnerId && isRoundOver && <span className="ml-1">🎉</span>}
                    {isTopPlayer && !isRoundOver && <span className="ml-1">👑</span>}
                  </span>
                  <span className="text-sm font-bold text-amber-400">{pts} pts</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {isRoundOver ? (
        isHost ? (
          <button onClick={chitChaseNextRound} className="btn-gold w-full text-lg">
            ▶ Next Round
          </button>
        ) : (
          <div className="text-gray-500 text-sm animate-pulse text-center">
            Waiting for host to start next round…
          </div>
        )
      ) : (
        <button onClick={() => navigate('/')} className="btn-primary w-full text-lg">
          🏠 Back to Home
        </button>
      )}
    </div>
  );
}
