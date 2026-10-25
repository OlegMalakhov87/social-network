import { useCallback, useEffect, useState } from 'react';

/**
 * Отслеживает прокрутку и перемещает контейнер к краям.
 *
 * @param {Object} props - Параметры прокрутки
 * @param {import('react').RefObject} props.containerRef - Ссылка на контейнер прокрутки
 * @returns {{
 *   isPastMiddle: boolean,
 *   scrollToTop: Function,
 *   scrollToBottom: Function
 * }} Признак середины и методы прокрутки.
 */
export const useScrollNavigation = ({ containerRef }) => {
  const [isPastMiddle, setIsPastMiddle] = useState(false);

  // Следит, пройдена ли середина прокрутки.
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    /**
     * Обновляет признак прохождения середины прокрутки.
     *
     * @returns {void}
     */
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

  /**
   * Прокручивает контейнер к началу.
   *
   * @returns {void}
   */
  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [containerRef]);

  /**
   * Прокручивает контейнер к концу.
   *
   * @returns {void}
   */
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
