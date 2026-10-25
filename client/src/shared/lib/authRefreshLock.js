/**
 * Хранит имя блокировки обновления сессии.
 */
const AUTH_REFRESH_LOCK = 'socialnet:auth-refresh';

/**
 * Выполняет операцию под исключительной блокировкой вкладок одного источника.
 *
 * @param {Function} operation - Возвращает промис операции
 * @returns {Promise<*>} Результат операции.
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
