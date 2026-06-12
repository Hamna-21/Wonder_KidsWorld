/**
 * WonderKids Magical Sound Synthesizer
 * Uses HTML5 Web Audio API for safe, real-time audio generation.
 * No external file dependencies ensures 100% offline stability.
 */

class KidsSoundSynth {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.5; // 0.0 to 1.0
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialize to bypass browser autoplay policies
    if (typeof window !== "undefined") {
      this.loadSavedSettings();
    }
  }

  private loadSavedSettings() {
    try {
      const vol = localStorage.getItem("wonderkids-volume");
      if (vol !== null) this.masterVolume = parseFloat(vol);
      const mute = localStorage.getItem("wonderkids-muted");
      if (mute !== null) this.isMuted = JSON.parse(mute);
    } catch (e) {
      console.warn("Could not load volume settings:", e);
    }
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem("wonderkids-volume", this.masterVolume.toString());
    } catch (e) {}
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem("wonderkids-muted", JSON.stringify(muted));
    } catch (e) {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private createGainNode(ctx: AudioContext, duration: number): GainNode {
    const gainNode = ctx.createGain();
    const finalVolume = this.isMuted ? 0 : this.masterVolume;
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(finalVolume * 0.4, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    return gainNode;
  }

  // CAT: Says "Meow!" & Performs a jump animation
  public playMeow() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const osc = ctx.createOscillator();
      const gainNode = this.createGainNode(ctx, 0.4);

      osc.type = "sine";
      // Meow pitch sweep: start low, sweep high then glide down
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn("Meow play failed:", err);
    }
  }

  // DOG: Says "Woof!" & Wags tail
  public playWoof() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const osc = ctx.createOscillator();
      const gainNode = this.createGainNode(ctx, 0.18);

      osc.type = "triangle";
      // Woof pitch: quick low bark pitch slide
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

      // Low pass filter to make it warmer/fluffier
      const biquad = ctx.createBiquadFilter();
      biquad.type = "lowpass";
      biquad.frequency.setValueAtTime(400, ctx.currentTime);

      osc.connect(biquad);
      biquad.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (err) {
      console.warn("Woof play failed:", err);
    }
  }

  // BIRD: Chirps & Flaps wings
  public playChirp() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const playBirdChirp = (delay: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const finalVolume = this.isMuted ? 0 : this.masterVolume;

        osc.type = "sine";
        // Extremely fast bird chirp swoop
        osc.frequency.setValueAtTime(1500, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + delay + 0.08);

        gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(finalVolume * 0.25, ctx.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.09);
      };

      // Play double cheerful chirp
      playBirdChirp(0);
      playBirdChirp(0.12);
    } catch (err) {
      console.warn("Chirp play failed:", err);
    }
  }

  // MAGIC STAR: Sparkle explosion effect & Magical chime sound
  public playMagicChime() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6 pentatonic cascade

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const finalVolume = this.isMuted ? 0 : this.masterVolume;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gainNode.gain.setValueAtTime(0, now + idx * 0.05);
        gainNode.gain.linearRampToValueAtTime(finalVolume * 0.15, now + idx * 0.05 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.45);
      });
    } catch (err) {
      console.warn("Chime play failed:", err);
    }
  }

  // ROCKET: Launch animation & Whoosh sound effect
  public playRocketWhoosh() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const osc = ctx.createOscillator();
      const gainNode = this.createGainNode(ctx, 0.8);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.8);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(150, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.8);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (err) {
      console.warn("Rocket whoosh play failed:", err);
    }
  }

  // TREASURE CHEST: opens with coins popping out and reward sound
  public playTreasureChest() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const now = ctx.currentTime;
      // Synthesize elegant coins bounce (chink-chink!)
      const playCoin = (time: number, isHigh: boolean) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const finalVolume = this.isMuted ? 0 : this.masterVolume;

        osc.type = "sine";
        const freq1 = isHigh ? 987.77 : 880; // B5 / A5
        const freq2 = isHigh ? 1318.51 : 1174.66; // E6 / D6

        osc.frequency.setValueAtTime(freq1, now + time);
        osc.frequency.setValueAtTime(freq2, now + time + 0.08);

        gainNode.gain.setValueAtTime(0, now + time);
        gainNode.gain.linearRampToValueAtTime(finalVolume * 0.2, now + time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + time + 0.22);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + 0.25);
      };

      playCoin(0, false);
      playCoin(0.06, true);
      playCoin(0.15, true);
    } catch (err) {
      console.warn("Coin play failed:", err);
    }
  }

  // BOOK: opens with page flip sound
  public playPageFlip() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted || !ctx.createDelay) return;

      const now = ctx.currentTime;
      // White noise snippet to simulate rustle paper
      const bufferSize = ctx.sampleRate * 0.25; // 0.25 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Populate with noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Bandpass filter to make it rustle
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(2, now);

      const gainNode = ctx.createGain();
      const finalVolume = this.isMuted ? 0 : this.masterVolume;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(finalVolume * 0.3, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noiseNode.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseNode.start(now);
      noiseNode.stop(now + 0.26);
    } catch (err) {
      // Fallback sweep if noise buffer fails
      this.playGenericPop();
    }
  }

  // POP / TICK / GENERAL micro sound
  public playGenericPop() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const osc = ctx.createOscillator();
      const gainNode = this.createGainNode(ctx, 0.1);

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  // DRAGON / MONSTER growl/giggle
  public playDragonFlutter() {
    try {
      const ctx = this.initContext();
      if (!ctx || this.isMuted) return;

      const osc = ctx.createOscillator();
      const gainNode = this.createGainNode(ctx, 0.35);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      // Low rumble vibrato/flutter
      const modulator = ctx.createOscillator();
      modulator.frequency.value = 16; // 16Hz flutter
      const modulatorGain = ctx.createGain();
      modulatorGain.gain.value = 40;

      modulator.connect(modulatorGain);
      modulatorGain.connect(osc.frequency);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      modulator.start();
      osc.start();

      modulator.stop(ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // TTS helper kids phrases ("Wow!", "Yay!", "Great Job!", "Awesome!")
  public speakPhrase(phrase: string) {
    if (this.isMuted) return;
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.pitch = 1.45; // friendly children's high pitched tone
      utterance.rate = 1.05;  // fast and bright
      utterance.volume = this.masterVolume;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS speak failed:", e);
    }
  }
}

export const kidsSound = new KidsSoundSynth();
