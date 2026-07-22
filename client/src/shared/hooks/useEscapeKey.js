import { useEffect } from 'react';

/**
 * Функция для выполнения callback при нажатии Escape.
 *
 * @param {Function} onEscape - функция для выполнения действия при нажатии Escape
 * @param {boolean} [enabled=true] - активен ли обработчик
 */
export function useEscapeKey(onEscape, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onEscape?.(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onEscape]);
}
