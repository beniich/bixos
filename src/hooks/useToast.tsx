import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toastMethods = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
    info: (msg: string) => addToast('info', msg),
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-400" size={20} />;
      case 'error': return <XCircle className="text-red-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-400" size={20} />;
      case 'info': return <Info className="text-blue-400" size={20} />;
    }
  };

  const getBgStyle = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30';
      case 'error': return 'bg-red-500/10 border-red-500/30';
      case 'warning': return 'bg-amber-500/10 border-amber-500/30';
      case 'info': return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all animate-in slide-in-from-right-8 fade-in ${getBgStyle(t.type)}`}
            style={{ minWidth: '300px' }}
          >
            <div className="shrink-0 mt-0.5">{getIcon(t.type)}</div>
            <p className="text-white text-sm flex-1">{t.message}</p>
            <button 
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider
    return {
      toast: {
        success: (msg: string) => console.log('Toast success:', msg),
        error: (msg: string) => console.log('Toast error:', msg),
        warning: (msg: string) => console.log('Toast warning:', msg),
        info: (msg: string) => console.log('Toast info:', msg),
      }
    };
  }
  return ctx;
};
