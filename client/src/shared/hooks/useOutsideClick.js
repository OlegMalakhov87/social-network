import { useEffect } from 'react';

const EMPTY_IGNORE_SELECTORS = [];

/**
 * Вызывает callback при клике вне указанного элемента.
 *
 * @param {React.RefObject<HTMLElement>} ref - реф на элемент
 * @param {Function} onOutsideClick - функция вызывается при клике вне элемента
 * @param {boolean} [enabled=true] - включен ли хук
 * @param {Object} [options] - дополнительные опции
 * @param {string[]} [options.ignoreSelectors=[]] - селекторы, клики по которым игнорируются
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
