import { useEffect } from 'react';

/**
 * Блокирует прокрутку страницы.
 *
 * Используется для модальных окон,
 * меню, Drawer и т.п.
 *
 * @param {boolean} locked
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
