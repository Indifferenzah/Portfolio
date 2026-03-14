import { createContext, useContext, useState, useCallback, useRef } from 'react';

// ── Toast context ────────────────────────────────────────────

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// ── Portfolio data context ───────────────────────────────────

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <PortfolioContext.Provider value={{ data, setData, loading, setLoading }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
