import { Heart, Volume2, VolumeX, Music } from 'lucide-react';

interface GameHUDProps {
  score: number;
  lives: number;
  combo: number;
  multiplier: number;
  musicEnabled?: boolean;
  sfxEnabled?: boolean;
  onToggleMusic?: () => void;
  onToggleSFX?: () => void;
  showWeaponUpgrade?: boolean;
}

export const GameHUD = ({
  score,
  lives,
  combo,
  multiplier,
  musicEnabled = true,
  sfxEnabled = true,
  onToggleMusic,
  onToggleSFX,
  showWeaponUpgrade = false,
}: GameHUDProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top Bar */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-start px-6">
        {/* Score */}
        <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg px-6 py-3 shadow-glow-cyan">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-orbitron">Score</div>
          <div className="text-3xl font-bold text-primary font-orbitron">{score.toLocaleString()}</div>
        </div>

        {/* Lives */}
        <div className="bg-card/80 backdrop-blur-sm border border-destructive/30 rounded-lg px-6 py-3">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${
                  i < lives ? 'fill-destructive text-destructive' : 'text-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Weapon Upgrade Notification */}
      {showWeaponUpgrade && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-slide-up">
          <div className="bg-accent/95 backdrop-blur-sm border-2 border-accent rounded-xl px-12 py-6 shadow-glow-fire">
            <div className="text-center">
              <div className="text-2xl font-black text-foreground uppercase tracking-widest mb-2 font-orbitron">🔥 WEAPON UPGRADE! 🔥</div>
              <div className="text-lg font-bold text-foreground/90 font-orbitron">DUAL BLASTERS UNLOCKED</div>
            </div>
          </div>
        </div>
      )}

      {/* Combo Display */}
      {combo > 0 && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-slide-up">
          <div className="bg-secondary/90 backdrop-blur-sm border-2 border-secondary-glow rounded-xl px-8 py-4 shadow-glow-magenta">
            <div className="text-center">
              <div className="text-sm text-secondary-foreground uppercase tracking-widest mb-1 font-orbitron">Combo</div>
              <div className="text-5xl font-black text-foreground font-orbitron">{combo}</div>
              {multiplier > 1 && (
                <div className="text-xl font-bold text-accent mt-2 font-orbitron animate-pulse-glow">
                  {multiplier}x MULTIPLIER
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audio Controls */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {onToggleMusic && (
          <button
            onClick={onToggleMusic}
            className="pointer-events-auto bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg p-3 hover:bg-card transition-colors shadow-glow-cyan"
            aria-label="Toggle music"
          >
            {musicEnabled ? (
              <Music className="w-5 h-5 text-primary" />
            ) : (
              <Music className="w-5 h-5 text-muted-foreground line-through" />
            )}
          </button>
        )}
        {onToggleSFX && (
          <button
            onClick={onToggleSFX}
            className="pointer-events-auto bg-card/80 backdrop-blur-sm border border-secondary/30 rounded-lg p-3 hover:bg-card transition-colors shadow-glow-magenta"
            aria-label="Toggle sound effects"
          >
            {sfxEnabled ? (
              <Volume2 className="w-5 h-5 text-secondary" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Controls Hint (mobile) */}
      <div className="absolute bottom-6 left-6 md:hidden">
        <div className="bg-card/60 backdrop-blur-sm border border-primary/20 rounded-lg px-4 py-2">
          <div className="text-xs text-muted-foreground font-orbitron">Touch to Move & Shoot</div>
        </div>
      </div>
    </div>
  );
};
