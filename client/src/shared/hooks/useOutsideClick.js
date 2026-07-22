import { useEffect } from 'react';

/**
 * Вызывает callback при клике вне указанного элемента.
 *
 * @param {Object} params - параметры запроса
 * @param {React.RefObject<HTMLElement>} params.ref - реф на элемент
 * @param {Function} params.onOutsideClick - функция вызывается при клике вне элемента
 * @param {boolean} [params.enabled=true] - включен ли хук
 */

export const useOutsideClick = ({ ref, onOutsideClick, enabled = true }) => {
  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event) => {
      if (!ref.current) return;

      if (!ref.current.contains(event.target)) {
        onOutsideClick?.(event);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref, onOutsideClick, enabled]);
};
