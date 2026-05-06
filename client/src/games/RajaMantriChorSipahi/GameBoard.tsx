import { useState } from 'react';
import { useGame } from '../../context/PusherContext';
import { useGameActions } from '../../hooks/useGameActions';
import { Player } from '../../types';
import clsx from 'clsx';

export default function GameBoard() {
  const { room, playerId, lastGuessResult } = useGame();
  const { makeGuess } = useGameActions();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (!room) return null;

  const me = room.players.find(p => p.id === playerId);
  const myCard = me?.card;
  const currentTurn = room.currentTurn;
  const isMyTurn = currentTurn?.guesserPlayerId === playerId;
  const guesser = room.players.find(p => p.id === currentTurn?.guesserPlayerId);
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  function handleGuess() {
    if (!selectedTarget || !isMyTurn) return;
    makeGuess(selectedTarget);
    setSelectedTarget(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 pb-8 max-w-lg mx-auto">
      {/* Round indicator */}
      <div className="flex items-center gap-3 w-full justify-between">
        <span className="text-sm text-gray-500">Round {room.round} / {room.maxRounds}</span>
        <div className="flex gap-1">
          {Array.from({ length: room.maxRounds }).map((_, i) => (
            <div key={i} className={clsx('w-2 h-2 rounded-full', i < room.round ? 'bg-purple-500' : 'bg-gray-700')} />
          ))}
        </div>
      </div>

      {/* My card */}
      <div className="card-glass p-5 w-full text-center animate-slide-up">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Your card</p>
        {myCard ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-6xl animate-bounce-in">{myCard.emoji}</span>
            <span className="font-bold text-2xl text-white">{myCard.name}</span>
            <p className="text-gray-500 text-sm mt-1">Keep this secret from others!</p>
          </div>
        ) : (
          <div className="text-gray-600">No card assigned</div>
        )}
      </div>

      {/* Guess result toast */}
      {lastGuessResult && (
        <div className={clsx(
          'w-full rounded-2xl px-5 py-4 text-center font-semibold animate-bounce-in',
          lastGuessResult.result === 'correct'
            ? 'bg-green-900/60 border border-green-600 text-green-300'
            : 'bg-red-900/60 border border-red-600 text-red-300'
        )}>
          {lastGuessResult.result === 'correct' ? '🎉' : '😬'}{' '}
          <strong>{lastGuessResult.guesserName}</strong>{' '}
          {lastGuessResult.result === 'correct'
            ? `correctly found the ${lastGuessResult.targetRole}!`
            : `guessed wrong! Cards swapped.`}
        </div>
      )}

      {/* Turn status */}
      <div className="card-glass p-4 w-full">
        {currentTurn ? (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Current turn</p>
            <p className="font-bold text-lg">
              {isMyTurn ? '👉 Your turn!' : `${guesser?.name}'s turn`}
            </p>
            <p className="text-purple-300 text-sm mt-1">
              {isMyTurn
                ? `Point to who you think is the ${currentTurn.targetRoleName}`
                : `Trying to find the ${currentTurn.targetRoleName}`}
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-400">Waiting…</p>
        )}
      </div>

      {/* Player grid */}
      <div className="w-full">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 text-center">Players</p>
        <div className="grid grid-cols-2 gap-3">
          {room.players.map((player: Player) => {
            const isSelf = player.id === playerId;
            const isGuesser = player.id === currentTurn?.guesserPlayerId;
            const isSelected = selectedTarget === player.id;
            const canTarget = isMyTurn && !isSelf && !isGuesser;

            return (
              <button
                key={player.id}
                disabled={!canTarget}
                onClick={() => canTarget && setSelectedTarget(isSelected ? null : player.id)}
                className={clsx(
                  'rounded-2xl p-4 border-2 transition-all duration-200 text-left',
                  isSelected && 'border-amber-400 bg-amber-900/30 animate-pulse-glow',
                  !isSelected && canTarget && 'border-gray-700 bg-gray-800/50 hover:border-purple-500 cursor-pointer',
                  !isSelected && !canTarget && 'border-gray-800 bg-gray-900/30 cursor-not-allowed opacity-60',
                  isGuesser && !isSelected && 'border-purple-500 bg-purple-900/20',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                    isGuesser ? 'bg-purple-500' : 'bg-gradient-to-br from-gray-600 to-gray-700'
                  )}>
                    {player.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-sm">{player.name}</div>
                    <div className="text-xs text-amber-400 font-bold">{player.score} pts</div>
                  </div>
                  {isSelf && <span className="text-xs text-gray-600">(you)</span>}
                  {isGuesser && <span className="text-lg">🎯</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guess button */}
      {isMyTurn && (
        <button
          onClick={handleGuess}
          disabled={!selectedTarget}
          className="btn-gold w-full text-lg disabled:opacity-40 disabled:cursor-not-allowed animate-slide-up"
        >
          {selectedTarget
            ? `👆 Accuse ${room.players.find(p => p.id === selectedTarget)?.name}!`
            : 'Select a player to accuse'}
        </button>
      )}

      {/* Scoreboard */}
      <div className="card-glass p-4 w-full">
        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-3">Scoreboard</h3>
        <div className="space-y-2">
          {sortedPlayers.map((player, i) => (
            <div key={player.id} className="flex items-center gap-3">
              <span className="text-lg">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
              <span className="flex-1 font-medium text-sm">{player.name}</span>
              <span className="font-bold text-amber-400">{player.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
