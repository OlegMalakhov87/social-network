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
 * @param {React.RefObject} [params.rootRef] - Ref на элемент, относительно которого наблюдается пересечение
 * @returns {React.RefObject} ref для sentinel-элемента
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
