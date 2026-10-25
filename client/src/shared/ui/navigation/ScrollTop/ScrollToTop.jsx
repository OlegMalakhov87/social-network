import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Прокручивает страницу к началу при смене адреса.
 *
 * @returns {null} Ничего не отрисовывает.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
