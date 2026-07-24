import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Zap,
  Palette,
  Compass,
  ArrowRight,
  ChevronDown,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Layers,
  ArrowUp,
  Cpu,
  Activity,
  Sun,
  Moon
} from 'lucide-react';

import { ActiveOverlay, CoreMode, CustomizerConfig } from './types';
import CoreSimulatorCanvas from './components/CoreSimulatorCanvas';
import InfoOverlay from './components/InfoOverlay';
import ControlSimulatorPanel from './components/ControlSimulatorPanel';
import CheckoutModal from './components/CheckoutModal';
import AboutModal from './components/AboutModal';
import FeedbackModal from './components/FeedbackModal';
import AnalysisModal from './components/AnalysisModal';
import { Sound } from './components/SoundManager';

interface RGB { r: number; g: number; b: number }
const lerpColor = (c1: RGB, c2: RGB, t: number): RGB => ({
  r: Math.round(c1.r + (c2.r - c1.r) * t),
  g: Math.round(c1.g + (c2.g - c1.g) * t),
  b: Math.round(c1.b + (c2.b - c1.b) * t),
});

const getDayNightGradients = (hour: number) => {
  const anchors = [
    { hr: 0,  c1: {r:3, g:7, b:18},    c2: {r:15, g:10, b:40} },  // Midnight
    { hr: 6,  c1: {r:180, g:65, b:20},  c2: {r:90, g:35, b:110} },  // Dawn
    { hr: 12, c1: {r:12, g:125, b:215}, c2: {r:215, g:145, b:15} }, // Noon
    { hr: 18, c1: {r:200, g:45, b:30},  c2: {r:135, g:30, b:165} }, // Sunset
    { hr: 21, c1: {r:40, g:25, b:110},  c2: {r:10, g:12, b:35} },   // Twilight
    { hr: 24, c1: {r:3, g:7, b:18},    c2: {r:15, g:10, b:40} },  // Loop back
  ];

  let idx = 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (hour >= anchors[i].hr && hour < anchors[i+1].hr) {
      idx = i;
      break;
    }
  }

  const a1 = anchors[idx];
  const a2 = anchors[idx+1];
  const t = (hour - a1.hr) / (a2.hr - a1.hr);

  const finalC1 = lerpColor(a1.c1, a2.c1, t);
  const finalC2 = lerpColor(a1.c2, a2.c2, t);

  return {
    color1: `rgba(${finalC1.r}, ${finalC1.g}, ${finalC1.b}, 0.28)`,
    color2: `rgba(${finalC2.r}, ${finalC2.g}, ${finalC2.b}, 0.12)`,
  };
};

const getStarOpacity = (hour: number): number => {
  if (hour >= 21 || hour < 4) return 0.65; // Midnight
  if (hour >= 4 && hour < 8) {
    return 0.65 * (1 - (hour - 4) / 4); // Fade out at Dawn
  }
  if (hour >= 8 && hour < 16) return 0; // Day
  if (hour >= 16 && hour < 21) {
    return 0.65 * ((hour - 16) / 5); // Fade in at Sunset
  }
  return 0;
};

