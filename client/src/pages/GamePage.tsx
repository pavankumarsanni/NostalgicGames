import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/PusherContext';
import GameBoard from '../games/RajaMantriChorSipahi/GameBoard';
import RoundEnd from '../games/RajaMantriChorSipahi/RoundEnd';
import GameOver from '../games/RajaMantriChorSipahi/GameOver';
import ChitChaseBoard from '../games/ChitChase/GameBoard';
import ChitChaseWin from '../games/ChitChase/WinScreen';

export default function GamePage() {
  const navigate = useNavigate();
  const { room } = useGame();

  useEffect(() => {
    if (!room) navigate('/');
  }, [room, navigate]);

  if (!room) return null;

  // Chit Chase
  if (room.gameType === 'chit-chase') {
    if (room.ptcPhase === 'game-over') return <ChitChaseWin />;
    if (room.ptcPhase === 'selecting') return <ChitChaseBoard />;
  }

  // Raja Mantri
  if (room.phase === 'game-over') return <GameOver />;
  if (room.phase === 'round-end') return <RoundEnd />;
  if (room.phase === 'card-reveal') return <GameBoard />;

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading game…
    </div>
  );
}
