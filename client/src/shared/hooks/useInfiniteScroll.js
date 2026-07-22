import { useCallback, useEffect, useState } from 'react';
import { createAbortableFetch } from '../lib';

/**
 * Универсальный хук для бесконечной загрузки с пагинацией.
 *
 * @param {Object} params - параметры запроса
 * @param {Function} params.fetchFn - функция загрузки данных
 * @param {Array} [params.deps=[]] - зависимости для перезапуска запроса
 * @param {number} [params.limit=30] - лимит на страницу
 * @param {Function} [params.onSuccess] - функция для выполнения действия при успешном запросе
 * @param {Function} [params.onError] - функция для выполнения действия при ошибке запроса
 * @param {Array} [params.initialItems=[]] - начальные данные
 * @returns {Object} - объект с данными о запросе
 */
export const useInfiniteScroll = ({
  fetchFn,
  deps = [],
  limit = 30,
  onSuccess,
  onError,
  initialItems = [],
}) => {
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
};
