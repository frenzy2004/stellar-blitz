import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { SoundManager } from '@/lib/game/audio/SoundManager';
import { useEffect, useRef } from 'react';

interface GameMenuProps {
  onStart: () => void;
  highScore: number;
}

export const GameMenu = ({ onStart, highScore }: GameMenuProps) => {
  const soundManagerRef = useRef<SoundManager | null>(null);

  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    return () => {
      soundManagerRef.current?.destroy();
    };
  }, []);

  const handleStartClick = () => {
    soundManagerRef.current?.playUIClick();
    onStart();
  };

  return (
    <div className="fixed inset-0 bg-gradient-space flex items-center justify-center z-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated stars background */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-8 animate-slide-up relative z-10">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-neon animate-pulse-glow font-orbitron">
            SPACE
          </h1>
          <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-fire animate-pulse-glow font-orbitron" style={{ animationDelay: '0.2s' }}>
            BLASTER
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground max-w-md mx-auto px-4 font-orbitron">
          Blast asteroids, build combos, and chase the high score
        </p>

        {/* High Score */}
        {highScore > 0 && (
          <div className="bg-card/60 backdrop-blur-sm border border-accent/30 rounded-lg px-8 py-4 inline-block shadow-glow-fire">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1 font-orbitron">High Score</div>
            <div className="text-4xl font-bold text-accent font-orbitron">{highScore.toLocaleString()}</div>
          </div>
        )}

        {/* Play Button */}
        <div className="pt-4">
          <Button
            onClick={handleStartClick}
            size="lg"
            className="text-2xl px-12 py-8 bg-primary hover:bg-primary-glow text-primary-foreground shadow-glow-cyan hover:shadow-glow-cyan hover:scale-105 transition-all font-orbitron font-bold"
          >
            <Play className="mr-3 h-8 w-8" />
            START GAME
          </Button>
        </div>

        {/* Controls Info */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-lg px-6 py-4 max-w-lg mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-foreground/80 mb-3">
            <Info className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wide text-sm font-orbitron">Controls</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1 font-orbitron">
            <p className="md:hidden">📱 Touch left side to move • Tap right to shoot</p>
            <p className="hidden md:block">⌨️ WASD or Arrow Keys to move • Space to shoot</p>
          </div>
        </div>
      </div>
    </div>
  );
};
