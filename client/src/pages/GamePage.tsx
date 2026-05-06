import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/PusherContext';
import GameBoard from '../games/RajaMantriChorSipahi/GameBoard';
import RoundEnd from '../games/RajaMantriChorSipahi/RoundEnd';
import GameOver from '../games/RajaMantriChorSipahi/GameOver';

export default function GamePage() {
  const navigate = useNavigate();
  const { room } = useGame();

  useEffect(() => {
    if (!room) navigate('/');
  }, [room, navigate]);

  if (!room) return null;

  if (room.phase === 'game-over') return <GameOver />;
  if (room.phase === 'round-end') return <RoundEnd />;
  if (room.phase === 'card-reveal' || room.phase === 'playing') return <GameBoard />;

  // Fallback — shouldn't normally reach here
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Loading game…
    </div>
  );
}
