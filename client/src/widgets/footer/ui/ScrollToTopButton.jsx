import { useEffect, useState } from 'react';
import { classNames } from '../../../shared/lib';
import { Button } from '../../../shared/ui';
import style from './ScrollToTopButton.module.css';

/**
 * Плавающая кнопка "Прокрутить наверх".
 * Появляется при скролле вниз на 400px.
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
