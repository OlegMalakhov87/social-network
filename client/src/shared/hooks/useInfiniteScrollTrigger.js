import { useEffect, useRef } from 'react';

/**
 * Триггер для автоматической загрузки следующей страницы
 * при приближении к концу списка.
 *
 * @param {Object} params
 * @param {boolean} params.hasMore - Есть ли ещё данные
 * @param {boolean} params.isLoadingMore - Идёт ли загрузка следующей страницы
 * @param {Function} params.onLoadMore - Загрузка следующей страницы
 * @param {string} [params.rootMargin='300px'] - Отступ от viewport для срабатывания
 * @returns {React.RefObject} ref для sentinel-элемента
 */
export const useInfiniteScrollTrigger = ({
  hasMore,
  isLoadingMore,
  onLoadMore,
  rootMargin = '300px',
}) => {
  const triggerRef = useRef(null);

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
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, rootMargin]);

  return triggerRef;
};