import { useCallback } from 'react';
import {
  acceptFriendRequest,
  blockUser,
  deleteFriend,
  rejectFriendRequest,
  sendFriendRequest,
} from '../../../entities/friend';

/**
 * Универсальный хук для управления дружбой.
 * Работает как с объектом пользователя, так и с массивом.
 *
 * @param {Object} params
 * @param {Function} params.setItems - функция обновления (принимает либо функцию, либо объект)
 * @param {Function} params.getCurrentData - функция, возвращающая текущие данные
 * @param {Function} params.getUserId - функция, извлекающая ID из данных
 * @param {Function} [params.onSuccess] - колбэк успеха
 * @param {Function} [params.onError] - колбэк ошибки
 * @returns {Object} - экшены
 */
export const useFriendshipActions = ({
  setItems,
  getCurrentData,
  getUserId,
  onSuccess,
  onError,
}) => {
  /** Обновление полей дружбы
   * @param {string} userId - ID пользователя
   * @param {Object} fields - поля для обновления
   */
  const updateFriendshipFields = useCallback(
    (userId, fields) => {
      setItems((prev) => {
        if (Array.isArray(prev)) {
          return prev.map((item) =>
            getUserId(item) === userId ? { ...item, ...fields } : item
          );
        }
        if (prev && getUserId(prev) === userId) {
          return { ...prev, ...fields };
        }
        return prev;
      });
    },
    [setItems, getUserId]
  );

  /** Отправка запроса на дружбу
   * @param {string} userId - ID пользователя
   */
  const follow = useCallback(
    async (userId) => {
      if (!userId) return;
      const prevData = getCurrentData();
      updateFriendshipFields(userId, {
        friendshipStatus: 'pending',
        friendshipDirection: 'outgoing',
        friendshipId: null,
      });
      try {
        const result = await sendFriendRequest(userId);
        const newFriendshipId = result?.friendshipId;
        if (newFriendshipId) {
          updateFriendshipFields(userId, { friendshipId: newFriendshipId });
        }
        onSuccess?.('send');
      } catch (error) {
        setItems(prevData);
        console.error('Ошибка при отправке запроса на дружбу', error);
        onError?.('send');
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  /** Отмена запроса на дружбу
   * @param {string} friendshipId - ID дружбы
   * @param {string} userId - ID пользователя
   */
  const unfollow = useCallback(
    async (friendshipId, userId) => {
      if (!friendshipId || !userId) return;
      const prevData = getCurrentData();
      updateFriendshipFields(userId, {
        friendshipStatus: null,
        friendshipDirection: null,
        friendshipId: null,
      });
      try {
        await rejectFriendRequest(friendshipId);
        onSuccess?.('cancel');
      } catch (error) {
        setItems(prevData);
        console.error('Ошибка при отмене запроса на дружбу', error);
        onError?.('cancel');
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  /** Принятие запроса на дружбу
   * @param {string} friendshipId - ID дружбы
   * @param {string} userId - ID пользователя
   */
  const accept = useCallback(
    async (friendshipId, userId) => {
      if (!friendshipId || !userId) return;
      const prevData = getCurrentData();
      updateFriendshipFields(userId, {
        friendshipStatus: 'accepted',
        friendshipDirection: 'incoming',
        friendshipId,
      });
      try {
        await acceptFriendRequest(friendshipId);
        onSuccess?.('accept');
      } catch (error) {
        setItems(prevData);
        console.error('Ошибка при принятии запроса на дружбу', error);
        onError?.('accept');
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  /** Блокировка пользователя
   * @param {string} userId - ID пользователя
   */
  const block = useCallback(
    async (userId) => {
      if (!userId) return;
      const prevData = getCurrentData();
      updateFriendshipFields(userId, {
        friendshipStatus: 'blocked',
        friendshipDirection: 'incoming',
        friendshipId: null,
      });
      try {
        const result = await blockUser(userId);
        const newFriendshipId = result?.friendshipId;
        if (newFriendshipId) {
          updateFriendshipFields(userId, { friendshipId: newFriendshipId });
        }
        onSuccess?.('block');
      } catch (error) {
        setItems(prevData);
        console.error('Ошибка при блокировке пользователя', error);
        onError?.('block');
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  /** Разблокировка пользователя
   * @param {string} friendshipId - ID дружбы
   * @param {string} userId - ID пользователя
   */
  const unlock = useCallback(
    async (friendshipId, userId) => {
      if (!friendshipId || !userId) return;
      const prevData = getCurrentData();
      updateFriendshipFields(userId, {
        friendshipStatus: null,
        friendshipDirection: null,
        friendshipId: null,
      });
      try {
        await deleteFriend(friendshipId);
        onSuccess?.('unlock');
      } catch (error) {
        setItems(prevData);
        console.error('Ошибка при разблокировке пользователя', error);
        onError?.('unlock');
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  return {
    follow,
    unfollow,
    accept,
    block,
    unlock,
  };
};
