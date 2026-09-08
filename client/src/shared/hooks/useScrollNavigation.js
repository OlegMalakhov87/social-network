import { useCallback, useEffect, useState } from 'react';

/**
 * Хук для управления прокруткой.
 *
 * @param {Object} props
 * @param {React.RefObject} props.containerRef - Ссылка на scroll-контейнер.
 * @returns {{
 *   isPastMiddle: boolean,
 *   scrollToTop: () => void,
 *   scrollToBottom: () => void
 * }}
 */

export const useScrollNavigation = ({ containerRef }) => {
  const [isPastMiddle, setIsPastMiddle] = useState(false);

  /** Обработка прокрутки контейнера */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;

      setIsPastMiddle(maxScroll > 0 && container.scrollTop >= maxScroll / 2);
    };

    handleScroll();

    container.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  /** Прокрутка к началу */
  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [containerRef]);

  /** Прокрутка к концу */
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [containerRef]);

  return {
    isPastMiddle,
    scrollToTop,
    scrollToBottom,
  };
};
