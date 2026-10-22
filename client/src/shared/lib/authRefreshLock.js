/**
 * Название блокировки для обмена сообщениями между вкладками.
 */

const AUTH_REFRESH_LOCK = 'socialnet:auth-refresh';

/**
 * Выполняет операцию под эксклюзивной блокировкой,
 * общей для вкладок одного origin.
 *
 * @template T
 * @param {() => Promise<T>} operation - Операция для выполнения под блокировкой
 * @returns {Promise<T>} - Promise с результатом операции
 */
export const withAuthRefreshLock = (operation) => {
  if (!navigator.locks?.request) {
    return Promise.reject(
      new Error('Web Locks API недоступен в этом браузере')
    );
  }

  return navigator.locks.request(
    AUTH_REFRESH_LOCK,
    { mode: 'exclusive' },
    operation
  );
};
