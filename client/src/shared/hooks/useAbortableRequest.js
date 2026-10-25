import { useCallback, useEffect, useRef, useState } from 'react';

import { parseApiError } from '../lib';

/**
 * Выполняет асинхронный запрос и отменяет предыдущий.
 *
 * @param {Object} params - Параметры запроса
 * @param {Function} params.fetcher - Загружает данные и принимает сигнал отмены
 * @param {Array} [params.deps=[]] - Зависимости повторного запуска
 * @param {Object} [params.options={}] - Дополнительные параметры
 * @param {boolean} [params.options.autoFetch=true] - Запускает запрос сразу
 * @param {*} [params.options.initialData=null] - Начальные данные
 * @param {Function} [params.options.onSuccess] - Обрабатывает успешный результат
 * @param {Function} [params.options.onError] - Обрабатывает ошибку
 * @param {Function} [params.options.onFinally] - Вызывается после завершения запроса
 * @returns {{
 *   data: *,
 *   isLoading: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   execute: Function,
 *   abort: Function,
 *   reset: Function,
 *   setData: Function,
 *   setError: Function
 * }} Состояние запроса и методы управления.
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

  // Отменяет незавершённый запрос при размонтировании.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Отменяет текущий запрос.
   *
   * @returns {void}
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Отменяет запрос и возвращает начальное состояние.
   *
   * @returns {void}
   */
  const reset = useCallback(() => {
    abort();
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData, abort]);

  /**
   * Выполняет запрос и отменяет предыдущий.
   *
   * @param {...*} args - Аргументы загрузки
   * @returns {Promise<*|undefined>} Результат запроса или undefined, если запрос отменён или завершился ошибкой.
   */
  const execute = useCallback(
    async (...args) => {
      abort();

      if (!isMountedRef.current) return;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current(controller.signal, ...args);

        // Не записывает результат отменённого запроса.
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
        const parsedError = parseApiError(err, 'Ошибка запроса');
        setError(parsedError);
        onErrorRef.current?.(parsedError);
      } finally {
        if (!controller.signal.aborted && isMountedRef.current) {
          setIsLoading(false);
          onFinallyRef.current?.();
        }
      }
    },
    [abort]
  );

  // Повторяет запрос при смене зависимостей и отменяет предыдущий.
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
