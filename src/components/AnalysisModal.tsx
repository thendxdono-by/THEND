import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Activity, CheckCircle2, FileTerminal, Download } from 'lucide-react';
import { Sound } from './SoundManager';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalysisModal({ isOpen, onClose }: AnalysisModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (step === 2) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(3);
            Sound.playWarp();
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      Sound.playHover();
      setStep(2);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
      Sound.playHover();
      setStep(2);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    Sound.playHover();
    const element = document.createElement("a");
    const resultText = `=======================================
THEND CORE - DIAGNOSTIC RESULT
=======================================

FILE IDENTIFIER: ${fileName}
STATUS: OPTIMAL
QUANTUM VARIANCE: 0.0034%
ANOMALIES DETECTED: 0

[ANALYSIS COMPLETE]
=======================================`;
    const file = new Blob([resultText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `result_${fileName || 'analysis'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    Sound.playHover();
    setStep(1);
    setProgress(0);
    setFileName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
          />

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 140 }}
            className="relative w-full max-w-lg glass-panel border border-neutral-800 rounded-lg shadow-2xl p-6 md:p-8 overflow-hidden pointer-events-auto text-white flex flex-col"
          >
            {/* Ambient effects */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900 z-10">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-cyan-500 font-bold uppercase">
                  DIAGNOSTIC PROTOCOL
                </span>
                <h3 className="text-lg font-display font-medium text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <FileTerminal className="w-4 h-4 text-gray-400" />
                  FILE ANALYSIS
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 border border-neutral-900 hover:border-neutral-700 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="pt-6 z-10">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-400 font-sans">
                    Upload a configuration or schema file to run a deep temporal-spatial diagnostic. Our quantum resonance engine will test its integrity.
                  </p>
                  
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 border-2 border-dashed border-neutral-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-all group"
                  >
                    <Upload className="w-8 h-8 text-neutral-600 group-hover:text-cyan-400 mb-4 transition-colors" />
                    <span className="text-xs font-mono tracking-widest text-gray-300 uppercase">
                      CLICK OR DRAG FILE HERE
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 space-y-6"
                >
                  <Activity className="w-10 h-10 text-cyan-400 animate-pulse" />
                  
                  <div className="w-full space-y-4">
                    <div className="flex justify-between text-[10px] font-mono tracking-widest uppercase text-gray-400">
                      <span>Analyzing {fileName}</span>
                      <span className="text-cyan-400">{Math.min(progress, 100)}%</span>
                    </div>
                    
                    <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                      <motion.div
                        className="h-full bg-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                    
                    <div className="h-24 w-full bg-black/50 border border-neutral-800 rounded p-2 overflow-hidden flex flex-col justify-end">
                      <div className="space-y-1">
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 10 ? 1 : 0 }} className="text-[9px] font-mono text-gray-500">{">"} Initializing quantum scanner...</motion.p>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 30 ? 1 : 0 }} className="text-[9px] font-mono text-gray-500">{">"} Decrypting telemetry headers...</motion.p>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 50 ? 1 : 0 }} className="text-[9px] font-mono text-cyan-500/70">{">"} Coupling neural pathways...</motion.p>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 70 ? 1 : 0 }} className="text-[9px] font-mono text-gray-500">{">"} Verifying spatial integrity...</motion.p>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: progress > 90 ? 1 : 0 }} className="text-[9px] font-mono text-emerald-500/70">{">"} Core resonance stabilized.</motion.p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-display text-white mb-1 tracking-tight">Analysis Optimal</h4>
                    <p className="text-xs text-gray-400 font-mono">
                      The matrix has verified the file's structural integrity.
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="mt-6 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded text-[10px] font-mono tracking-widest font-bold transition-all uppercase flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD RESULT FILE
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
