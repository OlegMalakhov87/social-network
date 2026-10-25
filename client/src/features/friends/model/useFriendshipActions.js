import { useCallback } from 'react';

import {
  acceptFriendRequest,
  blockUser,
  rejectFriendRequest,
  sendFriendRequest,
} from '../../../entities/friend';
import { parseApiError } from '../../../shared/lib';

/**
 * Обновляет статус дружбы у пользователя или в списке пользователей.
 *
 * @param {Object} params - Параметры обновления
 * @param {Function} params.setItems - Обновляет пользователя или список
 * @param {Function} params.getCurrentData - Возвращает текущие данные
 * @param {Function} params.getUserId - Возвращает идентификатор из данных
 * @param {Function} [params.onSuccess] - Обработчик успешного действия
 * @param {Function} [params.onError] - Обработчик ошибки
 * @returns {{
 *   follow: Function,
 *   unfollow: Function,
 *   accept: Function,
 *   block: Function
 * }} Действия дружбы
 */
export const useFriendshipActions = ({
  setItems,
  getCurrentData,
  getUserId,
  onSuccess,
  onError,
}) => {
  /**
   * Обновляет поля дружбы у пользователя.
   *
   * @param {number} userId - Идентификатор пользователя
   * @param {Object} fields - Поля дружбы
   * @returns {void}
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

  /**
   * Отправляет заявку в друзья.
   *
   * @param {number} userId - Идентификатор пользователя
   * @returns {Promise<boolean>} Результат отправки
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

  /**
   * Удаляет дружбу, снимает блокировку или отменяет заявку.
   *
   * @param {number} friendshipId - Идентификатор дружбы
   * @param {number} userId - Идентификатор пользователя
   * @returns {Promise<boolean>} Результат удаления
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

  /**
   * Принимает заявку в друзья.
   *
   * @param {number} friendshipId - Идентификатор дружбы
   * @param {number} userId - Идентификатор пользователя
   * @returns {Promise<boolean>} Результат принятия
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

  /**
   * Блокирует пользователя.
   *
   * @param {number} userId - Идентификатор пользователя
   * @returns {Promise<boolean>} Результат блокировки
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
