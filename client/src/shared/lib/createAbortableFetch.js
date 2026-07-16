/**
 * Создаёт обёртку для отменяемого fetch-запроса.
 * Простая функция, которую можно использовать где угодно.
 *
 * @returns {Object} - { createController, abort, cleanup }
 */
export const createAbortableFetch = () => {
  let controllerRef = null;

  const abort = () => {
    if (controllerRef) {
      controllerRef.abort();
      controllerRef = null;
    }
  };

  const createController = () => {
    abort();
    const controller = new AbortController();
    controllerRef = controller;
    return controller;
  };

  const cleanup = () => abort();

  return { createController, abort, cleanup };
};
