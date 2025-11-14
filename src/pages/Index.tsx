import { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameHUD } from '@/components/game/GameHUD';
import { GameMenu } from '@/components/game/GameMenu';
import { GameOver } from '@/components/game/GameOver';

type GameState = 'menu' | 'playing' | 'gameOver';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spaceBlasterHighScore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const handleStart = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setCombo(0);
    setMultiplier(1);
    setGameKey(prev => prev + 1); // Force remount of game canvas
  }, []);

  const handleGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setGameState('gameOver');
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('spaceBlasterHighScore', score.toString());
    }
  }, [highScore]);

  const handleMenu = useCallback(() => {
    setGameState('menu');
  }, []);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleLivesUpdate = useCallback((newLives: number) => {
    setLives(newLives);
  }, []);

  const handleComboUpdate = useCallback((newCombo: number, newMultiplier: number) => {
    setCombo(newCombo);
    setMultiplier(newMultiplier);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-space overflow-hidden">
      {gameState === 'menu' && (
        <GameMenu onStart={handleStart} highScore={highScore} />
      )}

      {gameState === 'playing' && (
        <>
          <GameCanvas
            key={gameKey}
            onScoreUpdate={handleScoreUpdate}
            onLivesUpdate={handleLivesUpdate}
            onComboUpdate={handleComboUpdate}
            onGameOver={handleGameOver}
            isPaused={false}
          />
          <GameHUD
            score={score}
            lives={lives}
            combo={combo}
            multiplier={multiplier}
          />
        </>
      )}

      {gameState === 'gameOver' && (
        <GameOver
          score={finalScore}
          highScore={highScore}
          onRestart={handleStart}
          onMenu={handleMenu}
        />
      )}
    </div>
  );
};

export default Index;
