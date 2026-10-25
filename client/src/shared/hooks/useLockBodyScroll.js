import { useEffect } from 'react';

/**
 * Блокирует прокрутку страницы.
 *
 * @param {boolean} [locked=true] - Прокрутка заблокирована
 * @returns {void}
 */
export function useLockBodyScroll(locked = true) {
  useEffect(() => {
    if (!locked) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
