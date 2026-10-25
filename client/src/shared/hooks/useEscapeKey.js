import { useEffect } from 'react';

/**
 * Вызывает обработчик при нажатии Escape.
 *
 * @param {Function} onEscape - Обработчик нажатия Escape
 * @param {boolean} [enabled=true] - Обработчик активен
 * @param {boolean} [ignoreWhenModalOpen=false] - Игнорирует Escape, если открыто модальное наложение
 * @returns {void}
 */
export function useEscapeKey(
  onEscape,
  enabled = true,
  ignoreWhenModalOpen = false
) {
  useEffect(() => {
    if (!enabled) return;

    /**
     * Вызывает внешний обработчик, если нажата Escape и нет модального наложения.
     *
     * @param {KeyboardEvent} event - Событие клавиатуры
     * @returns {void}
     */
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
