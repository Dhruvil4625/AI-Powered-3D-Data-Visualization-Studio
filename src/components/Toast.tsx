import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const Toast: React.FC = () => {
  const { toastMessage, setToastMessage } = useAppStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setToastMessage(null), 280);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(195,245,255,0.1)] transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
      }`}
      style={{
        transform: `translateX(-50%) ${visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)'}`,
        background: 'rgba(22, 26, 34, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 229, 255, 0.15)',
      }}
    >
      {/* Glow dot */}
      <div className="pulse-dot" style={{ width: 7, height: 7, flexShrink: 0 }} />

      <span className="text-sm font-medium text-on-surface/90 font-body whitespace-nowrap">
        {toastMessage}
      </span>

      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => setToastMessage(null), 280);
        }}
        className="ml-1 p-1 rounded-md hover:bg-white/[0.06] transition-colors"
      >
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">close</span>
      </button>
    </div>
  );
};
