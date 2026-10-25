import { useEffect } from 'react';

const EMPTY_IGNORE_SELECTORS = [];

/**
 * Вызывает обработчик при щелчке вне элемента.
 *
 * @param {import('react').RefObject<HTMLElement>} ref - Ссылка на элемент
 * @param {Function} onOutsideClick - Обработчик щелчка вне элемента
 * @param {boolean} [enabled=true] - Наблюдение включено
 * @param {Object} [options={}] - Дополнительные параметры
 * @param {string[]} [options.ignoreSelectors=[]] - Селекторы, щелчки по которым игнорируются
 * @returns {void}
 */
export const useOutsideClick = (
  ref,
  onOutsideClick,
  enabled = true,
  options = {}
) => {
  const ignoreSelectors = Array.isArray(options.ignoreSelectors)
    ? options.ignoreSelectors
    : EMPTY_IGNORE_SELECTORS;

  useEffect(() => {
    if (!enabled) return;

    /**
     * Вызывает внешний обработчик, если щелчок произошёл вне элемента.
     *
     * @param {MouseEvent} event - Событие щелчка
     * @returns {void}
     */
    const handleMouseDown = (event) => {
      if (!ref.current) return;

      const shouldIgnoreClick =
        event.target instanceof Element &&
        ignoreSelectors.some((selector) => event.target.closest(selector));

      if (shouldIgnoreClick) {
        return;
      }

      if (!ref.current.contains(event.target)) {
        onOutsideClick?.(event);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref, onOutsideClick, enabled, ignoreSelectors]);
};
