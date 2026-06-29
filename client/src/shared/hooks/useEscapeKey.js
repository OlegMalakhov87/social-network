import { useEffect } from 'react';

/**
 * Выполняет callback при нажатии Escape.
 *
 * @param {Function} onEscape - Обработчик нажатия Escape.
 * @param {boolean} [enabled=true] - Активен ли обработчик.
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
