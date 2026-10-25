/**
 * Создаёт контроллер отмены для последовательных запросов.
 *
 * @returns {{ createController: Function, abort: Function, cleanup: Function }} Создание контроллера, отмена и очистка.
 */
export const createAbortableFetch = () => {
  let controllerRef = null;

  /**
   * Отменяет текущий запрос.
   *
   * @returns {void}
   */
  const abort = () => {
    if (controllerRef) {
      controllerRef.abort();
      controllerRef = null;
    }
  };

  /**
   * Отменяет предыдущий запрос и возвращает новый контроллер.
   *
   * @returns {AbortController} Контроллер текущего запроса.
   */
  const createController = () => {
    abort();
    const controller = new AbortController();
    controllerRef = controller;
    return controller;
  };

  /**
   * Отменяет текущий запрос при очистке.
   *
   * @returns {void}
   */
  const cleanup = () => abort();

  return { createController, abort, cleanup };
};
