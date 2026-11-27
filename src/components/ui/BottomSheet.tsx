import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

/** Ekranın görünen kısmı (iOS'ta klavye açılınca küçülür). */
function useVisualViewport() {
  const read = () => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    return { height: vv ? vv.height : window.innerHeight, top: vv ? vv.offsetTop : 0 };
  };
  const [state, setState] = useState(read);
  useEffect(() => {
    const vv = window.visualViewport;
    const update = () => setState(read());
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return state;
}

/**
 * Alttan açılan sayfa. document.body'ye taşınır, böylece alt menünün ve sayfa animasyonlarının
 * üstünde kalır; yüksekliği klavyenin üstünde kalan alana göre ayarlanır.
 */
export default function BottomSheet({ onClose, children, className = '' }: {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const vv = useVisualViewport();
  const keyboardOpen = vv.height < window.innerHeight - 120;

  // Sayfa arkada kaymasın
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <motion.div
      className="fixed inset-x-0 z-[100] flex items-end md:items-center justify-center"
      style={{ top: vv.top, height: vv.height }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className={`relative w-full md:max-w-lg flex flex-col bg-white dark:bg-slate-900 rounded-t-[28px] md:rounded-3xl shadow-2xl ${className}`}
        style={{
          maxHeight: keyboardOpen ? vv.height - 8 : Math.min(vv.height * 0.9, vv.height - 24),
          paddingBottom: keyboardOpen ? 0 : 'env(safe-area-inset-bottom)',
        }}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
