import { api } from '../../../shared/api';

/**
 * Получить список всех пользователей со статусом связи.
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.filter - фильтр
 * @param {string} [params.q] - поисковый запрос
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { friends, pagination }
 */
export const fetchFriendsApi = async ({ page, limit, filter, q, signal }) => {
  const response = await api.get('/friends/with-friendship-status', {
    params: {
      page,
      limit,
      status: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
    },
    signal,
  });
  return {
    items: response.data.users || [],
    pagination: response.data.pagination || {},
  };
};

/**
 * Получить статус дружбы с конкретным пользователем.
 *
 * @param {number} targetUserId - ID пользователя
 * @param {AbortSignal} signal - сигнал отмены запроса
 * @returns {Promise<Object>} { friendshipStatus }
 */
export const fetchFriendshipStatus = async (targetUserId, signal) => {
  const response = await api.get(`/friends/status/${targetUserId}`, { signal });
  return response.data;
};

/**
 * Отправить заявку в друзья.
 * @param {number} friendId – ID пользователя, которому отправляем заявку
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
 */
export const acceptFriendRequest = async (friendshipId) => {
  const response = await api.put(`/friends/${friendshipId}/accept`);
  return response.data;
};

/**
 * Отклонить заявку (удалить запись).
 * @param {number} friendshipId - ID заявки
 */
export const rejectFriendRequest = async (friendshipId) => {
  const response = await api.delete(`/friends/${friendshipId}/reject`);
  return response.data;
};

/**
 * Удалить из друзей (любое направление).
 * @param {number} friendshipId - ID заявки
 */
export const deleteFriend = async (friendshipId) => {
  const response = await api.delete(`/friends/${friendshipId}/delete`);
  return response.data;
};

/**
 * Заблокировать пользователя.
 * @param {number} friendId - ID пользователя
 */
export const blockUser = async (friendId) => {
  const response = await api.post(`/friends/block`, { friendId });
  return response.data;
};
