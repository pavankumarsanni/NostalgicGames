import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/PusherContext';

export default function ChitChaseWin() {
  const { room, playerId } = useGame();
  const navigate = useNavigate();
  if (!room?.ptcData) return null;

  const { winnerId, hands, round, theme } = room.ptcData;
  const winner = room.players.find(p => p.id === winnerId);
  const isWinner = winnerId === playerId;
  const winnerHand = hands[winnerId ?? ''] ?? [];
  const winningCard = winnerHand[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 max-w-md mx-auto">
      <div className="text-center animate-bounce-in">
        <div className="text-7xl mb-3">{isWinner ? '🏆' : winningCard?.emoji ?? '🎉'}</div>
        <h1 className="font-retro text-lg text-amber-400 mb-2">Chit Chase!</h1>
        <p className="text-gray-300 text-lg">
          {isWinner ? 'You collected 4 matching chits!' : (
            <><strong className="text-white">{winner?.name}</strong> wins!</>
          )}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          {winningCard && <>4 × {winningCard.emoji} {winningCard.name}s in {round - 1} passes</>}
        </p>
        <p className="text-xs text-gray-600 mt-1 capitalize">Theme: {theme}</p>
      </div>

      {/* All hands */}
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
                <span className="font-semibold flex-1 text-sm">
                  {p.name} {isWin && '👑'}
                </span>
                <div className="flex gap-1 flex-wrap justify-end">
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
