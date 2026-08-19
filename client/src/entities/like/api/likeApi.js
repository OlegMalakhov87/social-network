import { api } from '../../../shared/api';
import { unwrapApiEntity } from '../../../shared/lib';

/**
 * Поставить лайк сущности.
 * @param {string} targetType - тип сущности
 * @param {number} targetId - ID сущности
 * @returns {Promise<Object>} ответ сервера
 */
export const addLikeApi = async (targetType, targetId) => {
  const response = await api.post(`/likes/${targetType}/${targetId}/add`);
  return unwrapApiEntity(response.data, ['likes']);
};

/**
 * Убрать лайк с сущности.
 * @param {string} targetType - тип сущности
 * @param {number} targetId - ID сущности
 * @returns {Promise<Object>} ответ сервера
 */
export const deleteLikeApi = async (targetType, targetId) => {
  const response = await api.delete(`/likes/${targetType}/${targetId}/delete`);
  return unwrapApiEntity(response.data, ['likes']);
};
