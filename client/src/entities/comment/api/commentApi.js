import { CommentSchema, CommentsListSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Получить комментарии для конкретной сущности.
 * @param {Object} params - параметры запроса
 * @param {string} params.targetType – 'posts' | 'tracks' | 'videos' | 'news'
 * @param {number} params.targetId - ID сущности
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.sortKey - ключ сортировки
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { comments, pagination }
 */
export const fetchCommentsApi = async ({
  targetType,
  targetId,
  page,
  limit,
  sortKey,
  signal,
} = {}) => {
  const response = await api.get(`/comments/${targetType}/${targetId}`, {
    params: { page, limit, sortKey },
    signal,
  });

  const comments = CommentsListSchema.parse(response.data?.comments);
  const pagination = response.data?.pagination;
  return { comments, pagination };
};

/**
 * Получить комментарий по ID (для кнопки поделиться).
 * @param {number} commentId - ID комментария
 * @returns {Promise<Object>} { comment }
 */
export const fetchCommentById = async (commentId) => {
  const response = await api.get(`/comments/${commentId}/shared`);
  return CommentSchema.parse(response.data?.comment);
};

/**
 * Добавить комментарий.
 * @param {Object} data - данные комментария
 * @returns {Promise<Object>} { comment }
 */
export const addCommentApi = async (data) => {
  const response = await api.post(`/comments/add`, data);
  return CommentSchema.parse(response.data?.comment);
};

/**
 * Изменить комментарий по ID.
 * @param {number} commentId - ID комментария
 * @param {Object}  updates - поля комментария
 * @returns {Promise<Object>} { comment }
 */
export const updateCommentApi = async (commentId, updates) => {
  const response = await api.patch(`/comments/${commentId}/update`, updates);
  return CommentSchema.parse(response.data?.comment);
};

/**
 * Удалить комментарий по ID
 * @param {number} commentId - ID комментария
 * @returns {Promise<Object>} { message, commentId }
 */
export const deleteCommentApi = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}/delete`);
  return response.data;
};
