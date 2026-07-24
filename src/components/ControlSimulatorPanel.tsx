import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Activity, Settings2, ShieldAlert, Cpu, Layers, Sparkles, Sun, Moon, Clock } from 'lucide-react';
import { CoreMode, CustomizerConfig } from '../types';
import { Sound } from './SoundManager';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

function Tooltip({ children, content }: TooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <div 
      className="relative flex items-center w-full"
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 p-2 glass-panel border border-gold-500/20 text-[9px] font-mono text-gray-300 rounded shadow-lg pointer-events-none text-center"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ControlSimulatorPanelProps {
  config: CustomizerConfig;
  onChangeConfig: (newConfig: Partial<CustomizerConfig>) => void;
  activeMode: CoreMode;
  onChangeMode: (mode: CoreMode) => void;
  onOpenCheckout: () => void;
  dayNightMode: 'real-time' | 'cyclic' | 'manual';
  onChangeDayNightMode: (mode: 'real-time' | 'cyclic' | 'manual') => void;
  manualHour: number;
  onChangeManualHour: (hour: number) => void;
  currentHour: number;
}

export default function ControlSimulatorPanel({
  config,
  onChangeConfig,
  activeMode,
  onChangeMode,
  onOpenCheckout,
  dayNightMode,
  onChangeDayNightMode,
  manualHour,
  onChangeManualHour,
  currentHour,
}: ControlSimulatorPanelProps) {
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [systemAlerts, setSystemAlerts] = useState<string[]>([
    'SYSTEM INTEGRITY: OPTIMAL',
    'CHRONO DURATION DETECTED: Earth Standard',
    'CORTICAL BRIDGE: Standby',
  ]);

  // Calibration target markers representing the optimal celestial orbit
  const targetFreq = 5.60;
  const targetDilation = 3.50;
  const targetSync = 80;

  // Live matching percentage algorithm
  const deltaF = Math.abs(config.frequency - targetFreq);
  const deltaD = Math.abs(config.dilationFactor - targetDilation);
  const deltaS = Math.abs(config.syncRate - targetSync);
  const resonanceScore = Math.max(0, Math.min(100, Math.round(100 - (deltaF * 15 + deltaD * 10 + deltaS * 0.4))));

  const oscRef = useRef<HTMLCanvasElement | null>(null);

  // Smooth ease-out auto-sync sweep
  const handleAutoSync = () => {
    if (isSyncing || !isPowerOn) return;
    setIsSyncing(true);
    Sound.playWarp();
    setSystemAlerts((prev) => ['AUTO-CALIBRATION: INITIATED', 'ALIGNING WAVE CORES...', ...prev.slice(0, 2)]);

    const startFreq = config.frequency;
    const startDilation = config.dilationFactor;
    const startSync = config.syncRate;

    let progress = 0;
    const duration = 1500; // 1.5s
    const steps = 50;

    const timer = setInterval(() => {
      progress += 1 / steps;
      if (progress >= 1.0) {
        clearInterval(timer);
        onChangeConfig({
          frequency: targetFreq,
          dilationFactor: targetDilation,
          syncRate: targetSync,
        });
        setIsSyncing(false);
        setSystemAlerts((prev) => [
          'RESONANCE ENGAGED: 100.00%',
          'CORTEX COUPLING: EXCELLENT',
          ...prev.slice(0, 2)
        ]);
        Sound.playSelect();
      } else {
        const t = 1 - Math.pow(1 - progress, 2); // quadratic ease-out
        onChangeConfig({
          frequency: parseFloat((startFreq + (targetFreq - startFreq) * t).toFixed(2)),
          dilationFactor: parseFloat((startDilation + (targetDilation - startDilation) * t).toFixed(2)),
          syncRate: Math.round(startSync + (targetSync - startSync) * t),
        });
        if (Math.random() < 0.15) Sound.playHover();
      }
    }, duration / steps);
  };

  // Oscilloscope canvas render loop
  useEffect(() => {
    const canvas = oscRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const drawOscilloscope = () => {
      if (!canvas || !ctx) return;
      const width = (canvas.width = canvas.parentElement?.clientWidth || 300);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 65);

      ctx.clearRect(0, 0, width, height);

      // Cyber Grid
      ctx.strokeStyle = 'rgba(255, 62, 0, 0.03)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerY = height / 2;

      if (isPowerOn) {
        // 1. Draw Target Calibration Wave (dotted red/orange)
        ctx.strokeStyle = 'rgba(255, 62, 0, 0.22)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const theta = (x / width) * Math.PI * 4 + phase;
          const y = centerY + Math.sin(theta) * (height * 0.22);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // 2. Draw Active Device Wave (glowing laser color)
        ctx.strokeStyle = config.laserColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const theta = (x / width) * Math.PI * (config.frequency * 0.7) + phase * (config.dilationFactor * 0.4);
          const amp = (height * 0.25) * (config.syncRate / 100);
          const y = centerY + Math.sin(theta) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.03 * config.dilationFactor;
      } else {
        // Flat line when hibernated
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(drawOscilloscope);
    };

    drawOscilloscope();
    return () => cancelAnimationFrame(animationId);
  }, [config.frequency, config.dilationFactor, config.syncRate, config.laserColor, isPowerOn]);

  // Handle core engine power switch
  const handlePowerToggle = () => {
    Sound.playSelect();
    if (isPowerOn) {
      Sound.stopDrone();
      setIsPowerOn(false);
      setSystemAlerts((prev) => ['REACTOR ENGINE: OFFLINE', 'HOLOGRAPHIC EMITTER: STANDBY', ...prev.slice(0, 2)]);
    } else {
      setIsPowerOn(true);
      Sound.startDrone(config.frequency / 6);
      setSystemAlerts((prev) => ['REACTOR ENGINE: ONLINE', 'CORTEX SYNAPSE CONNECTED', ...prev.slice(0, 2)]);
    }
  };

  // Run a visual diagnostic scanning procedure
  const handleRunDiagnostic = () => {
    if (isScanning || !isPowerOn) return;
    setIsScanning(true);
    setScanProgress(0);
    Sound.playDiagnostic(config.frequency);
    
    setSystemAlerts((prev) => ['RUNNING SPATIAL CALIBRATION...', 'SCANNING TEMPORAL FLUX...', ...prev.slice(0, 2)]);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setSystemAlerts((prevAlerts) => [
            'CALIBRATION COMPLETE: Drift 0.00ns',
            'FIELD CURVATURE: STABLE [99.98%]',
            'ALL CORES SYNCHRONIZED',
            ...prevAlerts.slice(0, 1),
          ]);
          return 100;
        }
        return prev + 8;
      });
    }, 100);
  };

  // Keep Audio Drone synchronized with live customizer frequency tweaks!
  useEffect(() => {
    if (isPowerOn) {
      Sound.startDrone(config.frequency / 6);
    }
    return () => {
      Sound.stopDrone();
    };
  }, []);

  useEffect(() => {
    if (isPowerOn) {
      Sound.updateDrone(config.frequency);
    }
  }, [config.frequency, isPowerOn]);

  return (
    <div className="glass-panel rounded-lg p-6 md:p-8 flex flex-col gap-6 min-h-[480px] w-full relative select-none">
      
      {/* Decorative cyber grid accent lines */}
      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      {/* Title telemetry */}
      <div className="flex justify-between items-center pb-2.5 border-b border-neutral-900">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPowerOn ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono tracking-widest text-gold-400 font-bold">
            THEND // CORE SIMULATOR CONTROL DECK
          </span>
        </div>
        <span className="text-[9px] font-mono text-gray-500">
          SECURE SECTOR 0.1
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        
        {/* Module 1: Reactor Power & Scans */}
        <div className="space-y-3 glass-panel-subtle p-3 rounded border border-neutral-900">
          <label className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
            01 / OPERATIONAL POWER
          </label>
          <div className="flex gap-2">
            {/* Power Button */}
            <Tooltip content="Toggles the primary reactor engine power state. Disabling will hibernate holographic emitters.">
              <button
                onClick={handlePowerToggle}
                className={`w-full py-3 px-3 rounded flex items-center justify-center gap-2 text-xs font-mono transition-all border ${
                  isPowerOn
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-950/20 border-red-500/40 text-red-400 hover:bg-red-900/10'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{isPowerOn ? 'ACTIVE' : 'HIBERNATED'}</span>
              </button>
            </Tooltip>

            {/* Run Diagnostic Scan */}
            <Tooltip content="Initiates a deep spatial calibration scan to detect temporal flux drift.">
              <button
                disabled={!isPowerOn || isScanning}
                onClick={handleRunDiagnostic}
                className={`px-3 py-3 rounded flex items-center justify-center border transition-all text-xs font-mono shrink-0 ${
                  !isPowerOn
                    ? 'opacity-40 border-neutral-800 text-gray-600 cursor-not-allowed'
                    : isScanning
                    ? 'bg-neutral-800 border-neutral-700 text-yellow-500 animate-pulse'
                    : 'bg-neutral-900 border-neutral-800 text-gold-400 hover:border-gold-500/30'
                }`}
              >
                <Activity className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* Core scan progress bar */}
          {isScanning && (
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-mono text-gray-500">
                <span>DIAGNOSTIC CALIBRATION</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-neutral-950 h-1 rounded overflow-hidden">
                <div className="bg-gold-500 h-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Module 2: Relativistic Dilation control */}
        <div className="space-y-3 glass-panel-subtle p-3 rounded border border-neutral-900">
          <label className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
            02 / TEMPORAL VECTOR
          </label>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>DILATION RATIO</span>
              <span className="text-white font-medium">{config.dilationFactor.toFixed(2)}x</span>
            </div>
            <Tooltip content="Adjusts the relativistic time dilation of the physical core spin and audio drone envelope.">
              <input
                type="range"
                disabled={!isPowerOn}
                min="1.0"
                max="8.0"
                step="0.1"
                value={config.dilationFactor}
                onChange={(e) => {
                  onChangeConfig({ dilationFactor: parseFloat(e.target.value) });
                  Sound.playHover();
                }}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-gold-500 disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </Tooltip>
            <div className="flex justify-between text-[8px] text-gray-500 font-mono">
              <span>1.0x (Ground)</span>
              <span>8.0x (Cosmic)</span>
            </div>
          </div>
        </div>

        {/* Module 3: Active Custom Mode Switch */}
        <div className="space-y-3 glass-panel-subtle p-3 rounded border border-neutral-900">
          <label className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
            03 / CORE SIMULATION MODE
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
            {([
              { id: 'TEMPORAL', label: 'CHRONOS' },
              { id: 'NEURAL', label: 'NEURAL' },
              { id: 'AESTHETIC', label: 'HOLO-SPEC' },
              { id: 'ASTRAL', label: 'ASTRAL' },
            ] as const).map((mode) => (
              <React.Fragment key={mode.id}>
                <Tooltip content={`Engages the ${mode.label} simulation sequence, altering real-time physical properties and rendering modes.`}>
                  <button
                    disabled={!isPowerOn}
                    onClick={() => {
                      onChangeMode(mode.id);
                      Sound.playSelect();
                    }}
                    className={`w-full py-1.5 rounded text-center border transition-all ${
                      !isPowerOn
                        ? 'opacity-30 border-neutral-900 text-gray-700 cursor-not-allowed'
                        : activeMode === mode.id
                        ? 'bg-gold-500 border-gold-400 text-black font-bold'
                        : 'border-neutral-800 bg-neutral-950/60 text-gray-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                </Tooltip>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Module 4: Celestial Day & Night Timelock */}
        <div className="space-y-2.5 glass-panel-subtle p-3 rounded border border-neutral-900 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
              04 / CELESTIAL TIMELOCK
            </label>
            <Clock className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
          </div>

          {/* Orbit View & Current Status Text */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-mono">
              <span className="text-gold-400 font-bold tracking-wider uppercase">
                {currentHour >= 5 && currentHour < 8 && '🌅 DAWN'}
                {currentHour >= 8 && currentHour < 17 && '☀️ HIGH NOON'}
                {currentHour >= 17 && currentHour < 19.5 && '🌇 GOLDEN HOUR'}
                {currentHour >= 19.5 && currentHour < 22 && '🌌 TWILIGHT'}
                {(currentHour >= 22 || currentHour < 5) && '🌙 MIDNIGHT'}
              </span>
              <span className="text-white font-bold">
                {Math.floor(currentHour).toString().padStart(2, '0')}:
                {Math.floor((currentHour * 60) % 60).toString().padStart(2, '0')}:
                {Math.floor((currentHour * 3600) % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Orbit SVG Track */}
            <div className="h-9 bg-neutral-950/40 border border-neutral-900/60 rounded flex items-center justify-center overflow-hidden relative">
              <svg className="w-full h-9 absolute bottom-0 left-0 animate-fade-in" viewBox="0 0 100 40">
                <path d="M 12 34 A 38 24 0 0 1 88 34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="5" y1="34" x2="95" y2="34" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                {(() => {
                  const isDay = currentHour >= 6 && currentHour < 18;
                  const t = isDay ? (currentHour - 6) / 12 : (currentHour >= 18 ? currentHour - 18 : currentHour + 6) / 12;
                  const angle = Math.PI * t;
                  const cx = 50 + 38 * Math.cos(Math.PI - angle);
                  const cy = 34 - 24 * Math.sin(angle);
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="3.5" className={isDay ? "fill-amber-400" : "fill-indigo-300"} />
                      {isDay ? (
                        <circle cx={cx} cy={cy} r="6" className="stroke-amber-400/30 stroke-[0.5] fill-none animate-ping" />
                      ) : (
                        <circle cx={cx} cy={cy} r="5" className="stroke-indigo-300/30 stroke-[0.5] fill-none animate-pulse" />
                      )}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Sync Mode buttons */}
          <div className="grid grid-cols-3 gap-1 text-[8px] font-mono">
            {([
              { id: 'real-time', label: 'SYNC' },
              { id: 'cyclic', label: 'CYCLIC' },
              { id: 'manual', label: 'MANUAL' }
            ] as const).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChangeDayNightMode(m.id);
                  Sound.playSelect();
                }}
                className={`py-1 rounded text-center border transition-all truncate text-[7px] ${
                  dayNightMode === m.id
                    ? 'border-gold-500 bg-gold-950/20 text-gold-400 font-bold'
                    : 'border-neutral-900 bg-neutral-950/40 text-gray-500 hover:border-neutral-800 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Custom scrub slider for manual override mode */}
          {dayNightMode === 'manual' && (
            <div className="space-y-0.5">
              <input
                type="range"
                min="0"
                max="23.9"
                step="0.1"
                value={manualHour}
                onChange={(e) => {
                  onChangeManualHour(parseFloat(e.target.value));
                }}
                className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-gold-500"
              />
            </div>
          )}
        </div>

        {/* Module 5: Live Telemetry output log */}
        <div className="space-y-2 glass-panel-subtle p-3 rounded border border-neutral-900 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
              05 / TELEMETRY LOGS
            </label>
            <Activity className="w-3 h-3 text-gold-500 animate-pulse" />
          </div>
          
          <div className="font-mono text-[8px] leading-relaxed text-gray-400 space-y-0.5 max-h-[48px] overflow-hidden no-scrollbar">
            {systemAlerts.map((alert, i) => (
              <p key={i} className="truncate">
                <span className="text-gold-500/70 mr-1">&gt;</span> {alert}
              </p>
            ))}
          </div>
        </div>

      </div>

      {/* Module 6: Interactive Resonance Calibration Waveform Oscilloscope */}
      <div className="mt-2 p-4 rounded glass-panel-subtle border border-neutral-900 flex flex-col lg:flex-row gap-5 items-center justify-between relative overflow-hidden">
        {/* Subtle mesh background detail inside block */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,62,0,0.015),transparent_60%)] pointer-events-none" />

        <div className="w-full lg:w-1/2 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase">
                06 / CORTEX SYNC INTEGRATION WAVE
              </span>
            </div>
            <span className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
              resonanceScore === 100 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 animate-pulse font-bold'
                : 'bg-neutral-950 border-neutral-900 text-gold-500'
            }`}>
              {resonanceScore === 100 ? 'RESONANCE LOCKED' : 'COUPLING DRIFT DETECTED'}
            </span>
          </div>
          
          <div className="h-[65px] w-full bg-neutral-950/70 border border-neutral-900 rounded overflow-hidden relative flex items-center justify-center">
            <canvas ref={oscRef} className="absolute inset-0 w-full h-full block" />
            {!isPowerOn && (
              <span className="text-[9px] font-mono text-gray-600 relative z-10 tracking-widest uppercase animate-pulse">
                DEVICE HIBERNATED // OSCILLOSCOPE OFFLINE
              </span>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-10">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="text-[10px] font-mono text-gray-500">RESONANCE MATCH RATE:</span>
              <span className={`text-xs font-mono font-bold transition-colors ${resonanceScore > 90 ? 'text-emerald-400' : 'text-white'}`}>
                {resonanceScore}%
              </span>
            </div>
            <p className="text-[9px] font-mono text-gray-500 max-w-xs leading-normal">
              Calibrate active Core frequency sliders to match the optimal temporal lock values: {targetFreq.toFixed(2)} GHz, {targetDilation.toFixed(2)}x, {targetSync}%.
            </p>
          </div>

          <Tooltip content="Automatically executes a sweeping phase-alignment sequence to lock core resonance perfectly.">
            <button
              disabled={!isPowerOn || isSyncing || resonanceScore === 100}
              onClick={handleAutoSync}
              className={`w-full sm:w-auto px-4 py-2.5 rounded border text-[9px] font-mono tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                resonanceScore === 100
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10 cursor-not-allowed'
                  : !isPowerOn
                  ? 'border-neutral-900 text-neutral-700 cursor-not-allowed'
                  : isSyncing
                  ? 'bg-neutral-800 border-neutral-700 text-yellow-500 animate-pulse'
                  : 'border-gold-500/30 hover:border-gold-400 bg-gold-950/10 hover:bg-gold-500 text-gold-400 hover:text-black'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{resonanceScore === 100 ? 'ALIGNED' : 'TUNE CORES'}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* CTA Trigger */}
      <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-[10px] font-mono text-gray-500 text-center sm:text-left leading-relaxed">
          Manipulating these controls directly structures the physical blueprint of the custom device. Once satisfied, channel the acquisition portal.
        </p>
        <button
          onClick={() => {
            Sound.playWarp();
            onOpenCheckout();
          }}
          className="w-full sm:w-auto px-6 py-2.5 bg-white text-black hover:bg-gold-400 font-display font-medium text-xs tracking-widest transition-all duration-300 shadow-lg shrink-0"
        >
          ACQUIRE CUSTOM CORE
        </button>
      </div>

    </div>
  );
}
