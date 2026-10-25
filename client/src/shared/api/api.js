import { apiAxios } from './apiAxios';

/**
 * Выполняет запросы HTTP к серверу.
 */
export const api = {
  /** Возвращает данные. */
  get: apiAxios.get.bind(apiAxios),
  /** Отправляет данные. */
  post: apiAxios.post.bind(apiAxios),
  /** Заменяет данные. */
  put: apiAxios.put.bind(apiAxios),
  /** Частично обновляет данные. */
  patch: apiAxios.patch.bind(apiAxios),
  /** Удаляет данные. */
  delete: apiAxios.delete.bind(apiAxios),
};
