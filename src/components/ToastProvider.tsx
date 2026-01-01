'use client';

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  kind: ToastKind;
};

// Toast display duration in milliseconds (configurable by kind)
const TOAST_DURATIONS: Record<ToastKind, number> = {
  success: 3000, // 3 seconds for success messages
  info: 4000, // 4 seconds for info messages
  error: 5000, // 5 seconds for errors (longer to ensure readability)
};

const ToastContext = createContext<{
  addToast: (message: string, kind?: ToastKind) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, kind }]);
      const duration = TOAST_DURATIONS[kind];
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 left-6 right-6 md:bottom-auto md:top-20 md:right-6 md:left-auto z-[200] flex flex-col gap-3 text-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="backdrop-blur-md rounded-lg px-4 py-3 shadow-lg border text-off-white transition-colors"
            style={{
              backgroundColor:
                toast.kind === 'success'
                  ? 'rgba(52, 211, 153, 0.12)'
                  : toast.kind === 'error'
                    ? 'rgba(248, 113, 113, 0.12)'
                    : 'rgba(255, 255, 255, 0.08)',
              borderColor:
                toast.kind === 'success'
                  ? 'rgba(52, 211, 153, 0.35)'
                  : toast.kind === 'error'
                    ? 'rgba(248, 113, 113, 0.35)'
                    : 'rgba(255, 255, 255, 0.18)',
            }}
          >
            <div className="font-zen-old-mincho tracking-wide leading-snug">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
