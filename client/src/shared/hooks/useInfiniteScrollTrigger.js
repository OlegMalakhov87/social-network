import { useEffect, useRef } from 'react';

/**
 * Вызывает загрузку следующей страницы при приближении к концу списка.
 *
 * @param {Object} params - Параметры наблюдения
 * @param {boolean} params.hasMore - Есть ещё данные
 * @param {boolean} params.isLoadingMore - Следующая страница уже загружается
 * @param {Function} params.onLoadMore - Загружает следующую страницу
 * @param {string} [params.rootMargin='300px'] - Отступ области наблюдения
 * @param {import('react').RefObject} [params.rootRef] - Ссылка на контейнер прокрутки
 * @returns {import('react').RefObject} Ссылка на элемент в конце списка.
 */
export const useInfiniteScrollTrigger = ({
  hasMore,
  isLoadingMore,
  onLoadMore,
  rootMargin = '300px',
  rootRef,
}) => {
  const triggerRef = useRef(null);
  const root = rootRef?.current ?? null;

  useEffect(() => {
    const element = triggerRef.current;

    if (!element || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore?.();
        }
      },
      {
        rootMargin,
        root,
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, rootMargin, root]);

  return triggerRef;
};