export default function App() {
  // Master configuration state for the entire customizable THEND core
  const [config, setConfig] = useState<CustomizerConfig>({
    material: 'titanium',
    laserColor: '#ff3e00', // Chrono Crimson
    laserName: 'Chrono Crimson',
    frequency: 4.80, // GHz
    syncRate: 60, // %
    dilationFactor: 2.40, // x
    rotationSpeed: 1.0,
    particleCount: 180,
  });

  const [activeMode, setActiveMode] = useState<CoreMode>('TEMPORAL');
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>('none');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisualScanActive, setIsVisualScanActive] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  // Celestial Day & Night Sync Engine State
  const [dayNightMode, setDayNightMode] = useState<'real-time' | 'cyclic' | 'manual'>('real-time');
  const [manualHour, setManualHour] = useState<number>(12); // default Noon
  const [currentHour, setCurrentHour] = useState<number>(12);

  // Keep the day-night clock running
  useEffect(() => {
    if (dayNightMode === 'real-time') {
      const updateHour = () => {
        const now = new Date();
        const hr = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        setCurrentHour(hr);
      };
      updateHour();
      const interval = setInterval(updateHour, 1000);
      return () => clearInterval(interval);
    } else if (dayNightMode === 'cyclic') {
      // 1 minute cyclic loop for full 24h
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) % 60000; // 60s
        const hr = (elapsed / 60000) * 24;
        setCurrentHour(hr);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setCurrentHour(manualHour);
    }
  }, [dayNightMode, manualHour]);

  const toggleLightMode = () => {
    Sound.playSelect();
    const isCurrentlyDay = currentHour >= 6 && currentHour < 18;
    setDayNightMode('manual');
    if (isCurrentlyDay) {
      setManualHour(0); // Set to midnight
    } else {
      setManualHour(12); // Set to noon
    }
  };

  const triggerVisualScan = () => {
    Sound.playSelect();
    setIsVisualScanActive(true);
    
    // Sequence of high-frequency pings during scan
    const interval = setInterval(() => {
      Sound.playPing();
    }, 450);

    setTimeout(() => {
      setIsVisualScanActive(false);
      clearInterval(interval);
    }, 3000);
  };
  const [isMuted, setIsMuted] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  // Core visual sections on the scrolling timeline
  const heroRef = useRef<HTMLDivElement | null>(null);
  const chronosRef = useRef<HTMLDivElement | null>(null);
  const neuralRef = useRef<HTMLDivElement | null>(null);
  const aestheticRef = useRef<HTMLDivElement | null>(null);
  const astralRef = useRef<HTMLDivElement | null>(null);
  const diagnosticRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<HTMLDivElement | null>(null);

  // Scroll position logic to fuel the 3D canvas transform parameters
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      
      // Safety bounds [0.0, 1.0]
      setScrollProgress(Math.max(0, Math.min(1, progress)));

      // Check if user scrolled down past the landing hero screen
      setIsScrolledPastHero(scrollY > 100);

      // Dynamically auto-switch the Core mode rendering depending on scroll sections!
      if (chronosRef.current && neuralRef.current && aestheticRef.current && astralRef.current && diagnosticRef.current && controlRef.current) {
        const offset = window.innerHeight / 2;
        const scrollPos = scrollY + offset;

        if (scrollPos < chronosRef.current.offsetTop) {
          // Hero - keep in Temporal
          setActiveMode('TEMPORAL');
        } else if (scrollPos < neuralRef.current.offsetTop) {
          setActiveMode('TEMPORAL');
        } else if (scrollPos < aestheticRef.current.offsetTop) {
          setActiveMode('NEURAL');
        } else if (scrollPos < astralRef.current.offsetTop) {
          setActiveMode('AESTHETIC');
        } else {
          setActiveMode('ASTRAL');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync laser color with the active scroll mode so 3D objects match the ambient light
  useEffect(() => {
    switch (activeMode) {
      case 'TEMPORAL':
        setConfig(c => ({ ...c, laserColor: '#ff3e00', laserName: 'Chrono Crimson' }));
        break;
      case 'NEURAL':
        setConfig(c => ({ ...c, laserColor: '#00ddff', laserName: 'Cortical Cyan' }));
        break;
      case 'AESTHETIC':
        setConfig(c => ({ ...c, laserColor: '#c084fc', laserName: 'Holo Purple' }));
        break;
      case 'ASTRAL':
        setConfig(c => ({ ...c, laserColor: '#ffaa00', laserName: 'Stellar Amber' }));
        break;
    }
  }, [activeMode]);

  // Update the master config with clean partial modifications
  const handleUpdateConfig = (newConfig: Partial<CustomizerConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Sound triggering functions
  const toggleMute = () => {
    Sound.playSelect();
    if (isMuted) {
      setIsMuted(false);
      Sound.startDrone(config.frequency / 6);
    } else {
      setIsMuted(true);
      Sound.stopDrone();
    }
  };

  const handleOpenOverlay = (overlay: ActiveOverlay) => {
    Sound.playWarp();
    setActiveOverlay(overlay);
  };

  const hexToRgb = (hex: string) => {
    const rgb = hex.match(/\w\w/g);
    if (!rgb) return [255, 62, 0];
    return rgb.map(x => parseInt(x, 16));
  };

  const getModeGlowColor = () => {
    const [r, g, b] = hexToRgb(config.laserColor);
    return `rgba(${r}, ${g}, ${b}, 0.08)`;
  };

  const getModeGlowColorSecondary = () => {
    const [r, g, b] = hexToRgb(config.laserColor);
    // slight variation for secondary
    return `rgba(${Math.min(255, r + 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)}, 0.04)`;
  };

  const handleScrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    Sound.playSelect();
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative bg-grid-pattern selection:bg-gold-500/20 selection:text-white overflow-x-hidden">
      
      {/* Dynamic Ambient Background Light */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-1000 ease-in-out z-0"
        style={{
          background: `
            radial-gradient(circle at 50% ${Math.max(20, scrollProgress * 100)}%, ${getDayNightGradients(currentHour).color1} 0%, transparent 60%),
            radial-gradient(circle at ${100 - (scrollProgress * 50)}% ${scrollProgress * 100}%, ${getDayNightGradients(currentHour).color2} 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 62, 0, 0.015) 0%, transparent 80%)
          `
        }}
      />

      {/* Deep Cyber Celestial Starfields */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0"
        style={{
          opacity: getStarOpacity(currentHour),
        }}
      >
        <div 
          className="absolute inset-0 bg-repeat opacity-40"
          style={{
            backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 50px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 60px 170px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 250px 220px, #fff, rgba(0,0,0,0))',
            backgroundSize: '300px 300px',
          }}
        />
        <div 
          className="absolute inset-0 bg-repeat opacity-60 animate-pulse"
          style={{
            backgroundImage: 'radial-gradient(1px 1px at 10px 80px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 100px 280px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 180px 130px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 280px 70px, #fff, rgba(0,0,0,0))',
            backgroundSize: '400px 400px',
            animationDuration: '8s',
          }}
        />
      </div>

      {/* 3D CANVAS BACKGROUND BACKBONE (Pinned in place across the scrolling timeline) */}
      <div className="fixed inset-0 w-full h-full pointer-events-auto z-0">
        <CoreSimulatorCanvas
          config={config}
          mode={activeMode}
          scrollProgress={scrollProgress}
          activeOverlay={activeOverlay}
          isVisualScanActive={isVisualScanActive}
          isLightMode={false}
          currentHour={currentHour}
        />
      </div>

      {/* TOP DECORATIVE HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 glass-panel-subtle border-b border-white/[0.05] px-6 py-4 md:px-12 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-gold-400" />
          <h1
            onClick={() => handleScrollTo(heroRef)}
            className="text-sm font-display font-bold tracking-[0.3em] text-white cursor-pointer hover:text-gold-400 transition-colors text-glow-accent"
          >
            THEND
          </h1>
        </div>

        {/* Dynamic timeline segment indicator (visual clock dial simulation) */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-gray-500">
          {[
            { label: 'INTRO', ref: heroRef },
            { label: 'CHRONOS', ref: chronosRef },
            { label: 'CORTEX', ref: neuralRef },
            { label: 'AESTHETIC', ref: aestheticRef },
            { label: 'ASTRAL', ref: astralRef },
            { label: 'SIMULATOR', ref: controlRef },
          ].map((sec, idx) => (
            <button
              key={sec.label}
              onClick={() => handleScrollTo(sec.ref as any)}
              className="hover:text-gold-400 transition-colors flex items-center gap-1.5"
            >
              <span>{idx.toString().padStart(2, '0')}</span>
              <span className="text-gray-600">/</span>
              <span className="tracking-widest font-medium text-gray-400 hover:text-white uppercase">{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLightMode}
            className="p-2 border border-white/[0.05] rounded-full hover:border-gold-500/40 text-gray-400 hover:text-gold-400 transition-all bg-neutral-950/20 backdrop-blur-md shadow-inner"
            title={currentHour >= 6 && currentHour < 18 ? 'Simulate Cybernetic Night' : 'Simulate Solar Daylight'}
          >
            {currentHour >= 6 && currentHour < 18 ? <Sun className="w-4 h-4 text-amber-400 animate-[spin_10s_linear_infinite]" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
          
          <button
            onClick={toggleMute}
            className="p-2 border border-white/[0.05] rounded-full hover:border-gold-500/40 text-gray-400 hover:text-gold-400 transition-all bg-neutral-950/20 backdrop-blur-md shadow-inner"
            title={isMuted ? 'Unmute Core Reactor Drone' : 'Mute Core Reactor Drone'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-gold-400 animate-pulse" />}
          </button>

          <button
            onClick={() => {
              Sound.playWarp();
              setIsCheckoutOpen(true);
            }}
            className="px-4 py-1.5 border border-gold-500/30 hover:border-gold-400 bg-gold-950/20 hover:bg-gold-500 text-gold-400 hover:text-black font-mono text-[10px] tracking-widest font-bold uppercase transition-all duration-300 rounded"
          >
            ACQUIRE CORE
          </button>
        </div>
      </header>

      {/* FLOAT THERAPEUTIC SCROLL PROGRESS METER */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest rotate-90 my-2">DIMENSION</span>
        <div className="w-1.5 h-32 bg-neutral-950 rounded-full border border-neutral-900 overflow-hidden relative">
          <div
            className="absolute top-0 left-0 w-full bg-gold-500 transition-all duration-100 rounded-full"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-gold-400 font-bold">{(scrollProgress * 100).toFixed(0)}%</span>
      </div>

      {/* SCROLL-TO-TOP BUTTON */}
      {isScrolledPastHero && (
        <button
          onClick={() => handleScrollTo(heroRef)}
          className="fixed bottom-32 md:bottom-24 right-6 md:right-10 z-40 p-2.5 bg-neutral-950/80 border border-neutral-800 rounded-full text-gold-400 hover:text-white hover:border-gold-500 transition-all shadow-lg"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* NARRATIVE SECTION CHRONICLE (Layered above the fixed 3D backdrop) */}
      <div className="relative z-10 w-full">

        {/* SECTION 0: LANDING HERO */}
        <div
          ref={heroRef}
          className="min-h-screen flex flex-col justify-between items-center px-6 md:px-12 pt-32 pb-16 text-center select-none"
        >
          <div className="max-w-3xl space-y-4 my-auto">
            <motion.div
              initial={{ letterSpacing: '0.1em', opacity: 0, y: 20 }}
              animate={{ letterSpacing: '0.45em', opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <h2 className="text-4xl md:text-6xl lg:text-8xl font-display font-bold text-white tracking-[0.45em] leading-none select-text text-glow">
                THEND
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4, duration: 1.0 }}
              className="text-xs md:text-sm font-mono tracking-[0.25em] text-gold-400 font-medium uppercase"
            >
              Temporal Holographic Engine & Neural Device
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-xs md:text-sm text-gray-500 font-sans max-w-lg mx-auto leading-relaxed tracking-wide pt-4"
            >
              A single-system cosmic interface aligning local quantum time perception and dry-contact neuro-synaptic calibration. Crafted in Obsidian glass and sandblasted aerospace titanium.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            onClick={() => handleScrollTo(chronosRef)}
            className="flex flex-col items-center gap-2 cursor-pointer pt-6"
          >
            <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase">
              SCROLL DOWN TO INITIATE CORE
            </span>
            <ChevronDown className="w-4 h-4 text-gold-400" />
          </motion.div>
        </div>

        {/* SECTION 1: CHRONOS ZONE */}
        <div
          ref={chronosRef}
          className="min-h-screen flex items-center justify-center md:justify-start px-6 md:px-12 lg:px-24 py-24 select-none"
        >
          <div className="max-w-md glass-panel rounded-lg p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="absolute top-2 right-4 text-[45px] font-mono text-white/[0.02] font-black pointer-events-none select-none">
              01
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gold-950/20 border border-gold-500/20 text-gold-400 rounded-full">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-gold-400 tracking-widest uppercase font-bold">
                CHRONOLOGICAL HARMONIZER
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white leading-tight">
              CONTROL THE FLOW OF TIME THROUGH LOCAL RELATIVISTIC CURVATURE.
            </h3>

            <p className="text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
              The Chronos Engine targets your local cognitive dilation factor. Dilate time perceptions by up to 8x to achieve extreme focus states, slowing external interruptions to a absolute halt.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleOpenOverlay('chronos')}
                className="px-4 py-2 bg-white text-black hover:bg-gold-400 text-[10px] font-mono tracking-wider font-bold uppercase transition-all rounded flex items-center gap-1.5"
              >
                OPEN SYSTEM SHEET <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => handleScrollTo(neuralRef)}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 text-[10px] font-mono tracking-wider text-gray-400 hover:text-white uppercase transition-all rounded"
              >
                NEXT CORE
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: NEURAL CORE */}
        <div
          ref={neuralRef}
          className="min-h-screen flex items-center justify-center md:justify-end px-6 md:px-12 lg:px-24 py-24 select-none"
        >
          <div className="max-w-md glass-panel rounded-lg p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="absolute top-2 right-4 text-[45px] font-mono text-white/[0.02] font-black pointer-events-none select-none">
              02
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-950/20 border border-cyan-500/20 text-cyan-400 rounded-full">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold">
                CORTEX INTERFACE NODE
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white leading-tight">
              DECA-CHANNEL DIRECT SYNAPSTIC TELEMETRY CAPABILITY.
            </h3>

            <p className="text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
              Direct electro-magnetic coupling aligns THEND Core frequency seamlessly with your brainwaves (Alpha, Beta, Theta, Gamma). Toggle neural presets to shift from intense logical tasks directly into deep astral meditation states.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleOpenOverlay('neural')}
                className="px-4 py-2 bg-white text-black hover:bg-cyan-400 text-[10px] font-mono tracking-wider font-bold uppercase transition-all rounded flex items-center gap-1.5"
              >
                SYNC INTERFACE <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => handleScrollTo(aestheticRef)}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 text-[10px] font-mono tracking-wider text-gray-400 hover:text-white uppercase transition-all rounded"
              >
                NEXT CORE
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: HOLO-AESTHETIC PORTFOLIO */}
        <div
          ref={aestheticRef}
          className="min-h-screen flex items-center justify-center md:justify-start px-6 md:px-12 lg:px-24 py-24 select-none"
        >
          <div className="max-w-md glass-panel rounded-lg p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="absolute top-2 right-4 text-[45px] font-mono text-white/[0.02] font-black pointer-events-none select-none">
              03
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-950/20 border border-purple-500/20 text-purple-400 rounded-full">
                <Palette className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold">
                HOLO-AESTHETIC & DESIGN
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white leading-tight">
              PREMIUM LUXURY MATERIALS FABRICATED TO ORDER.
            </h3>

            <p className="text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
              Customize the physical embodiment of your device. Select from dense titanium, dark obsidian mirror glass, or brushed stellar gold. Modify laser core wavelengths in real-time, matching your surrounding visual aesthetics.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleOpenOverlay('aesthetic')}
                className="px-4 py-2 bg-white text-black hover:bg-purple-400 text-[10px] font-mono tracking-wider font-bold uppercase transition-all rounded flex items-center gap-1.5"
              >
                MATERIAL CATALOG <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => handleScrollTo(astralRef)}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 text-[10px] font-mono tracking-wider text-gray-400 hover:text-white uppercase transition-all rounded"
              >
                NEXT CORE
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: ASTRAL NAVIGATION */}
        <div
          ref={astralRef}
          className="min-h-screen flex items-center justify-center md:justify-end px-6 md:px-12 lg:px-24 py-24 select-none"
        >
          <div className="max-w-md glass-panel rounded-lg p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="absolute top-2 right-4 text-[45px] font-mono text-white/[0.02] font-black pointer-events-none select-none">
              04
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-950/20 border border-amber-500/20 text-amber-400 rounded-full">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold">
                ASTRAL CALIBRATION INDEX
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white leading-tight">
              PULSAR HORIZON LOCK WITH GALACTIC BEACON TELEMETRY.
            </h3>

            <p className="text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
              Bypass Earth satellite GPS profiles. THEND synchronizes directly with spatial astronomical pulsars. Track celestial coordinate matrices in high fidelity, anchoring your core position to the galactic plane.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleOpenOverlay('astral')}
                className="px-4 py-2 bg-white text-black hover:bg-amber-400 text-[10px] font-mono tracking-wider font-bold uppercase transition-all rounded flex items-center gap-1.5"
              >
                ASTRAL CALIBRATION <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => handleScrollTo(diagnosticRef)}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 text-[10px] font-mono tracking-wider text-gray-400 hover:text-white uppercase transition-all rounded"
              >
                NEXT CORE
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: DIAGNOSTIC PROTOCOL */}
        <div
          ref={diagnosticRef}
          className="min-h-screen flex items-center justify-center md:justify-start px-6 md:px-12 lg:px-24 py-24 select-none"
        >
          <div className="max-w-md glass-panel rounded-lg p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="absolute top-2 right-4 text-[45px] font-mono text-white/[0.02] font-black pointer-events-none select-none">
              05
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-full">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase font-bold">
                SYSTEM DIAGNOSTICS
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white leading-tight">
              QUANTUM RESONANCE INTEGRITY TESTING.
            </h3>

            <p className="text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
              Upload configurations or schema files to run a deep temporal-spatial diagnostic. Our quantum resonance engine tests its structural integrity, yielding comprehensive result logs.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { Sound.playHover(); setIsAnalysisOpen(true); }}
                className="px-4 py-2 bg-white text-black hover:bg-emerald-400 text-[10px] font-mono tracking-wider font-bold uppercase transition-all rounded flex items-center justify-center gap-1.5"
              >
                RUN DIAGNOSTIC <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={triggerVisualScan}
                disabled={isVisualScanActive}
                className="px-4 py-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 text-[10px] font-mono tracking-wider font-bold uppercase transition-all rounded flex items-center justify-center gap-1.5"
              >
                {isVisualScanActive ? (
                  <span className="flex items-center gap-2">SCANNING <span className="animate-pulse">...</span></span>
                ) : (
                  <>VISUAL SCAN <Activity className="w-3.5 h-3.5" /></>
                )}
              </button>
              
              <button
                onClick={() => handleScrollTo(controlRef)}
                className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 text-[10px] font-mono tracking-wider text-gray-400 hover:text-white uppercase transition-all rounded flex items-center justify-center"
              >
                ENTER SIMULATOR
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 6: FINAL LIVE SIMULATOR FOCUS PANEL */}
        <div
          ref={controlRef}
          className="min-h-[90vh] flex items-center justify-center px-4 md:px-8 py-16 relative z-10"
        >
          <div className="w-full max-w-[1200px] flex flex-col items-center">
            {/* Subtle text block introducing the command dock */}
            <div className="max-w-xl text-center mb-6 space-y-2 select-none">
              <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-widest">
                ACTIVE PHYSICAL HARMONIZATION
              </span>
              <h3 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">
                THEND CORE SYNCHRONIZER
              </h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-sans leading-relaxed tracking-wide">
                tweak live variables to customize the core physical layout. Engage diagnostics or proceed with bespoke deposit order acquisition.
              </p>
            </div>

            {/* Interactive Floating Control Simulator Dashboard */}
            <div className="w-full">
              <ControlSimulatorPanel
                config={config}
                onChangeConfig={handleUpdateConfig}
                activeMode={activeMode}
                onChangeMode={setActiveMode}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                dayNightMode={dayNightMode}
                onChangeDayNightMode={setDayNightMode}
                manualHour={manualHour}
                onChangeManualHour={setManualHour}
                currentHour={currentHour}
              />
            </div>
          </div>
        </div>

        {/* BRAND CHRONICLE SHOWCASE FOOTER */}
        <footer className="bg-neutral-950/40 backdrop-blur-lg border-t border-neutral-900/50 py-6 px-6 md:px-12 text-gray-500 font-mono text-[10px] select-none z-10 relative">
          <div className="w-full flex flex-col md:grid md:grid-cols-3 md:items-center gap-6">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Cpu className="w-4 h-4 text-gold-500" />
              <span className="text-white font-bold tracking-[0.25em]">THEND</span>
            </div>
            <div className="text-center">
              © 2026 ALL RIGHTS RESERVED BY THEND STUDIOS. ARCHITECTS OF DIGITAL ETERNITY.
            </div>
            <div className="flex justify-center md:justify-end gap-4">
              <button
                onClick={() => { Sound.playHover(); setIsAboutOpen(true); }}
                className="hover:text-white transition-colors uppercase"
              >
                About
              </button>
              <button
                onClick={() => { Sound.playHover(); setIsFeedbackOpen(true); }}
                className="hover:text-white transition-colors uppercase"
              >
                Feedback
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* FULL TECHNICAL OVERLAYS */}
      <InfoOverlay
        activeOverlay={activeOverlay}
        onClose={() => setActiveOverlay('none')}
        config={config}
        onChangeConfig={handleUpdateConfig}
      />

      {/* PREMIUM CHECKOUT SYSTEM */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        config={config}
      />

      {/* ABOUT MODAL */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* FEEDBACK MODAL */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* ANALYSIS MODAL */}
      <AnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
      />
    </div>
  );
}
