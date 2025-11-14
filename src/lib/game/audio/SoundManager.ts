export class SoundManager {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private sfxGain: GainNode;
  private musicGain: GainNode;
  private musicSource: AudioBufferSourceNode | null = null;
  private isMusicPlaying = false;
  private musicEnabled = true;
  private sfxEnabled = true;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.gain.value = 1.0;
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0.15;
    this.musicGain.connect(this.masterGain);
  }

  private createOscillator(
    frequency: number,
    type: OscillatorType,
    duration: number,
    startTime: number = 0
  ): OscillatorNode {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.start(this.audioContext.currentTime + startTime);
    oscillator.stop(this.audioContext.currentTime + startTime + duration);
    return oscillator;
  }

  public playBlasterShot() {
    if (!this.sfxEnabled) return;

    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    gain.connect(this.sfxGain);

    const osc1 = this.createOscillator(1200, 'sawtooth', 0.12);
    osc1.frequency.exponentialRampToValueAtTime(150, now + 0.12);
    osc1.connect(gain);

    const osc2 = this.createOscillator(2400, 'sine', 0.12);
    osc2.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    osc2.connect(gain);

    const osc3 = this.createOscillator(600, 'square', 0.12);
    osc3.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    const osc3Gain = this.audioContext.createGain();
    osc3Gain.gain.setValueAtTime(0.3, now);
    osc3.connect(osc3Gain);
    osc3Gain.connect(gain);

    const noise = this.createWhiteNoise(0.02);
    const noiseGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
  }

  public playHit() {
    if (!this.sfxEnabled) return;

    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    gain.connect(this.sfxGain);

    const osc = this.createOscillator(220, 'square', 0.15);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.15);
    osc.connect(gain);

    const noise = this.createWhiteNoise(0.1);
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
  }

  public playExplosion(size: 'small' | 'medium' | 'large') {
    if (!this.sfxEnabled) return;

    const now = this.audioContext.currentTime;
    const sizeMultiplier = size === 'large' ? 1.5 : size === 'medium' ? 1.2 : 1;
    const duration = 0.3 * sizeMultiplier;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.7 * sizeMultiplier, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    gain.connect(this.sfxGain);

    const osc1 = this.createOscillator(150 / sizeMultiplier, 'sawtooth', duration);
    osc1.frequency.exponentialRampToValueAtTime(30, now + duration);
    osc1.connect(gain);

    const osc2 = this.createOscillator(80 / sizeMultiplier, 'square', duration);
    osc2.frequency.exponentialRampToValueAtTime(20, now + duration);
    osc2.connect(gain);

    const noise = this.createWhiteNoise(duration);
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.6 * sizeMultiplier, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
  }

  public playUIClick() {
    if (!this.sfxEnabled) return;

    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    gain.connect(this.sfxGain);

    const osc = this.createOscillator(800, 'sine', 0.05);
    osc.connect(gain);
  }

  public playGameOver() {
    if (!this.sfxEnabled) return;

    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
    gain.connect(this.sfxGain);

    const notes = [440, 392, 349, 293];
    notes.forEach((freq, i) => {
      const osc = this.createOscillator(freq, 'triangle', 0.25, i * 0.25);
      osc.connect(gain);
    });
  }

  public playPowerUp() {
    if (!this.sfxEnabled) return;

    const now = this.audioContext.currentTime;
    const gain = this.audioContext.createGain();

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    gain.connect(this.sfxGain);

    const notes = [262, 330, 392, 523, 659];
    notes.forEach((freq, i) => {
      const delay = i * 0.08;
      const osc = this.createOscillator(freq, 'square', 0.15, delay);
      const oscGain = this.audioContext.createGain();
      oscGain.gain.setValueAtTime(0.3, now + delay);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);
      osc.connect(oscGain);
      oscGain.connect(gain);

      const osc2 = this.createOscillator(freq * 2, 'sine', 0.15, delay);
      const osc2Gain = this.audioContext.createGain();
      osc2Gain.gain.setValueAtTime(0.2, now + delay);
      osc2Gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);
      osc2.connect(osc2Gain);
      osc2Gain.connect(gain);
    });
  }

  private createWhiteNoise(duration: number): AudioBufferSourceNode {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.start(this.audioContext.currentTime);

    return source;
  }

  public startBackgroundMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;

    const loopDuration = 8;
    const bpm = 130;
    const beatDuration = 60 / bpm;

    const playLoop = () => {
      if (!this.musicEnabled) return;

      const now = this.audioContext.currentTime;

      const bassNotes = [110, 110, 146.83, 146.83, 130.81, 130.81, 98, 98];
      bassNotes.forEach((freq, i) => {
        const startTime = i * beatDuration;
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + beatDuration);
        gain.connect(this.musicGain);

        const osc = this.createOscillator(freq, 'sine', beatDuration, startTime);
        osc.connect(gain);
      });

      const chordNotes = [220, 277.18, 329.63];
      for (let beat = 0; beat < 8; beat += 2) {
        const startTime = beat * beatDuration;
        chordNotes.forEach((freq) => {
          const gain = this.audioContext.createGain();
          gain.gain.setValueAtTime(0.08, now + startTime);
          gain.gain.linearRampToValueAtTime(0.15, now + startTime + beatDuration);
          gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + beatDuration * 2);
          gain.connect(this.musicGain);

          const osc = this.createOscillator(freq, 'triangle', beatDuration * 2, startTime);
          osc.connect(gain);
        });
      }

      for (let i = 0; i < 8; i++) {
        const startTime = i * beatDuration;
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.1, now + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + 0.05);
        gain.connect(this.musicGain);

        const noise = this.createWhiteNoise(0.05);
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;

        noise.connect(filter);
        filter.connect(gain);
      }

      setTimeout(playLoop, loopDuration * 1000);
    };

    this.isMusicPlaying = true;
    playLoop();
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;

    if (!this.musicEnabled) {
      this.stopBackgroundMusic();
    } else if (!this.isMusicPlaying) {
      this.startBackgroundMusic();
    }

    return this.musicEnabled;
  }

  public toggleSFX(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public isSFXEnabled(): boolean {
    return this.sfxEnabled;
  }

  public destroy() {
    this.stopBackgroundMusic();
    this.audioContext.close();
  }
}
