import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Скролл к верху страницы при переходе на новую страницу.
 *
 * @returns {null}
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
