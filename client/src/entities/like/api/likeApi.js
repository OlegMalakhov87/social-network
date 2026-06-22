import { apiAxios } from '../../../shared/api';

/**
 * Поставить лайк сущности.
 * @param {string} targetType – 'Post', 'Music', 'Video', 'News', 'Comment'
 * @param {number} targetId
 * @returns {Promise<Object>} ответ сервера
 */
export async function addLike(targetType, targetId) {
  const response = await apiAxios.post('/likes', { targetType, targetId });
  return response.data;
}

/**
 * Убрать лайк с сущности.
 * @param {string} targetType
 * @param {number} targetId
 * @returns {Promise<Object>}
 */
export async function deleteLike(targetType, targetId) {
  const response = await apiAxios.delete('/likes', {
    data: { targetType, targetId },
  });
  return response.data;
}
