import { api } from '../../../shared/api';
import { LikeSchema } from '../model/likeSchema';

/**
 * Поставить лайк сущности.
 * @param {string} targetType - тип сущности
 * @param {number} targetId - ID сущности
 * @returns {Promise<Object>} { like, likesCount }
 */
export const addLikeApi = async (targetType, targetId) => {
  const response = await api.post(`/likes/${targetType}/${targetId}/add`);
  return {
    like: LikeSchema.parse(response.data?.like),
    likesCount: response.data?.likesCount,
  };
};

/**
 * Убрать лайк с сущности.
 * @param {string} targetType - тип сущности
 * @param {number} targetId - ID сущности
 * @returns {Promise<Object>} { message, targetType, targetId, likesCount }
 */
export const deleteLikeApi = async (targetType, targetId) => {
  const response = await api.delete(`/likes/${targetType}/${targetId}/delete`);
  return response.data;
};
