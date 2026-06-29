import { apiFetch } from '../../../shared/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Получить список всех пользователей со статусом связи.
 * @param {Object} params
 * @param {numder} params.page
 * @param {number} params.limit
 * @returns {Promise<Object>} { users, count }
 */
export async function fetchUsersWithFriendshipStatus({
  page = 1,
  limit = 30,
} = {}) {
  const url = new URL(`${BASE_URL}/friends/with-friendship-status`);
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  const response = await apiFetch(url.toString());
  if (!response.ok)
    throw new Error(`Ошибка загрузки пользователей: ${response.status}`);
  return response.json();
}

/**
 * Получить статус дружбы с конкретным пользователем.
 * @param {number} targetUserId
 * @returns {Promise<Object>}
 */
export async function fetchFriendshipStatus(targetUserId) {
  const response = await apiFetch(`${BASE_URL}/friends/status/${targetUserId}`);
  if (!response.ok)
    throw new Error(`Ошибка получения статуса: ${response.status}`);
  return response.json();
}

/**
 * Получить список друзей (принятые заявки).
 * @param {number} userId
 * @returns {Promise<Object>} { friends, count }
 */
export async function fetchFriends(userId) {
  const response = await apiFetch(`${BASE_URL}/friends/${userId}`);
  if (!response.ok)
    throw new Error(`Ошибка загрузки друзей: ${response.status}`);
  return response.json();
}

/**
 * Получить список друзей-друзей (друзья друзей).
 * @param {number} userId
 * @returns {Promise<Object>} { friends, count }
 */
export async function fetchFriendsOfFriends(userId) {
  const response = await apiFetch(
    `${BASE_URL}/friends/${userId}/friends-of-friends`
  );
  if (!response.ok)
    throw new Error(`Ошибка загрузки друзей друзей: ${response.status}`);
  return response.json();
}

/**
 * Получить входящие заявки в друзья.
 * @param {number} userId
 * @returns {Promise<Object>} { requests, count }
 */
export async function fetchIncomingRequests(userId) {
  const response = await apiFetch(
    `${BASE_URL}/friends/${userId}/requests/incoming`
  );
  if (!response.ok)
    throw new Error(`Ошибка загрузки входящих заявок: ${response.status}`);
  return response.json();
}

/**
 * Получить исходящие заявки в друзья.
 * @param {number} userId
 * @returns {Promise<Object>} { requests, count }
 */
export async function fetchOutgoingRequests(userId) {
  const response = await apiFetch(
    `${BASE_URL}/friends/${userId}/requests/outgoing`
  );
  if (!response.ok)
    throw new Error(`Ошибка загрузки исходящих заявок: ${response.status}`);
  return response.json();
}

/**
 * Отправить заявку в друзья.
 * @param {number} friendId – ID пользователя, которому отправляем заявку
 */
export async function sendFriendRequest(friendId) {
  const response = await apiFetch(`${BASE_URL}/friends`, {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  });
  if (!response.ok)
    throw new Error(`Ошибка отправки заявки: ${response.status}`);
  return response.json();
}

/**
 * Принять заявку в друзья.
 * @param {number} friendshipId
 */
export async function acceptFriendRequest(friendshipId) {
  const response = await apiFetch(
    `${BASE_URL}/friends/${friendshipId}/accept`,
    {
      method: 'PUT',
    }
  );
  if (!response.ok)
    throw new Error(`Ошибка принятия заявки: ${response.status}`);
  return response.json();
}

/**
 * Отклонить заявку (удалить запись).
 * @param {number} friendshipId
 */
export async function rejectFriendRequest(friendshipId) {
  const response = await apiFetch(
    `${BASE_URL}/friends/${friendshipId}/reject`,
    {
      method: 'DELETE',
    }
  );
  if (!response.ok)
    throw new Error(`Ошибка отклонения заявки: ${response.status}`);
  return response.json();
}

/**
 * Удалить из друзей (любое направление).
 * @param {number} friendshipId
 */
export async function deleteFriend(friendshipId) {
  const response = await apiFetch(`${BASE_URL}/friends/${friendshipId}`, {
    method: 'DELETE',
  });
  if (!response.ok)
    throw new Error(`Ошибка удаления друга: ${response.status}`);
  return response.json();
}

/**
 * Заблокировать пользователя.
 * @param {number} friendId
 */
export async function blockUser(friendId) {
  const response = await apiFetch(`${BASE_URL}/friends/block`, {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  });
  if (!response.ok) throw new Error(`Ошибка блокировки: ${response.status}`);
  return response.json();
}
