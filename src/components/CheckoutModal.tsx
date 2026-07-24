import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CreditCard, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { CustomizerConfig } from '../types';
import { Sound } from './SoundManager';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomizerConfig;
}

export default function CheckoutModal({ isOpen, onClose, config }: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    spatialCoordinate: 'Latitude 37.7749° N, Longitude 122.4194° W',
    syncSignature: 'BRAINWAVE-SIG-ALPHA-X992',
  });

  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• 1991',
    expiry: '09/30',
    cvv: '•••',
  });

  // Dynamic luxury pricing model
  const basePrice = 28500;
  
  const getMaterialPremium = () => {
    switch (config.material) {
      case 'titanium': return 4500;
      case 'obsidian': return 6800;
      case 'stellar': return 12500;
      case 'polymer': return 8200;
      default: return 0;
    }
  };

  const getDilationPremium = () => {
    return Math.round((config.dilationFactor - 1) * 1200);
  };

  const totalCost = basePrice + getMaterialPremium() + getDilationPremium();

  const handleNext = () => {
    Sound.playSelect();
    setStep((prev) => (prev + 1) as any);
  };

  const handleBack = () => {
    Sound.playHover();
    setStep((prev) => (prev - 1) as any);
  };

  const handleAcquire = (e: React.FormEvent) => {
    e.preventDefault();
    Sound.playWarp();
    setStep(3); // Go to final confirmation
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
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 140 }}
            className="relative w-full max-w-xl glass-panel border border-neutral-800 rounded-lg shadow-2xl p-6 md:p-8 overflow-hidden pointer-events-auto text-white flex flex-col"
          >
            {/* Ambient gold mesh background inside the dialog */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900 z-10">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-gold-500 font-bold uppercase">
                  ACQUISITION GATEWAY
                </span>
                <h3 className="text-lg font-display font-medium text-white tracking-tight flex items-center gap-2 mt-0.5">
                  THEND CORE ACQUISITION
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 border border-neutral-900 hover:border-neutral-700 rounded-full text-gray-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Wizard indicators */}
            <div className="flex justify-between items-center my-5 px-1 font-mono text-[9px] text-gray-500 z-10">
              <span className={step >= 1 ? 'text-gold-400 font-bold' : ''}>[ 01 / SPECIFICATION SHEET ]</span>
              <div className="flex-1 h-px bg-neutral-900 mx-3" />
              <span className={step >= 2 ? 'text-gold-400 font-bold' : ''}>[ 02 / NEURAL SIGNATURE ]</span>
              <div className="flex-1 h-px bg-neutral-900 mx-3" />
              <span className={step >= 3 ? 'text-gold-400 font-bold' : ''}>[ 03 / RELATIVISTIC RECEIPT ]</span>
            </div>

            {/* Dynamic Step Contents */}
            <div className="my-2 flex-1 overflow-y-auto max-h-[60vh] pr-1 z-10">
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-3 bg-neutral-900/40 p-4 border border-neutral-900 rounded-lg">
                    <h4 className="text-xs font-mono text-gold-400 tracking-wider">YOUR CONFIGURATION SUMMARY</h4>
                    
                    <div className="divide-y divide-neutral-900/50 text-xs font-mono">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 uppercase">CHASSIS MATERIAL</span>
                        <span className="text-white font-medium uppercase">{config.material}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 uppercase">CORE LASER SPECTRUM</span>
                        <span className="text-white font-medium flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.laserColor }} />
                          {config.laserName}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 uppercase">QUANTIZED FREQUENCY</span>
                        <span className="text-white font-medium">{config.frequency.toFixed(2)} GHz</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 uppercase">CORTEX SYNC STATE</span>
                        <span className="text-white font-medium">{config.syncRate}% Strength</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500 uppercase">TEMPORAL DILATION SPEED</span>
                        <span className="text-white font-medium">{config.dilationFactor.toFixed(2)}x Max</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Base THEND Chronometer Unit</span>
                      <span>${basePrice.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span className="uppercase">Premium Material: {config.material}</span>
                      <span>+${getMaterialPremium().toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Dilation Relativistic Module</span>
                      <span>+${getDilationPremium().toLocaleString()} USD</span>
                    </div>
                    <hr className="border-neutral-900" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gold-400 font-medium">TOTAL ACQUISITION DEPOSIT</span>
                      <span className="text-white font-bold">${totalCost.toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Legal disclaimer */}
                  <div className="flex gap-2.5 p-3 border border-neutral-900 bg-neutral-900/10 rounded">
                    <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-500 leading-normal">
                      This is a custom-calibrated luxury quantum device. Upon activation, temporal drift profiles are tied strictly to the user signature bio-rhythm and are irreversible.
                    </p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-gold-500 hover:bg-gold-600 active:scale-[0.99] transition-all rounded text-black font-display font-medium text-xs tracking-widest text-center mt-6"
                  >
                    CONTINUE TO BIOMETRIC IDENTITY
                  </button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleAcquire} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">
                      ACQUISITION SIGNATURE (FULL LEGAL NAME)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Arthur Dent"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full glass-panel-subtle border border-neutral-800 focus:border-gold-500 p-2.5 rounded text-xs font-mono outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">
                      NEURAL QUANTUM EMAIL LINK
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g., arthur@hitchhiker.gal"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full glass-panel-subtle border border-neutral-800 focus:border-gold-500 p-2.5 rounded text-xs font-mono outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">
                      SPATIAL GEOMETRIC COGNITIVE DESTINATION
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Latitude, Longitude or Neural Station coordinate"
                      value={formData.spatialCoordinate}
                      onChange={(e) => setFormData({ ...formData, spatialCoordinate: e.target.value })}
                      className="w-full glass-panel-subtle border border-neutral-800 focus:border-gold-500 p-2.5 rounded text-xs font-mono outline-none transition-all"
                    />
                  </div>

                  <hr className="border-neutral-900 my-4" />

                  <h4 className="text-[10px] font-mono text-gold-500 uppercase tracking-widest font-bold">
                    PREMIUM PAYMENT TRANSACTION NODE
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">
                        CREDIT CARD MATRIX IDENTIFIER
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="•••• •••• •••• 1991"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full glass-panel-subtle border border-neutral-800 focus:border-gold-500 p-2.5 rounded text-xs font-mono outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">EXPIRY</label>
                      <input
                        required
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full glass-panel-subtle border border-neutral-800 focus:border-gold-500 p-2.5 rounded text-xs font-mono outline-none transition-all text-center"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">QUANTIZED CVV</label>
                      <input
                        required
                        type="password"
                        placeholder="•••"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full glass-panel-subtle border border-neutral-800 focus:border-gold-500 p-2.5 rounded text-xs font-mono outline-none transition-all text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500 mt-5 pl-2">
                      <CreditCard className="w-3.5 h-3.5" /> SECURE STRIPE TLSv1.3
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-3 border border-neutral-800 hover:border-neutral-600 rounded text-xs font-mono transition-all text-gray-400 hover:text-white"
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 active:scale-[0.99] transition-all rounded text-black font-display font-semibold text-xs tracking-widest text-center flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> COMPLETE COGNITIVE PURCHASE
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="text-center py-6 space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border border-dashed border-gold-500/40 scale-125"
                      />
                      <motion.div
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-16 h-16 bg-gold-950/40 border border-gold-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-8 h-8 text-gold-400" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-display text-white tracking-tight font-medium">
                      TEMPORAL-NEURAL PORTAL ACTIVATED
                    </h4>
                    <p className="text-xs text-gray-400 font-sans max-w-sm mx-auto leading-relaxed">
                      Congratulations, <span className="text-white font-bold">{formData.fullName || 'Citizen'}</span>. Your custom configuration has been compiled and is now firing synapse beams to coordinate destination.
                    </p>
                  </div>

                  {/* Sealed Certificate / Receipt Card */}
                  <div className="border border-gold-500/30 bg-gold-950/10 p-5 rounded-lg text-left font-mono text-[10px] space-y-2.5 max-w-md mx-auto relative overflow-hidden">
                    {/* Glowing aesthetic stamp */}
                    <div className="absolute top-2 right-2 w-16 h-16 border border-gold-500/20 rounded-full flex items-center justify-center text-[7px] text-gold-500/30 font-bold rotate-12 leading-tight uppercase text-center">
                      THEND<br />SEALED
                    </div>

                    <div className="flex justify-between border-b border-gold-500/20 pb-2">
                      <span className="text-gold-500 uppercase">Bespoke Order Certificate</span>
                      <span className="text-white">ND-REG-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-gray-400">
                      <div>MATERIAL:</div>
                      <div className="text-white uppercase text-right">{config.material}</div>
                      
                      <div>LASER CORE:</div>
                      <div className="text-white text-right">{config.laserName}</div>
                      
                      <div>QUANTUM FREQUENCY:</div>
                      <div className="text-white text-right">{config.frequency.toFixed(2)} GHz</div>
                      
                      <div>CORTEX SYNC:</div>
                      <div className="text-white text-right">{config.syncRate}% Alpha</div>
                      
                      <div>DELIVERY SECTOR:</div>
                      <div className="text-white text-right truncate pl-4">{formData.spatialCoordinate}</div>
                    </div>

                    <div className="border-t border-gold-500/20 pt-2 flex justify-between text-xs mt-3 font-semibold">
                      <span className="text-gold-500">TRANSACTED TOTAL:</span>
                      <span className="text-white">${totalCost.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <p className="text-[9px] font-mono text-gray-500 italic">
                    Receipt verification link has been channeled to: {formData.email || 'your cortex'}
                  </p>

                  <button
                    onClick={() => {
                      Sound.playSelect();
                      onClose();
                      setStep(1); // Reset step
                    }}
                    className="w-full py-2.5 border border-neutral-800 hover:border-gold-500/30 hover:text-gold-400 transition-all text-gray-400 rounded text-xs font-mono uppercase tracking-widest"
                  >
                    RETURN TO COGNITIVE CORE
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
