import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/PusherContext';
import { HousieClaimType } from '../../types';
import Ticket from './Ticket';

const CLAIM_LABELS: Record<HousieClaimType, string> = {
  'early-five':  '5️⃣ Early Five',
  'top-line':    '1️⃣ Top Line',
  'middle-line': '2️⃣ Middle Line',
  'bottom-line': '3️⃣ Bottom Line',
  'full-house':  '🏆 Full House',
};

export default function HousieGameOver() {
  const { room, playerId } = useGame();
  const navigate = useNavigate();
  if (!room?.housieData) return null;

  const { wins, calledNumbers, tickets } = room.housieData;
  const myTicket = tickets[playerId];
  const fullHouseWinner = wins.find(w => w.claimType === 'full-house');
  const isWinner = fullHouseWinner?.winnerId === playerId;

  return (
    <div className="min-h-screen flex flex-col items-center gap-5 p-4 pb-10 max-w-lg mx-auto">

      <div className="text-center animate-bounce-in">
        <div className="text-6xl mb-3">{isWinner ? '🏆' : '🎊'}</div>
        <h1 className="font-retro text-lg text-amber-400 mb-1">Game Over!</h1>
        {fullHouseWinner && (
          <p className="text-gray-300">
            {isWinner
              ? 'You got Full House!'
              : <><strong className="text-white">{fullHouseWinner.winnerName}</strong> got Full House!</>
            }
          </p>
        )}
        <p className="text-gray-600 text-sm mt-1">{calledNumbers.length} numbers were called</p>
      </div>

      {/* All claims */}
      <div className="card-glass p-5 w-full">
        <h3 className="font-bold text-gray-300 mb-4">Winners</h3>
        <div className="space-y-2">
          {(Object.keys(CLAIM_LABELS) as HousieClaimType[]).map(type => {
            const win = wins.find(w => w.claimType === type);
            return (
              <div key={type} className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gray-800/40">
                <span className="text-sm font-semibold text-gray-300 flex-1">{CLAIM_LABELS[type]}</span>
                {win ? (
                  <span className={`text-sm font-bold ${win.winnerId === playerId ? 'text-amber-400' : 'text-gray-300'}`}>
                    {win.winnerName} {win.winnerId === playerId && '🎉'}
                  </span>
                ) : (
                  <span className="text-gray-600 text-sm">Unclaimed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* My final ticket */}
      {myTicket && (
        <div className="card-glass p-4 w-full">
          <h3 className="font-bold text-gray-300 mb-3 text-sm">Your Final Ticket</h3>
          <Ticket ticket={myTicket} calledNumbers={calledNumbers} />
        </div>
      )}

      <button onClick={() => navigate('/')} className="btn-primary w-full text-lg">
        🏠 Back to Home
      </button>
    </div>
  );
}
