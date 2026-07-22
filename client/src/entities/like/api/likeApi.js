import { api } from '../../../shared/api';

/**
 * Поставить лайк сущности.
 * @param {string} targetType - тип сущности ('Post', 'Music', 'Video', 'News', 'Comment')
 * @param {number} targetId - ID сущности
 * @returns {Promise<Object>} ответ сервера
 */
export const addLikeApi = async (targetType, targetId) => {
  const response = await api.post(`/likes/${targetType}/${targetId}`);
  return response.data;
};

/**
 * Убрать лайк с сущности.
 * @param {string} targetType - тип сущности ('Post', 'Music', 'Video', 'News', 'Comment')
 * @param {number} targetId - ID сущности
 * @returns {Promise<Object>} ответ сервера
 */
export const deleteLikeApi = async (targetType, targetId) => {
  const response = await api.delete(`/likes/${targetType}/${targetId}`);
  return response.data;
};
