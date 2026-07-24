import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Zap, Palette, Compass, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { ActiveOverlay, CustomizerConfig } from '../types';
import { Sound } from './SoundManager';

interface InfoOverlayProps {
  activeOverlay: ActiveOverlay;
  onClose: () => void;
  config: CustomizerConfig;
  onChangeConfig: (newConfig: Partial<CustomizerConfig>) => void;
}

export default function InfoOverlay({
  activeOverlay,
  onClose,
  config,
  onChangeConfig,
}: InfoOverlayProps) {
  const [toast, setToast] = useState<string | null>(null);
  
  const playClick = () => {
    Sound.playSelect();
  };

  const playClose = () => {
    Sound.playWarp();
    onClose();
  };

  const getOverlayContent = () => {
    switch (activeOverlay) {
      case 'chronos':
        return {
          title: 'CHRONOS CONTROLLER',
          subtitle: 'Temporal Dilation & Time-stream Quantization',
          icon: Clock,
          color: 'text-gold-400',
          borderColor: 'border-gold-500/20',
          glowColor: 'shadow-gold-500/10',
          copy: 'The Chronos module controls the local relativistic velocity of THEND Core. By altering the gravitational curvature factor around the internal temporal resonator, users can expand or contract cognitive time perceptions by up to 800%.',
          controls: (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">TEMPORAL DILATION RATE</span>
                  <span className="text-gold-400 font-medium">{config.dilationFactor.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={config.dilationFactor}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeConfig({ dilationFactor: val });
                    Sound.playHover();
                  }}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>1.0x (Standard Earth)</span>
                  <span>8.0x (Hyper Dilation)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">RESONATOR FREQUENCY</span>
                  <span className="text-gold-400 font-medium">{config.frequency.toFixed(2)} GHz</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.1"
                  value={config.frequency}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeConfig({ frequency: val });
                    Sound.playHover();
                  }}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>1.00 GHz (Sub-band)</span>
                  <span>12.00 GHz (Cosmic Band)</span>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg space-y-3">
                <h4 className="text-xs font-mono text-gold-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-gold-500 animate-pulse" /> RELATIVISTIC TELEMETRY
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className="bg-neutral-950 p-2 border border-neutral-900 rounded">
                    <p className="text-gray-500">COGNITIVE RATIO</p>
                    <p className="text-white font-medium">1m : {(1 * config.dilationFactor).toFixed(1)}m</p>
                  </div>
                  <div className="bg-neutral-950 p-2 border border-neutral-900 rounded">
                    <p className="text-gray-500">QUANTIZATION ERR</p>
                    <p className="text-emerald-500 font-medium">0.0000021%</p>
                  </div>
                </div>
              </div>
            </div>
          ),
          specs: [
            { name: 'Crystal Resonance', value: '144.12 T-Scale' },
            { name: 'Field Curvature Index', value: '6.71 x 10^-12 G' },
            { name: 'Thermal Dissipation', value: '0.004 W (Active)' },
          ],
        };

      case 'neural':
        return {
          title: 'NEURAL LINK INTERFACE',
          subtitle: 'Bio-electronic Cognitive Synapse Synchronization',
          icon: Zap,
          color: 'text-cyan-400',
          borderColor: 'border-cyan-500/20',
          glowColor: 'shadow-cyan-500/10',
          copy: 'The Neural Link is the cognitive bridge of THEND. Through high-fidelity dry-electrode electromagnetic sync, the core aligns with your neural wave cycles, allowing thoughts, actions, and temporal manipulation commands to be performed natively.',
          controls: (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">SYNAPSE CONNECTION STRENGTH</span>
                  <span className="text-cyan-400 font-medium">{config.syncRate}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={config.syncRate}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onChangeConfig({ syncRate: val });
                    Sound.playHover();
                  }}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>10% (Passive)</span>
                  <span>100% (Absolute Transcendence)</span>
                </div>
              </div>

              {/* Brainwave state preset selectors */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">COGNITIVE SYNC SPECTRUM</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { name: 'ALPHA (Flow State)', rate: 45, freq: 4.5 },
                    { name: 'BETA (High Cognition)', rate: 70, freq: 7.2 },
                    { name: 'THETA (Deep Astral)', rate: 90, freq: 9.8 },
                    { name: 'GAMMA (Super-Conscious)', rate: 100, freq: 11.5 },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        onChangeConfig({ syncRate: preset.rate, frequency: preset.freq });
                        playClick();
                      }}
                      className={`p-2.5 rounded border text-left transition-all ${
                        config.syncRate === preset.rate
                          ? 'border-cyan-500 bg-cyan-950/20 text-white'
                          : 'border-neutral-800 bg-neutral-900/30 text-gray-400 hover:border-neutral-700'
                      }`}
                    >
                      <p className="text-[10px] font-semibold">{preset.name}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">Preset Freq: {preset.freq}GHz</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg space-y-3">
                <h4 className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> BIOMETRIC COMPATIBILITY
                </h4>
                <p className="text-[10px] font-mono text-gray-400 leading-relaxed">
                  Deca-channel cortex sync calibrated. Safe for prolonged use up to 18 consecutive hours. Autonomic systems bypass strictly enforced.
                </p>
              </div>
            </div>
          ),
          specs: [
            { name: 'Transceiver Density', value: '12,000 Micro-Nodes' },
            { name: 'Encryption Protocol', value: 'Quantum Cryptographic-5' },
            { name: 'Sync Tolerance', value: '< 1.4 Nanoseconds' },
          ],
        };

      case 'aesthetic':
        return {
          title: 'HOLO-AESTHETIC PORTFOLIO',
          subtitle: 'Luxury Structural Materials & Core Optical Design',
          icon: Palette,
          color: 'text-purple-400',
          borderColor: 'border-purple-500/20',
          glowColor: 'shadow-purple-500/10',
          copy: 'THEND is a perfect union of high physics and luxury craft. Choose from space-grade aerospace Titanium, high-gloss non-refractive Mirror Obsidian, deep Stellar Gold, or our self-illuminating holographic solid Translucent Polymer.',
          controls: (
            <div className="space-y-6 mt-6">
              {/* Material Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400">CHASSIS MATERIAL SELECTION</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { id: 'titanium', name: 'TITANIUM BLACK', desc: 'Matte dark sandblasted finish' },
                    { id: 'obsidian', name: 'MIRROR OBSIDIAN', desc: 'High gloss non-refractive glass' },
                    { id: 'stellar', name: 'STELLAR BRUSHED GOLD', desc: '24k atom-sputtered coating' },
                    { id: 'polymer', name: 'GLOW TRANS-POLYMER', desc: 'Self-illuminating physical mesh' },
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => {
                        onChangeConfig({ material: mat.id as any });
                        playClick();
                      }}
                      className={`p-2.5 rounded border text-left transition-all ${
                        config.material === mat.id
                          ? 'border-purple-500 bg-purple-950/20 text-white'
                          : 'border-neutral-800 bg-neutral-900/30 text-gray-400 hover:border-neutral-700'
                      }`}
                    >
                      <p className="text-[10px] font-bold">{mat.name}</p>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{mat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Laser Core Color Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-gray-400">CORE LASER SPECTRUM WAVE</label>
                <div className="flex gap-3">
                  {[
                    { name: 'Chrono Crimson', color: '#ff3e00' },
                    { name: 'Hyper Teal', color: '#0df' },
                    { name: 'Plum Void', color: '#bd00ff' },
                    { name: 'Vibrant Ruby', color: '#ef4444' },
                  ].map((laser) => (
                    <button
                      key={laser.color}
                      onClick={() => {
                        onChangeConfig({ laserColor: laser.color, laserName: laser.name });
                        playClick();
                      }}
                      className={`flex-1 p-2 rounded border text-center transition-all flex flex-col items-center gap-1.5 ${
                        config.laserColor === laser.color
                          ? 'border-white bg-white/5 text-white'
                          : 'border-neutral-800 bg-neutral-900/10 text-gray-400 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: laser.color }}
                      />
                      <span className="text-[8px] font-mono whitespace-nowrap">{laser.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle Count/Density */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">HOLOGRAM ENERGY DENSITY</span>
                  <span className="text-purple-400 font-medium">{config.particleCount} PARTICLES</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="350"
                  step="10"
                  value={config.particleCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onChangeConfig({ particleCount: val });
                    Sound.playHover();
                  }}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>60 (Conserve energy)</span>
                  <span>350 (Ultra-Detailed)</span>
                </div>
              </div>
            </div>
          ),
          specs: [
            { name: 'Chassis Density', value: '4.51 g/cm³ (Light)' },
            { name: 'Resistor Refractive', value: '0.001 % (Obsidian)' },
            { name: 'Laser Lifetime', value: '100,000 Cosmic-Hours' },
          ],
        };

      case 'astral':
        return {
          title: 'ASTRAL MAP NAVIGATION',
          subtitle: 'Multi-dimensional Vector Orbital Position Tracking',
          icon: Compass,
          color: 'text-amber-400',
          borderColor: 'border-amber-500/20',
          glowColor: 'shadow-amber-500/10',
          copy: 'THEND contains an integrated celestial navigation index. It locks directly onto pulsars and orbital galactic beacons in real-time, bypassing typical Earth-bound geographical tracking systems to provide true astronomical telemetry.',
          controls: (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">ORBITAL ROTATIONAL VELOCITY</span>
                  <span className="text-amber-400 font-medium">{config.rotationSpeed.toFixed(1)}x Speed</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={config.rotationSpeed}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeConfig({ rotationSpeed: val });
                    Sound.playHover();
                  }}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>0.2x (Sub-rotation)</span>
                  <span>4.0x (Cosmic Spin)</span>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-lg space-y-3">
                <h4 className="text-xs font-mono text-amber-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" /> CELESTIAL BEACON CALIBRATION
                </h4>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">MOCK COORD ALIGN:</span>
                    <span className="text-white">DEC: -32.1819° / RA: 12h 45m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PULSAR CLOCK DELAY:</span>
                    <span className="text-white">0.00281s</span>
                  </div>
                  <button
                    onClick={() => {
                      Sound.playDiagnostic(config.frequency);
                      setToast('Astral Core successfully re-aligned with Sagittarius A* celestial meridian. Relativistic drift offset corrected to 0.000ns.');
                      setTimeout(() => setToast(null), 4500);
                    }}
                    className="w-full mt-2 py-1.5 text-center border border-amber-500/30 text-amber-400 bg-amber-950/10 hover:bg-amber-950/30 transition-all rounded text-[9px] tracking-widest font-bold"
                  >
                    CALIBRATE GALACTIC MERIDIAN
                  </button>
                </div>
              </div>
            </div>
          ),
          specs: [
            { name: 'Tracking Sensors', value: 'Dual Hex-Pulsar' },
            { name: 'Galactic Horizon Lock', value: '1.4 Arc-Seconds' },
            { name: 'Drift Compensation', value: 'Autopilot Phase' },
          ],
        };

      default:
        return null;
    }
  };

  const currentContent = getOverlayContent();

  return (
    <AnimatePresence>
      {activeOverlay !== 'none' && currentContent && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden select-none pointer-events-none">
          {/* Black gradient backdrop overlay so the user can see the specs perfectly */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={playClose}
            className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-[2px]"
          />

          {/* Core Info Slide Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="relative w-full max-w-md md:max-w-lg h-full glass-panel border-l border-neutral-900 shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto pointer-events-auto"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-gold-500 tracking-widest uppercase font-bold">
                    SYSTEM MODULE SPEC
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white flex items-center gap-2">
                    <currentContent.icon className={`w-5.5 h-5.5 ${currentContent.color}`} />
                    {currentContent.title}
                  </h2>
                </div>
                
                <button
                  onClick={playClose}
                  className="p-2 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-mono text-gray-500 tracking-wide mt-2">
                {currentContent.subtitle}
              </p>

              <hr className="border-neutral-900 my-5" />

              {/* Main Technical Copy */}
              <p className="text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
                {currentContent.copy}
              </p>

              {/* Interconnected Controllers inside overlay */}
              {currentContent.controls}
            </div>

            {/* Footer Specifications Table */}
            <div className="mt-8 pt-6 border-t border-neutral-900 space-y-4">
              <h3 className="text-[10px] font-mono text-gray-500 tracking-widest font-bold">
                PHYSICAL & CORE METRICS
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {currentContent.specs.map((spec, i) => (
                  <div key={i} className="bg-neutral-900/30 p-2.5 rounded border border-neutral-900/60 font-mono">
                    <p className="text-[9px] text-gray-500 uppercase">{spec.name}</p>
                    <p className="text-[11px] text-white font-medium mt-1 leading-tight">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="text-[9px] font-mono text-gray-600 text-center pt-2">
                PRODUCT SERIAL ID: ND-01991.68 / DEPLOYED IN PRE-REVOLUTION LABS
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Holographic Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-neutral-950/95 backdrop-blur-md border border-amber-500/30 text-amber-400 p-4 rounded shadow-2xl font-mono text-[10px] flex items-center gap-3.5 max-w-sm pointer-events-auto"
          >
            <Compass className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
            <div className="flex-1 leading-normal">
              <span className="font-bold block uppercase tracking-widest text-[8px] text-gray-500 mb-0.5">BEACON LOCKED</span>
              {toast}
            </div>
            <button 
              onClick={() => setToast(null)}
              className="p-1 hover:text-white text-gray-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
