import { api } from '../../../shared/api';
import { UsersListSchema } from '../../user';

/**
 * Возвращает пользователей со статусом связи.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {string} [params.filter] - Фильтр категории
 * @param {string} [params.q] - Поисковый запрос
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @returns {Promise<{ users: Object[], pagination: Object }>} Пользователи и пагинация
 */
export const fetchFriendsApi = async ({
  page,
  limit,
  filter,
  q,
  signal,
} = {}) => {
  const response = await api.get('/friends/with-friendship-status', {
    params: {
      page,
      limit,
      category: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
    },
    signal,
  });

  return {
    users: UsersListSchema.parse(response.data?.users),
    pagination: response.data?.pagination,
  };
};

/**
 * Отправляет заявку в друзья.
 *
 * @param {number} friendId - Идентификатор пользователя
 * @returns {Promise<Object>} Ответ сервера
 */
export const sendFriendRequest = async (friendId) => {
  const response = await api.post(`/friends/requests`, {
    friendId,
  });
  return response.data;
};

/**
 * Принимает заявку в друзья.
 *
 * @param {number} friendshipId - Идентификатор заявки
 * @returns {Promise<Object>} Ответ сервера
 */
export const acceptFriendRequest = async (friendshipId) => {
  const response = await api.patch(`/friends/${friendshipId}/accept`);
  return response.data;
};

/**
 * Блокирует пользователя.
 *
 * @param {number} friendId - Идентификатор пользователя
 * @returns {Promise<Object>} Ответ сервера
 */
export const blockUser = async (friendId) => {
  const response = await api.patch(`/friends/block`, { friendId });
  return response.data;
};

/**
 * Отклоняет заявку, удаляет из друзей или снимает блокировку.
 *
 * @param {number} friendshipId - Идентификатор заявки
 * @returns {Promise<Object>} Ответ сервера
 */
export const rejectFriendRequest = async (friendshipId) => {
  const response = await api.delete(`/friends/${friendshipId}/reject`);
  return response.data;
};
