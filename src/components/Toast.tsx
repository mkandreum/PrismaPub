import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { TOAST_TRANSITION } from "../motion";

export type ToastType = 'loading' | 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => string;
  hideToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Clean up all pending timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const hideToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    if (type !== 'loading') {
      setToasts(prev => prev.filter(t => t.type !== 'loading'));
    }
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    if (type !== 'loading') {
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
      timersRef.current.set(id, timer);
    }
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-6 right-4 md:right-8 z-[300] flex flex-col gap-3 min-w-[280px] pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 48, opacity: 0, scale: 0.96 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 32, opacity: 0, scale: 0.98 }}
              transition={TOAST_TRANSITION}
              className="bg-black/92 border-2 border-prisma-purple/30 p-4 shadow-[0_0_24px_rgba(139,92,246,0.22)] flex items-center gap-3 pointer-events-auto rounded-xl"
            >
              {toast.type === 'loading' && <Loader2 className="animate-spin text-prisma-accent" size={22} />}
              {toast.type === 'success' && <CheckCircle2 className="text-green-400" size={22} />}
              {toast.type === 'error' && <AlertCircle className="text-red-400" size={22} />}
              <span className="font-semibold uppercase tracking-wider text-sm text-white">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
