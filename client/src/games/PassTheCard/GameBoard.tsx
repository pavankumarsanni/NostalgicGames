import { useState } from 'react';
import { useGame } from '../../context/PusherContext';
import { useGameActions } from '../../hooks/useGameActions';
import { ChitCard } from '../../types';
import clsx from 'clsx';

export default function PTCGameBoard() {
  const { room, playerId } = useGame();
  const { ptcSelectCard } = useGameActions();
  const [selected, setSelected] = useState<string | null>(null);
  const [passing, setPassing] = useState(false);

  if (!room?.ptcData) return null;

  const { hands, selections, round, lastPassedTo } = room.ptcData;
  const myHand: ChitCard[] = hands[playerId] ?? [];
  const mySelection = selections[playerId];
  const hasSelected = mySelection !== null;
  const totalPlayers = room.players.length;
  const selectedCount = Object.values(selections).filter(s => s !== null).length;
  const lastReceived = lastPassedTo[playerId];

  async function handlePass() {
    if (!selected || hasSelected || passing) return;
    setPassing(true);
    await ptcSelectCard(selected);
    setSelected(null);
    setPassing(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-5 p-4 pb-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-gray-500">Round {round}</span>
        <span className="text-xs text-gray-600 bg-gray-800 px-3 py-1 rounded-full">
          Pass The Card
        </span>
      </div>

      {/* Status bar */}
      <div className="card-glass p-4 w-full text-center">
        {hasSelected ? (
          <div>
            <p className="text-green-400 font-bold">✓ Card selected! Waiting for others…</p>
            <p className="text-gray-500 text-sm mt-1">
              {selectedCount} / {totalPlayers} players ready
            </p>
            <div className="flex gap-1 justify-center mt-2">
              {room.players.map(p => (
                <div
                  key={p.id}
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    selections[p.id] !== null ? 'bg-green-500' : 'bg-gray-700'
                  )}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="font-bold text-lg">👆 Pick a card to pass left</p>
            <p className="text-gray-400 text-sm mt-1">Tap a card, then hit Pass</p>
          </div>
        )}
      </div>

      {/* Last received card hint */}
      {lastReceived && (
        <div className="w-full bg-indigo-900/30 border border-indigo-700/50 rounded-xl px-4 py-2 text-center text-sm text-indigo-300 animate-slide-up">
          📨 You received a card last round
        </div>
      )}

      {/* My hand */}
      <div className="w-full">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 text-center">Your Hand</p>
        <div className="grid grid-cols-4 gap-3">
          {myHand.map(card => {
            const isSelected = selected === card.uid;
            const locked = hasSelected;
            return (
              <button
                key={card.uid}
                disabled={locked}
                onClick={() => !locked && setSelected(isSelected ? null : card.uid)}
                className={clsx(
                  'flex flex-col items-center justify-center rounded-2xl border-2 py-4 gap-1 transition-all duration-200',
                  isSelected
                    ? 'border-amber-400 bg-amber-900/30 scale-105 animate-pulse-glow'
                    : locked
                    ? 'border-gray-800 bg-gray-900/30 opacity-60 cursor-not-allowed'
                    : 'border-gray-700 bg-gray-800/50 hover:border-purple-500 cursor-pointer hover:scale-105'
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
      {!hasSelected && (
        <button
          onClick={handlePass}
          disabled={!selected || passing}
          className="btn-gold w-full text-lg disabled:opacity-40 disabled:cursor-not-allowed animate-slide-up"
        >
          {passing ? '⏳ Passing…' : selected ? `➡️ Pass ${myHand.find(c => c.uid === selected)?.name}` : 'Select a card first'}
        </button>
      )}

      {/* Other players status */}
      <div className="card-glass p-4 w-full">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Players</p>
        <div className="space-y-2">
          {room.players.map((p, i) => {
            const nextPlayer = room.players[(i + 1) % room.players.length];
            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                  {p.name[0].toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-medium">{p.name} {p.id === playerId && <span className="text-gray-500">(you)</span>}</span>
                <span className="text-xs">
                  {selections[p.id] !== null
                    ? <span className="text-green-400">✓ Ready → {nextPlayer.name}</span>
                    : <span className="text-gray-600">thinking…</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* My full hand summary */}
      <div className="card-glass p-4 w-full">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Your collection</p>
        <div className="flex gap-2 flex-wrap">
          {['🐶','🐱','🐸','🦊','🐨','🐯','🦁','🐼'].slice(0, room.players.length).map((emoji, i) => {
            const count = myHand.filter(c => c.emoji === emoji).length;
            return count > 0 ? (
              <span key={i} className="bg-gray-800 rounded-lg px-2 py-1 text-sm">
                {emoji} × {count}
              </span>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
