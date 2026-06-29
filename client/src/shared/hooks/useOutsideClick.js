import { useEffect } from 'react';

/**
 * Вызывает callback при клике вне указанного элемента.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {Function} onOutsideClick
 * @param {boolean} [enabled=true]
 */
export function useOutsideClick(ref, onOutsideClick, enabled = true) {
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
}
