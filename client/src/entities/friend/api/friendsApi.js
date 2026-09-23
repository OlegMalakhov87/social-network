import { api } from '../../../shared/api';
import { UsersListSchema } from '../../user';

/**
 * Получить список всех пользователей со статусом связи.
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.filter - фильтр
 * @param {string} [params.q] - поисковый запрос
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<{users: UsersListSchema, pagination}} {users, pagination}
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
 * Отправить заявку в друзья.
 * @param {number} friendId – ID пользователя, которому отправляем заявку
 * @returns {Promise<Object>} { friendshipId, friendshipStatus, friendshipDirection }
 */
export const sendFriendRequest = async (friendId) => {
  const response = await api.post(`/friends/requests`, {
    friendId,
  });
  return response.data;
};

/**
 * Принять заявку в друзья.
 * @param {number} friendshipId - ID заявки
 * @returns {Promise<Object>} { friendshipId, friendshipStatus, friendshipDirection }
 */
export const acceptFriendRequest = async (friendshipId) => {
  const response = await api.patch(`/friends/${friendshipId}/accept`);
  return response.data;
};

/**
 * Заблокировать пользователя.
 * @param {number} friendId - ID пользователя
 * @returns {Promise<Object>} { message }
 */
export const blockUser = async (friendId) => {
  const response = await api.patch(`/friends/block`, { friendId });
  return response.data;
};

/**
 * Удалить из друзей, разблокировать, отменить заявку на дружбу
 * @param {number} friendshipId - ID заявки
 * @returns {Promise<Object>} { message}
 */
export const rejectFriendRequest = async (friendshipId) => {
  const response = await api.delete(`/friends/${friendshipId}/reject`);
  return response.data;
};
