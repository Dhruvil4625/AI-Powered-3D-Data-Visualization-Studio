import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast: React.FC = () => {
  const { toastMessage, setToastMessage } = useAppStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <span className="material-symbols-outlined text-primary text-sm">notifications_active</span>
          <span className="text-xs font-bold font-headline tracking-wide">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-4 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
