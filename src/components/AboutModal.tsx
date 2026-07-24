import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Cpu } from 'lucide-react';
import { Sound } from './SoundManager';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 140 }}
            className="relative w-full max-w-lg glass-panel border border-neutral-800 rounded-lg shadow-2xl p-6 md:p-8 overflow-hidden pointer-events-auto text-white flex flex-col"
          >
            {/* Ambient gold mesh background inside the dialog */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900 z-10">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-gold-500 font-bold uppercase">
                  CLASSIFIED DOSSIER
                </span>
                <h3 className="text-lg font-display font-medium text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <Info className="w-4 h-4 text-gray-400" />
                  ABOUT THEND CORE
                </h3>
              </div>
              <button
                onClick={() => {
                  Sound.playHover();
                  onClose();
                }}
                className="p-1.5 border border-neutral-900 hover:border-neutral-700 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="pt-6 pb-2 space-y-5 z-10 font-sans text-sm text-gray-300 leading-relaxed overflow-y-auto max-h-[60vh] custom-scrollbar">
              <p>
                The THEND Core is the ultimate cognitive enhancement and temporal-spatial navigation device. Forged from aerospace-grade materials and powered by a proprietary quantum resonance engine, it allows users to manipulate their perception of time, sync with celestial frequencies, and directly couple their neural pathways with deep astronomical telemetry.
              </p>
              
              <div className="p-4 bg-neutral-900/30 rounded border border-neutral-800">
                <div className="flex items-center gap-2 mb-2 text-white">
                  <Cpu className="w-4 h-4 text-gold-500" />
                  <span className="font-bold text-xs uppercase tracking-widest font-mono">Our Mission</span>
                </div>
                <p className="text-xs text-gray-400">
                  To transcend the biological limits of the human mind by providing direct access to the temporal and spatial fabrics of the universe. We believe that true luxury lies in absolute control over your own cognitive reality.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Headquarters</span>
                <p className="font-mono text-xs text-gray-400">
                  Orbiting Assembly Facility 04, Low Earth Orbit (LEO)
                </p>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Est.</span>
                <p className="font-mono text-xs text-gray-400">
                  2026
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-6 mt-4 border-t border-neutral-900 z-10 flex justify-end">
                <button
                  onClick={() => {
                    Sound.playHover();
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-white text-black text-[10px] font-mono font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors rounded"
                >
                  ACKNOWLEDGE
                </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
