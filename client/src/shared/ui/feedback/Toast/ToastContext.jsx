import { createContext, useCallback, useContext, useState } from 'react';

import { ToastContainer } from './ToastContainer';

const ToastContext = createContext(null);

/**
 * Предоставляет методы показа всплывающих уведомлений.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @returns {JSX.Element} Контекст уведомлений и их список.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Удаляет всплывающее уведомление по идентификатору.
   *
   * @param {number} id - Идентификатор уведомления
   * @returns {void}
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Показывает всплывающее уведомление и скрывает его через заданное время.
   *
   * @param {string} message - Текст уведомления
   * @param {'success'|'error'|'warning'|'info'} [type='info'] - Тип уведомления
   * @param {number} [duration=4000] - Время показа в миллисекундах
   * @returns {void}
   */
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

/**
 * Возвращает методы показа всплывающих уведомлений.
 *
 * @returns {{success: Function, error: Function, warning: Function, info: Function}|null} Методы уведомлений или null вне контекста.
 */
export const useToast = () => useContext(ToastContext);
