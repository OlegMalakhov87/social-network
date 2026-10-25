import { api } from '../../../shared/api';
import { LikeSchema } from '../model/likeSchema';

/**
 * Ставит лайк сущности.
 *
 * @param {string} targetType - Тип сущности
 * @param {number} targetId - Идентификатор сущности
 * @returns {Promise<{ like: Object, likesCount: number }>} Лайк и число лайков
 */
export const addLikeApi = async (targetType, targetId) => {
  const response = await api.post(`/likes/${targetType}/${targetId}/add`);
  return {
    like: LikeSchema.parse(response.data?.like),
    likesCount: response.data?.likesCount,
  };
};

/**
 * Снимает лайк с сущности.
 *
 * @param {string} targetType - Тип сущности
 * @param {number} targetId - Идентификатор сущности
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteLikeApi = async (targetType, targetId) => {
  const response = await api.delete(`/likes/${targetType}/${targetId}/delete`);
  return response.data;
};
