import { useState } from 'react';
import { RoleCard } from '../../types';

const ALL_AVAILABLE_CARDS: RoleCard[] = [
  { id: 'king',     name: 'King',     emoji: '👑', rank: 1 },
  { id: 'queen',    name: 'Queen',    emoji: '👸', rank: 2 },
  { id: 'minister', name: 'Minister', emoji: '🧙', rank: 3 },
  { id: 'police',   name: 'Police',   emoji: '👮', rank: 4 },
  { id: 'thief',    name: 'Thief',    emoji: '🦹', rank: 5 },
  { id: 'guard',    name: 'Guard',    emoji: '🛡️', rank: 6 },
  { id: 'spy',      name: 'Spy',      emoji: '🕵️', rank: 7 },
  { id: 'jester',   name: 'Jester',   emoji: '🃏', rank: 8 },
];

const DEFAULT_IDS = new Set(['king', 'queen', 'minister', 'police', 'thief']);

type Props = {
  cards: RoleCard[];
  playerCount: number;
  onUpdate: (cards: RoleCard[]) => void;
};

export default function CardSetupPanel({ cards, playerCount, onUpdate }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(cards.map(c => c.id)));

  function toggle(card: RoleCard) {
    const next = new Set(selected);
    if (next.has(card.id)) {
      if (next.size <= 2) return; // keep at least 2
      next.delete(card.id);
    } else {
      next.add(card.id);
    }
    setSelected(next);
    onUpdate(ALL_AVAILABLE_CARDS.filter(c => next.has(c.id)));
  }

  function reset() {
    setSelected(new Set(DEFAULT_IDS));
    onUpdate(ALL_AVAILABLE_CARDS.filter(c => DEFAULT_IDS.has(c.id)));
  }

  const enough = selected.size >= playerCount;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">
        Select cards to include. Need at least{' '}
        <strong className="text-white">{playerCount}</strong> for {playerCount} players.{' '}
        <span className={`font-bold ${enough ? 'text-green-400' : 'text-red-400'}`}>
          {selected.size} selected
        </span>
      </p>

      <div className="grid grid-cols-2 gap-2">
        {ALL_AVAILABLE_CARDS.map(card => {
          const isSelected = selected.has(card.id);
          const isRequired = card.id === 'king' || card.id === 'thief';
          return (
            <button
              key={card.id}
              onClick={() => !isRequired && toggle(card)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-purple-900/50 border-purple-500 text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-500'
              } ${isRequired ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-purple-400'}`}
            >
              <span className="text-xl">{card.emoji}</span>
              <div>
                <div className="text-sm font-semibold">{card.name}</div>
                {isRequired && <div className="text-xs text-gray-500">required</div>}
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
        ↺ Reset to default
      </button>
    </div>
  );
}
