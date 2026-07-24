// High-performance procedural audio synthesizer for THEND premium tactile feedback
class SoundEngine {
  private ctx: AudioContext | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private isDroneRunning: boolean = false;

  private init() {
    if (!this.ctx) {
      // Lazy init to bypass browser audio block until user interaction
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Brief tactile tick on hover
  playHover() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Fail silently if audio context is blocked
    }
  }

  // Solid tick on action select
  playSelect() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      // Safe
    }
  }

  // High-frequency holographic warp transition
  playWarp() {
    this.init();
    if (!this.ctx) return;
    try {
      const duration = 0.4;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Safe
    }
  }

  // Run complex FM sweep diagnostic
  playDiagnostic(frequency: number) {
    this.init();
    if (!this.ctx) return;
    try {
      const duration = 1.8;
      const now = this.ctx.currentTime;
      
      // Carrier
      const carrier = this.ctx.createOscillator();
      const carrierGain = this.ctx.createGain();
      
      // Modulator
      const modulator = this.ctx.createOscillator();
      const modulatorGain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(frequency * 50, now);
      carrier.frequency.exponentialRampToValueAtTime(120, now + duration);

      modulator.type = 'sawtooth';
      modulator.frequency.setValueAtTime(20, now);
      modulator.frequency.linearRampToValueAtTime(140, now + duration);

      modulatorGain.gain.setValueAtTime(150, now);
      modulatorGain.gain.linearRampToValueAtTime(10, now + duration);

      carrierGain.gain.setValueAtTime(0.001, now);
      carrierGain.gain.linearRampToValueAtTime(0.05, now + 0.1);
      carrierGain.gain.linearRampToValueAtTime(0.02, now + duration - 0.4);
      carrierGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Connect FM
      modulator.connect(modulatorGain);
      modulatorGain.connect(carrier.frequency);
      
      carrier.connect(carrierGain);
      carrierGain.connect(this.ctx.destination);

      modulator.start();
      carrier.start();
      
      modulator.stop(now + duration);
      carrier.stop(now + duration);
    } catch (e) {
      // Safe
    }
  }

  // High-frequency digital ping for visual scans
  playPing() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.exponentialRampToValueAtTime(3500, now + 0.05);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(now + 0.12);
    } catch (e) {
      // Safe
    }
  }

  // Start continuous core reactor drone
  startDrone(freqMultiplier: number) {
    this.init();
    if (!this.ctx || this.isDroneRunning) return;
    try {
      const now = this.ctx.currentTime;
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneFilter = this.ctx.createBiquadFilter();

      this.droneOsc.type = 'sawtooth';
      // Luxury low frequency (e.g., base 55Hz or 65Hz)
      const baseFreq = 55 * (freqMultiplier || 1);
      this.droneOsc.frequency.setValueAtTime(baseFreq, now);

      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(120, now);
      this.droneFilter.Q.setValueAtTime(5, now);

      // Modulate lowpass filter with slow sine wave
      const filterLfo = this.ctx.createOscillator();
      const filterLfoGain = this.ctx.createGain();
      filterLfo.type = 'sine';
      filterLfo.frequency.setValueAtTime(0.2, now); // 0.2 Hz cycle
      filterLfoGain.gain.setValueAtTime(40, now); // Sweep filter +-40Hz

      filterLfo.connect(filterLfoGain);
      filterLfoGain.connect(this.droneFilter.frequency);
      filterLfo.start();

      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.linearRampToValueAtTime(0.025, now + 1.0); // smooth fade-in

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc.start();
      this.isDroneRunning = true;
    } catch (e) {
      // Safe
    }
  }

  // Update drone attributes in real-time based on frequency configurations
  updateDrone(freqMultiplier: number) {
    if (!this.ctx || !this.isDroneRunning || !this.droneOsc || !this.droneFilter) return;
    try {
      const targetFreq = 55 * (0.8 + freqMultiplier / 6);
      this.droneOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
      
      const targetCutoff = 100 + freqMultiplier * 30;
      this.droneFilter.frequency.setTargetAtTime(targetCutoff, this.ctx.currentTime, 0.5);
    } catch (e) {
      // Safe
    }
  }

  stopDrone() {
    if (!this.isDroneRunning) return;
    try {
      const now = this.ctx ? this.ctx.currentTime : 0;
      if (this.droneGain && this.ctx) {
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        setTimeout(() => {
          if (this.droneOsc) {
            try { this.droneOsc.stop(); } catch (err) {}
            this.droneOsc = null;
          }
          this.isDroneRunning = false;
        }, 600);
      } else {
        this.isDroneRunning = false;
      }
    } catch (e) {
      this.isDroneRunning = false;
    }
  }
}

export const Sound = new SoundEngine();
