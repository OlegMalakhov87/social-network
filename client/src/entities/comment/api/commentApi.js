import { CommentSchema, CommentsListSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Возвращает комментарии сущности.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {string} [params.targetType] - Тип сущности
 * @param {number} [params.targetId] - Идентификатор сущности
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {string} [params.sortKey] - Ключ сортировки
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @returns {Promise<{ comments: Object[], pagination: Object }>} Комментарии и пагинация
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
 * Возвращает комментарий по идентификатору.
 *
 * @param {number} commentId - Идентификатор комментария
 * @returns {Promise<Object>} Комментарий
 */
export const fetchCommentById = async (commentId) => {
  const response = await api.get(`/comments/${commentId}/shared`);
  return CommentSchema.parse(response.data?.comment);
};

/**
 * Добавляет комментарий.
 *
 * @param {Object} data - Данные комментария
 * @returns {Promise<Object>} Комментарий
 */
export const addCommentApi = async (data) => {
  const response = await api.post(`/comments/add`, data);
  return CommentSchema.parse(response.data?.comment);
};

/**
 * Обновляет комментарий по идентификатору.
 *
 * @param {number} commentId - Идентификатор комментария
 * @param {Object} updates - Поля комментария
 * @returns {Promise<Object>} Комментарий
 */
export const updateCommentApi = async (commentId, updates) => {
  const response = await api.patch(`/comments/${commentId}/update`, updates);
  return CommentSchema.parse(response.data?.comment);
};

/**
 * Удаляет комментарий по идентификатору.
 *
 * @param {number} commentId - Идентификатор комментария
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteCommentApi = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}/delete`);
  return response.data;
};
