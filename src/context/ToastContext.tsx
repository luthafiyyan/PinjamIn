import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Icon } from '../components/Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, [hideToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Icon name="CheckCircle" size={18} className="text-emerald-600 shrink-0" />;
      case 'error':
        return <Icon name="XCircle" size={18} className="text-rose-600 shrink-0" />;
      case 'warning':
        return <Icon name="ExclamationTriangle" size={18} className="text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Icon name="InfoCircle" size={18} className="text-indigo-600 shrink-0" />;
    }
  };

  const getToastBorderClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-white shadow-emerald-950/10';
      case 'error':
        return 'border-rose-200 bg-white shadow-rose-950/10';
      case 'warning':
        return 'border-amber-200 bg-white shadow-amber-950/10';
      case 'info':
      default:
        return 'border-indigo-200 bg-white shadow-indigo-950/10';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Floating Toast Container (Top center on mobile, top right on desktop) */}
      <aside 
        aria-label="Notifikasi sistem" 
        className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 flex flex-col gap-2.5 max-w-[92vw] sm:max-w-sm w-full pointer-events-none no-print"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl border shadow-xl flex items-start gap-3 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2 sm:slide-in-from-right-4 ${getToastBorderClass(
              toast.type
            )}`}
          >
            <div className="mt-0.5">{getToastIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => hideToast(toast.id)}
              className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup notifikasi"
              title="Tutup notifikasi"
            >
              <Icon name="XLg" size={14} />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
