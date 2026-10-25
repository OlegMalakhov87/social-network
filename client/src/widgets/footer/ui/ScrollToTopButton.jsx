import { useEffect, useState } from 'react';

import { Button } from '../../../shared/ui';
import { classNames } from '../../../shared/utils';

import style from './ScrollToTopButton.module.css';

/**
 * Отображает кнопку прокрутки наверх.
 * Показывает кнопку после смещения страницы более чем на 400 пикселей.
 *
 * @returns {JSX.Element} Разметка кнопки.
 */
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      variant="primary"
      className={classNames(style.scrollTop, isVisible && style.visible)}
      onClick={scrollToTop}
      ariaLabel="Прокрутить наверх"
    >
      ↑
    </Button>
  );
};
