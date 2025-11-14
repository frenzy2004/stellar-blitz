import { Button } from '@/components/ui/button';
import { RotateCcw, Home } from 'lucide-react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOver = ({ score, highScore, onRestart, onMenu }: GameOverProps) => {
  const isNewHighScore = score > highScore;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="text-center space-y-8 animate-slide-up px-4">
        {/* Game Over Title */}
        <div className="space-y-2">
          <h2 className="text-6xl md:text-8xl font-black text-destructive animate-pulse-glow font-orbitron">
            GAME OVER
          </h2>
          {isNewHighScore && (
            <div className="text-3xl font-bold text-accent animate-pulse-glow font-orbitron">
              🎉 NEW HIGH SCORE! 🎉
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="space-y-4">
          <div className="bg-card/80 backdrop-blur-sm border-2 border-primary/50 rounded-xl px-12 py-6 inline-block shadow-glow-cyan">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2 font-orbitron">Final Score</div>
            <div className="text-6xl font-black text-primary font-orbitron">{score.toLocaleString()}</div>
          </div>

          {!isNewHighScore && highScore > 0 && (
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-lg px-8 py-3 inline-block">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-orbitron">Best</div>
              <div className="text-2xl font-bold text-accent font-orbitron">{highScore.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={onRestart}
            size="lg"
            className="text-xl px-10 py-6 bg-primary hover:bg-primary-glow text-primary-foreground shadow-glow-cyan hover:shadow-glow-cyan hover:scale-105 transition-all font-orbitron font-bold"
          >
            <RotateCcw className="mr-3 h-6 w-6" />
            PLAY AGAIN
          </Button>
          <Button
            onClick={onMenu}
            size="lg"
            variant="outline"
            className="text-xl px-10 py-6 border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/20 text-foreground hover:shadow-glow-magenta hover:scale-105 transition-all font-orbitron font-bold"
          >
            <Home className="mr-3 h-6 w-6" />
            MAIN MENU
          </Button>
        </div>
      </div>
    </div>
  );
};
