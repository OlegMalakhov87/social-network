import { useEffect, useRef } from 'react';

/**
 * Создаёт AbortController для каждого эффекта.
 *
 * Позволяет безопасно отменять fetch-запросы
 * при размонтировании компонента.
 *
 * @param {(signal: AbortSignal) => void|Promise<void>} callback
 * @param {React.DependencyList} deps
 */
export function useAbortableRequest(callback, deps = []) {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    const controller = new AbortController();

    callbackRef.current(controller.signal);

    return () => {
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
