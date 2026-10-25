import { useCallback, useEffect, useRef, useState } from 'react';

import { createAbortableFetch, parseApiError } from '../lib';

/**
 * Проверяет, отменён ли запрос.
 *
 * @param {Object} err - Ошибка запроса
 * @param {string} [err.name] - Имя ошибки
 * @param {string} [err.code] - Код ошибки
 * @returns {boolean} Признак отмены запроса.
 */
const isRequestCanceled = (err) =>
  err?.name === 'AbortError' ||
  err?.name === 'CanceledError' ||
  err?.code === 'ERR_CANCELED';

/**
 * Загружает страницы списка и отменяет устаревший запрос.
 *
 * @param {Object} params - Параметры загрузки
 * @param {Function} params.fetchFn - Загружает страницу
 * @param {Array} [params.deps=[]] - Зависимости перезагрузки первой страницы
 * @param {number} [params.limit=30] - Размер страницы
 * @param {Function} [params.onSuccess] - Обрабатывает успешную загрузку
 * @param {Function} [params.onError] - Обрабатывает ошибку загрузки
 * @param {Array} [params.initialItems=[]] - Начальные элементы
 * @returns {{
 *   items: Array,
 *   setItems: Function,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   hasMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   refetch: Function,
 *   reset: Function,
 *   loadFirstPage: Function,
 *   currentPage: number
 * }} Список, состояние загрузки и методы управления.
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

  if (!firstPageFetcherRef.current)
    firstPageFetcherRef.current = createAbortableFetch();
  if (!loadMoreFetcherRef.current)
    loadMoreFetcherRef.current = createAbortableFetch();

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  /**
   * Загружает первую страницу и отменяет предыдущий запрос.
   *
   * @returns {Promise<void>}
   */
  const loadFirstPage = useCallback(async () => {
    loadMoreFetcherRef.current.cleanup();
    const controller = firstPageFetcherRef.current.createController();

    setIsLoading(true);
    setIsLoadingMore(false);
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
      const parsedError = parseApiError(err, 'Ошибка загрузки данных');
      setError(parsedError);
      onErrorRef.current?.(parsedError);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [limit]);

  /**
   * Добавляет следующую страницу к списку.
   *
   * @returns {Promise<void>}
   */
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
      const parsedError = parseApiError(err, 'Ошибка загрузки данных');
      setError(parsedError);
      onErrorRef.current?.(parsedError);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingMore(false);
      }
    }
  }, [page, limit, isLoading, isLoadingMore, hasMore]);

  /**
   * Загружает первую страницу заново.
   *
   * @returns {Promise<void>}
   */
  const refetch = useCallback(async () => {
    await loadFirstPage();
  }, [loadFirstPage]);

  /**
   * Возвращает список к начальному состоянию и отменяет запросы.
   *
   * @returns {void}
   */
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
    setItems([]);
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
    currentPage: page,
  };
};
