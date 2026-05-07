import { useState } from 'react';
import { useGame } from '../../context/PusherContext';
import { useGameActions } from '../../hooks/useGameActions';
import { ChitCard } from '../../types';
import clsx from 'clsx';

export default function ChitChaseBoard() {
  const { room, playerId } = useGame();
  const { chitChasePass } = useGameActions();
  const [selected, setSelected] = useState<string | null>(null);
  const [passing, setPassing] = useState(false);

  if (!room?.ptcData) return null;

  const { hands, activePlayerIdx, lastAction } = room.ptcData;
  const players = room.players;
  const activePlayer = players[activePlayerIdx];
  const isMyTurn = activePlayer?.id === playerId;
  const myHand: ChitCard[] = hands[playerId] ?? [];

  async function handlePass() {
    if (!selected || !isMyTurn || passing) return;
    setPassing(true);
    await chitChasePass(selected);
    setSelected(null);
    setPassing(false);
  }

  const nextPlayer = players[(activePlayerIdx + 1) % players.length];

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-gray-500">Round {room.ptcData.round}</span>
        <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1 rounded-full font-retro text-xs">
          Chit Chase
        </span>
      </div>

      {/* Last action toast */}
      {lastAction && (
        <div className="w-full bg-indigo-900/30 border border-indigo-700/50 rounded-xl px-4 py-3 text-sm text-center animate-slide-up">
          <span className="text-indigo-300">
            <strong>{lastAction.fromName}</strong> passed a chit to <strong>{lastAction.toName}</strong>
          </span>
        </div>
      )}

      {/* Turn indicator */}
      <div className="card-glass p-4 w-full text-center">
        {isMyTurn ? (
          <div>
            <p className="font-bold text-lg text-amber-400">👆 Your turn!</p>
            <p className="text-gray-400 text-sm mt-1">
              Pick a card to pass to <strong className="text-white">{nextPlayer?.name}</strong>
            </p>
          </div>
        ) : (
          <div>
            <p className="font-bold text-lg">
              <span className="text-purple-400">{activePlayer?.name}</span> is choosing…
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Will pass to {nextPlayer?.name}
            </p>
          </div>
        )}
      </div>

      {/* My hand */}
      <div className="w-full">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 text-center">
          Your Hand ({myHand.length} cards)
        </p>
        <div className="grid grid-cols-4 gap-3">
          {myHand.map(card => {
            const isSelected = selected === card.uid;
            const locked = !isMyTurn || passing;
            return (
              <button
                key={card.uid}
                disabled={locked}
                onClick={() => !locked && setSelected(isSelected ? null : card.uid)}
                className={clsx(
                  'flex flex-col items-center justify-center rounded-2xl border-2 py-4 gap-1 transition-all duration-200 relative',
                  isSelected && 'border-amber-400 bg-amber-900/30 scale-105 animate-pulse-glow',
                  !isSelected && !locked && 'border-gray-700 bg-gray-800/50 hover:border-purple-500 cursor-pointer hover:scale-105',
                  locked && !isSelected && 'border-gray-800 bg-gray-900/30 cursor-not-allowed',
                )}
              >
                <span className="text-3xl">{card.emoji}</span>
                <span className="text-xs text-gray-400">{card.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pass button */}
      {isMyTurn && (
        <button
          onClick={handlePass}
          disabled={!selected || passing}
          className="btn-gold w-full text-lg disabled:opacity-40 disabled:cursor-not-allowed animate-slide-up"
        >
          {passing
            ? '⏳ Passing…'
            : selected
            ? `➡️ Pass ${myHand.find(c => c.uid === selected)?.emoji} to ${nextPlayer?.name}`
            : 'Tap a card to select'}
        </button>
      )}

      {/* Players list */}
      <div className="card-glass p-4 w-full">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Players</p>
        <div className="space-y-2">
          {players.map((p, i) => {
            const hand = hands[p.id] ?? [];
            const isActive = i === activePlayerIdx;
            const isMe = p.id === playerId;
            return (
              <div
                key={p.id}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2 transition-all',
                  isActive ? 'bg-purple-900/30 border border-purple-700/50' : 'bg-gray-800/20'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                  isActive ? 'bg-purple-500' : 'bg-gray-700'
                )}>
                  {p.name[0].toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-medium">
                  {p.name} {isMe && <span className="text-gray-500 text-xs">(you)</span>}
                </span>
                <span className="text-xs text-gray-500">{hand.length} cards</span>
                {isActive && <span className="text-xs text-purple-400">🎯</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
