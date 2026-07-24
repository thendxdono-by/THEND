import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Sound } from './SoundManager';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    Sound.playWarp();
    setStep(2);
  };

  const handleClose = () => {
    Sound.playHover();
    setStep(1);
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                  TRANSMISSION UPLINK
                </span>
                <h3 className="text-lg font-display font-medium text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  SEND FEEDBACK
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
              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
                      MESSAGE LOG
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Enter your transmission here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full glass-panel-subtle border border-neutral-800 focus:border-gold-500 p-3 rounded text-sm font-sans outline-none transition-all resize-none text-gray-300 custom-scrollbar"
                    />
                  </div>
                  
                  <div className="flex justify-end pt-2 border-t border-neutral-900 mt-4">
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="px-5 py-2.5 bg-gold-500 text-black text-[10px] font-mono font-bold tracking-widest uppercase hover:bg-gold-400 transition-colors rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      TRANSMIT
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-display text-white mb-1 tracking-tight">Transmission Received</h4>
                    <p className="text-xs text-gray-400 font-mono">Your feedback has been successfully logged to the central core network.</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2 border border-neutral-800 hover:border-neutral-600 rounded text-[10px] font-mono tracking-widest font-bold text-gray-300 hover:text-white transition-all uppercase"
                  >
                    DISCONNECT
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
