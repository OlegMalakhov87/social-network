import { apiAxios } from '..';

/**
 * API для взаимодействия с сервером.
 *
 * @returns {Object} - объект с методами для взаимодействия с сервером
 */

export const api = {
  /** Метод для получения данных. */
  get: apiAxios.get.bind(apiAxios),
  /** Метод для отправки данных. */
  post: apiAxios.post.bind(apiAxios),
  /** Метод для обновления данных. */
  put: apiAxios.put.bind(apiAxios),
  /** Метод для частичного обновления данных. */
  patch: apiAxios.patch.bind(apiAxios),
  /** Метод для удаления данных. */
  delete: apiAxios.delete.bind(apiAxios),
};
