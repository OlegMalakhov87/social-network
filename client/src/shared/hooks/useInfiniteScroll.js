import { useCallback, useEffect, useRef, useState } from 'react';
import { createAbortableFetch } from '../lib';

const isRequestCanceled = (err) =>
  err?.name === 'AbortError' ||
  err?.name === 'CanceledError' ||
  err?.code === 'ERR_CANCELED';

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

  const firstPageFetcherRef = useRef(null);
  const loadMoreFetcherRef = useRef(null);
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  if (!firstPageFetcherRef.current) firstPageFetcherRef.current = createAbortableFetch();
  if (!loadMoreFetcherRef.current) loadMoreFetcherRef.current = createAbortableFetch();

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const loadFirstPage = useCallback(async () => {
    const controller = firstPageFetcherRef.current.createController();

    setIsLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);

    try {
      const result = await fetchFnRef.current({
        page: 1,
        limit,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setItems(result.items);
      setHasMore(result.hasMore ?? false);
      onSuccessRef.current?.(result);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      setError(err);
      console.error('Ошибка загрузки данных:', err);
      onErrorRef.current?.(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [limit]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const controller = loadMoreFetcherRef.current.createController();

    setIsLoadingMore(true);
    setError(null);

    const nextPage = page + 1;

    try {
      const result = await fetchFnRef.current({
        page: nextPage,
        limit,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setItems((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore ?? false);
      onSuccessRef.current?.(result);
    } catch (err) {
      if (isRequestCanceled(err)) return;
      setError(err);
      console.error('Ошибка загрузки данных:', err);
      onErrorRef.current?.(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingMore(false);
      }
    }
  }, [page, limit, isLoading, isLoadingMore, hasMore]);

  const refetch = useCallback(async () => {
    await loadFirstPage();
  }, [loadFirstPage]);

  const reset = useCallback(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    setIsLoadingMore(false);
    firstPageFetcherRef.current.cleanup();
    loadMoreFetcherRef.current.cleanup();
  }, [initialItems]);

  useEffect(() => {
    loadFirstPage();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      firstPageFetcherRef.current?.cleanup();
      loadMoreFetcherRef.current?.cleanup();
    };
  }, []);

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
