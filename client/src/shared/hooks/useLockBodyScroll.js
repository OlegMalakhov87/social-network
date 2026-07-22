import { useEffect } from 'react';

/**
 * Блокирует прокрутку страницы.
 *
 * @param {boolean} [locked=true] - заблокировать прокрутку страницы
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
