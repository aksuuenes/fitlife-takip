import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function BreathingAnimation() {
  const [phase, setPhase] = useState<'Nefes Al' | 'Nefes Ver'>('Nefes Al');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => p === 'Nefes Al' ? 'Nefes Ver' : 'Nefes Al');
    }, 4000); // 4 seconds per phase
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden relative rounded-[28px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,rgba(2,6,23,1)_100%)] pointer-events-none" />
      
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Glowing background */}
        <motion.div
          animate={{
            scale: phase === 'Nefes Al' ? 1.6 : 0.8,
            backgroundColor: phase === 'Nefes Al' ? '#10b981' : '#3b82f6',
            opacity: phase === 'Nefes Al' ? 0.6 : 0.2
          }}
          transition={{
            duration: 4,
            ease: "easeInOut"
          }}
          className="absolute w-40 h-40 rounded-full blur-2xl"
        />
        
        {/* Dashed outer ring */}
        <motion.div
          animate={{
            scale: phase === 'Nefes Al' ? 1.4 : 0.9,
            borderColor: phase === 'Nefes Al' ? '#34d399' : '#60a5fa',
            rotate: phase === 'Nefes Al' ? 90 : 0
          }}
          transition={{
            duration: 4,
            ease: "easeInOut"
          }}
          className="absolute w-48 h-48 rounded-full border-2 border-dashed opacity-40"
        />

        {/* Inner solid ring */}
        <motion.div
          animate={{
            scale: phase === 'Nefes Al' ? 1.2 : 0.95,
          }}
          transition={{
            duration: 4,
            ease: "easeInOut"
          }}
          className="relative z-10 w-36 h-36 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700 flex flex-col items-center justify-center shadow-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className={`text-xl font-black uppercase tracking-widest ${
                phase === 'Nefes Al' ? 'text-emerald-400' : 'text-blue-400'
              }`}
            >
              {phase}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <p className="mt-12 text-slate-400 font-medium text-sm z-10 animate-pulse">
        Daireyi takip ederek nefesinizi düzenleyin
      </p>
    </div>
  );
}
