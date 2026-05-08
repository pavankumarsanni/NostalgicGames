import { useState } from 'react';
import clsx from 'clsx';
import { useGame } from '../../context/PusherContext';
import { useGameActions } from '../../hooks/useGameActions';
import { HousieClaimType, HousieWin } from '../../types';
import { verifyClaim } from './claimUtils';
import Ticket from './Ticket';
import NumberBoard from './NumberBoard';

const CLAIMS: { type: HousieClaimType; label: string; emoji: string; desc: string }[] = [
  { type: 'early-five',   label: 'Early Five',   emoji: '5️⃣', desc: 'Any 5 numbers marked' },
  { type: 'top-line',     label: 'Top Line',     emoji: '1️⃣', desc: 'First row complete' },
  { type: 'middle-line',  label: 'Middle Line',  emoji: '2️⃣', desc: 'Second row complete' },
  { type: 'bottom-line',  label: 'Bottom Line',  emoji: '3️⃣', desc: 'Third row complete' },
  { type: 'full-house',   label: 'Full House',   emoji: '🏆', desc: 'All 15 numbers marked' },
];

export default function HousieBoard() {
  const { room, playerId } = useGame();
  const { housieDrawNumber, houseClaim } = useGameActions();
  const [drawing, setDrawing] = useState(false);
  const [claiming, setClaiming] = useState<HousieClaimType | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  if (!room?.housieData) return null;

  const { tickets, calledNumbers, lastCalled, wins } = room.housieData;
  const myTicket = tickets[playerId];
  const me = room.players.find(p => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const totalDrawn = calledNumbers.length;

  function claimWonBy(type: HousieClaimType): HousieWin | undefined {
    return wins.find(w => w.claimType === type);
  }

  function canIClaim(type: HousieClaimType): boolean {
    if (claimWonBy(type)) return false;
    if (!myTicket) return false;
    return verifyClaim(myTicket, calledNumbers, type);
  }

  async function handleClaim(type: HousieClaimType) {
    setClaimError(null);
    setClaiming(type);
    try {
      await houseClaim(type);
    } catch {
      setClaimError('Claim failed — not valid yet or already taken');
    } finally {
      setClaiming(null);
    }
  }

  async function handleDraw() {
    setDrawing(true);
    await housieDrawNumber();
    setDrawing(false);
  }

  return (
    <div className="min-h-screen flex flex-col gap-4 p-4 pb-10 max-w-lg mx-auto">

      {/* Last called number */}
      <div className="card-glass p-5 text-center animate-slide-up">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Last Called</p>
        {lastCalled ? (
          <div className="text-7xl font-retro text-amber-400 animate-bounce-in">{lastCalled}</div>
        ) : (
          <div className="text-3xl text-gray-600 font-bold">—</div>
        )}
        <p className="text-gray-600 text-xs mt-2">{totalDrawn} / 90 numbers drawn</p>
      </div>

      {/* Host draw button */}
      {isHost && (
        <button
          onClick={handleDraw}
          disabled={drawing || totalDrawn >= 90}
          className="btn-gold w-full text-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {drawing ? '⏳ Drawing…' : totalDrawn >= 90 ? 'All numbers drawn!' : '🎱 Draw Next Number'}
        </button>
      )}
      {!isHost && (
        <div className="text-center text-gray-500 text-sm animate-pulse">
          Waiting for host to draw the next number…
        </div>
      )}

      {/* My ticket */}
      {myTicket && (
        <div className="card-glass p-4">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-3">Your Ticket</h3>
          <Ticket ticket={myTicket} calledNumbers={calledNumbers} />
        </div>
      )}

      {/* Claim buttons */}
      <div className="card-glass p-4">
        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-3">Claims</h3>
        {claimError && (
          <p className="text-red-400 text-xs mb-3 text-center">{claimError}</p>
        )}
        <div className="space-y-2">
          {CLAIMS.map(({ type, label, emoji, desc }) => {
            const winner = claimWonBy(type);
            const eligible = canIClaim(type);
            const isClaiming = claiming === type;

            return (
              <div
                key={type}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-4 py-3 border transition-all',
                  winner
                    ? winner.winnerId === playerId
                      ? 'border-amber-500 bg-amber-900/30'
                      : 'border-gray-700 bg-gray-800/20 opacity-60'
                    : eligible
                    ? 'border-purple-500 bg-purple-900/20 cursor-pointer hover:bg-purple-900/40'
                    : 'border-gray-800 bg-gray-900/20'
                )}
              >
                <span className="text-xl">{emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                  {winner && (
                    <p className={clsx('text-xs font-bold mt-0.5', winner.winnerId === playerId ? 'text-amber-400' : 'text-gray-400')}>
                      {winner.winnerId === playerId ? '🎉 You won this!' : `Won by ${winner.winnerName}`}
                    </p>
                  )}
                </div>
                {!winner && eligible && (
                  <button
                    onClick={() => handleClaim(type)}
                    disabled={!!isClaiming}
                    className="btn-primary text-xs py-2 px-3 shrink-0"
                  >
                    {isClaiming ? '…' : 'Claim!'}
                  </button>
                )}
                {!winner && !eligible && (
                  <span className="text-gray-700 text-xs">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Number board */}
      <div className="card-glass p-4">
        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-3">All Numbers</h3>
        <NumberBoard calledNumbers={calledNumbers} lastCalled={lastCalled} />
      </div>

      {/* Other players' tickets (compact) */}
      {room.players.filter(p => p.id !== playerId).length > 0 && (
        <div className="card-glass p-4">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-3">Other Players</h3>
          <div className="space-y-4">
            {room.players.filter(p => p.id !== playerId).map(p => (
              <div key={p.id}>
                <p className="text-xs text-gray-500 mb-1">{p.name}</p>
                {tickets[p.id]
                  ? <Ticket ticket={tickets[p.id]} calledNumbers={calledNumbers} compact />
                  : <p className="text-xs text-gray-600">No ticket</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
