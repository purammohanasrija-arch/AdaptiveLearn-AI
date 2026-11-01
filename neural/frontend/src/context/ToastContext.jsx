import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    showToast: (msg, type = 'info', dur) => addToast(msg, type, dur),
    addToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast"
            style={{
              borderLeft:
                t.type === 'success'
                  ? '4px solid var(--emerald)'
                  : t.type === 'error'
                  ? '4px solid var(--rose)'
                  : t.type === 'warning'
                  ? '4px solid var(--amber)'
                  : '4px solid var(--primary)',
            }}
          >
            {t.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--emerald)' }} />}
            {t.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--rose)' }} />}
            {t.type === 'warning' && <AlertCircle size={18} style={{ color: 'var(--amber)' }} />}
            {t.type === 'info' && <Info size={18} style={{ color: 'var(--primary)' }} />}

            <span style={{ flex: 1, fontSize: '0.88rem' }}>{t.message}</span>

            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log('[TOAST SUCCESS]', msg),
      error: (msg) => console.error('[TOAST ERROR]', msg),
      info: (msg) => console.log('[TOAST INFO]', msg),
      warning: (msg) => console.warn('[TOAST WARN]', msg),
      showToast: (msg) => console.log('[TOAST]', msg),
      addToast: (msg) => console.log('[TOAST]', msg),
    };
  }
  return context;
};
