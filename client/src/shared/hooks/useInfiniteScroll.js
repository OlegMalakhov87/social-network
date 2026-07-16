import { useCallback, useEffect, useState } from 'react';
import { createAbortableFetch } from '../lib';

/**
 * Универсальный хук для бесконечной загрузки с пагинацией.
 *
 * @template T
 * @param {Object} config
 * @param {Function} config.fetchFn - функция загрузки данных (async)
 * @param {any[]} config.deps - зависимости для перезапуска
 * @param {number} config.limit - лимит на страницу (по умолчанию 30)
 * @param {Function} config.onSuccess - колбэк успеха
 * @param {Function} config.onError - колбэк ошибки
 * @param {T[]} config.initialItems - начальные данные
 * @returns {Object} - { items, isLoading, hasMore, error, loadMore, refetch, reset }
 */
export function useInfiniteScroll({
  fetchFn,
  deps = [],
  limit = 30,
  onSuccess,
  onError,
  initialItems = [],
}) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Создаём два независимых контроллера отмены
  const firstPageFetcher = createAbortableFetch();
  const loadMoreFetcher = createAbortableFetch();

  // Загрузка первой страницы
  const loadFirstPage = useCallback(async () => {
    const controller = firstPageFetcher.createController();

    setIsLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);

    try {
      const result = await fetchFn({
        page: 1,
        limit,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setItems(result.items);
      setHasMore(result.hasMore ?? false);
      onSuccess?.(result);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setError(err);
      console.error('Ошибка загрузки данных:', err);
      onError?.(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, onSuccess, onError, firstPageFetcher, limit]);

  // Загрузка следующей страницы
  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const controller = loadMoreFetcher.createController();

    setIsLoadingMore(true);
    setError(null);

    const nextPage = page + 1;

    try {
      const result = await fetchFn({
        page: nextPage,
        limit,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setItems((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore ?? false);
      onSuccess?.(result);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err);
      console.error('Ошибка загрузки данных:', err);
      onError?.(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingMore(false);
      }
    }
  }, [
    page,
    limit,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchFn,
    onSuccess,
    onError,
    loadMoreFetcher,
  ]);

  // Рефетч
  const refetch = useCallback(async () => {
    await loadFirstPage();
  }, [loadFirstPage]);

  // Сброс
  const reset = useCallback(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    setIsLoadingMore(false);
    firstPageFetcher.cleanup();
    loadMoreFetcher.cleanup();
  }, [initialItems, firstPageFetcher, loadMoreFetcher]);

  // Авто-запуск при изменении deps
  useEffect(() => {
    loadFirstPage();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      firstPageFetcher.cleanup();
      loadMoreFetcher.cleanup();
    };
  }, [firstPageFetcher, loadMoreFetcher]);

  return {
    items,
    setItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
    reset,
    loadFirstPage,
  };
}
