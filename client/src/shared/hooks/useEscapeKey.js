import { useEffect } from 'react';

/**
 * Функция для выполнения callback при нажатии Escape.
 *
 * @param {Function} onEscape - функция для выполнения действия при нажатии Escape
 * @param {boolean} [enabled=true] - активен ли обработчик
 * @param {boolean} [ignoreWhenModalOpen=false] -
 * игнорировать Escape, если открыт Modal
 */
export function useEscapeKey(
  onEscape,
  enabled = true,
  ignoreWhenModalOpen = false
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      if (
        ignoreWhenModalOpen &&
        document.querySelector('[data-modal-overlay]')
      ) {
        return;
      }

      onEscape?.(event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onEscape, ignoreWhenModalOpen]);
}
