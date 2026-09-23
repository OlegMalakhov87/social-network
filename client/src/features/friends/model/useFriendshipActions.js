import { useCallback } from 'react';
import {
  acceptFriendRequest,
  blockUser,
  rejectFriendRequest,
  sendFriendRequest,
} from '../../../entities/friend';
import { parseApiError } from '../../../shared/lib';

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
      if (!userId) return false;

      const prevData = getCurrentData();
      updateFriendshipFields(userId, {
        friendshipStatus: 'pending',
        friendshipDirection: 'outgoing',
        friendshipId: null,
      });

      try {
        const result = await sendFriendRequest(userId);

        if (result?.friendshipId) {
          updateFriendshipFields(userId, {
            friendshipId: result.friendshipId,
            friendshipStatus: result.friendshipStatus,
            friendshipDirection: result.friendshipDirection,
          });
        }
        onSuccess?.('Заявка отправлена');
        return true;
      } catch (error) {
        setItems(prevData);
        onError?.(parseApiError(error, 'Ошибка отправки заявки'));
        return false;
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  /** Удалить из друзей, разблокировать, отменить заявку на дружбу
   * @param {string} friendshipId - ID дружбы
   * @param {string} userId - ID пользователя
   */
  const unfollow = useCallback(
    async (friendshipId, userId) => {
      if (!friendshipId || !userId) return false;

      const prevData = getCurrentData();
      updateFriendshipFields(userId, {
        friendshipStatus: null,
        friendshipDirection: null,
        friendshipId: null,
      });

      try {
        await rejectFriendRequest(friendshipId);
        onSuccess?.('Запись удалена');
        return true;
      } catch (error) {
        setItems(prevData);
        onError?.(parseApiError(error, 'Ошибка удаления записи'));
        return false;
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
      if (!friendshipId || !userId) return false;

      const prevData = getCurrentData();

      updateFriendshipFields(userId, {
        friendshipStatus: 'accepted',
        friendshipDirection: 'incoming',
        friendshipId,
      });

      try {
        const result = await acceptFriendRequest(friendshipId);
        if (result?.friendshipId) {
          updateFriendshipFields(userId, {
            friendshipId: result.friendshipId,
            friendshipStatus: result.friendshipStatus,
            friendshipDirection: result.friendshipDirection,
          });
        }
        onSuccess?.('Заявка принята');
        return true;
      } catch (error) {
        setItems(prevData);
        onError?.(parseApiError(error, 'Ошибка принятия заявки'));
        return false;
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  /** Блокировка пользователя
   * @param {string} userId - ID пользователя
   */
  const block = useCallback(
    async (userId) => {
      if (!userId) return false;

      const prevData = getCurrentData();

      updateFriendshipFields(userId, {
        friendshipStatus: 'blocked',
        friendshipDirection: 'outgoing',
        friendshipId: null,
      });

      try {
        const result = await blockUser(userId);

        if (result?.friendshipId) {
          updateFriendshipFields(userId, {
            friendshipId: result.friendshipId,
            friendshipStatus: result.friendshipStatus,
            friendshipDirection: result.friendshipDirection,
          });
        }
        onSuccess?.('Пользователь заблокирован');
        return true;
      } catch (error) {
        setItems(prevData);
        onError?.(parseApiError(error, 'Ошибка блокировки пользователя'));
        return false;
      }
    },
    [updateFriendshipFields, onSuccess, onError, setItems, getCurrentData]
  );

  return {
    follow,
    unfollow,
    accept,
    block,
  };
};
