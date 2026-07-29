import { createContext, useCallback, useContext, useState } from 'react';
import { ToastContainer } from './ToastContainer';

const ToastContext = createContext(null);

/**
 * Провайдер системы уведомлений.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент провайдера
 * @returns {JSX.Element}
 */

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const value = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    warning: (message) => showToast(message, 'warning'),
    info: (message) => showToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
