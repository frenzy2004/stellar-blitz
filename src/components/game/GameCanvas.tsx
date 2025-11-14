import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameEngine } from '@/lib/game/GameEngine';

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onComboUpdate: (combo: number, multiplier: number) => void;
  onGameOver: (finalScore: number) => void;
  isPaused: boolean;
  onEngineReady?: (engine: GameEngine) => void;
}

export const GameCanvas = ({
  onScoreUpdate,
  onLivesUpdate,
  onComboUpdate,
  onGameOver,
  isPaused,
  onEngineReady
}: GameCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application();
    appRef.current = app;

    (async () => {
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x0a0a1a,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      const engine = new GameEngine(app, {
        onScoreUpdate,
        onLivesUpdate,
        onComboUpdate,
        onGameOver,
      });
      engineRef.current = engine;
      engine.start();

      if (onEngineReady) {
        onEngineReady(engine);
      }
    })();

    const handleResize = () => {
      if (appRef.current) {
        appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engineRef.current?.destroy();
      appRef.current?.destroy(true);
    };
  }, [onScoreUpdate, onLivesUpdate, onComboUpdate, onGameOver]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPaused(isPaused);
    }
  }, [isPaused]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 touch-none"
      style={{ touchAction: 'none' }}
    />
  );
};
