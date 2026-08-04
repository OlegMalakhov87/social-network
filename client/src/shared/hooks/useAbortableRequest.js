import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Универсальный хук для отменяемых асинхронных запросов.
 *
 * @param {Object} params - параметры запроса
 * @param {Function} params.fetcher - функция запроса
 * @param {Array} [params.deps=[]] - зависимости для перезапуска запроса
 * @param {Object} [params.options={}] - опции запроса
 * @returns {Object} - объект с данными о запросе
 */

export const useAbortableRequest = ({ fetcher, deps = [], options = {} }) => {
  const {
    autoFetch = true,
    initialData = null,
    onSuccess,
    onError,
    onFinally,
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const fetcherRef = useRef(fetcher);
  const isMountedRef = useRef(true);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onFinallyRef = useRef(onFinally);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onFinallyRef.current = onFinally;
  }, [onSuccess, onError, onFinally]);

  // Отслеживаем монтирование
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Функция отмены
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Функция сброса
  const reset = useCallback(() => {
    abort();
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData, abort]);

  // Основная функция выполнения
  const execute = useCallback(
    async (...args) => {
      // Отменяем предыдущий запрос
      abort();

      if (!isMountedRef.current) return;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current(controller.signal, ...args);

        // Проверяем, не был ли запрос отменён
        if (controller.signal.aborted || !isMountedRef.current) {
          return undefined;
        }

        setData(result);
        onSuccessRef.current?.(result);
        return result;
      } catch (err) {
        if (err.name === 'AbortError' || !isMountedRef.current) {
          return undefined;
        }
        setError(err);
        console.error('Ошибка запроса:', err);
        onErrorRef.current?.(err);
        throw err;
      } finally {
        if (controller.signal.aborted || !isMountedRef.current) {
          return;
        }
        setIsLoading(false);
        onFinallyRef.current?.();
      }
    },
    [abort]
  );

  // Автоматический запрос
  useEffect(
    () => {
      if (autoFetch) {
        execute();
      }
      return abort;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return {
    data,
    isLoading,
    error,
    execute,
    abort,
    reset,
    setData,
    setError,
  };
};
