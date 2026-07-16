import { useCallback, useRef, useState } from 'react';
import {
  acceptFriendRequest,
  blockUser,
  deleteFriend,
  fetchFriendshipStatus,
  rejectFriendRequest,
  sendFriendRequest,
} from '../../../entities/friend';
import { useAbortableRequest } from '../../../shared/lib';

/**
 * Хук для управления статусом дружбы.
 * @param {number} targetUserId - ID пользователя, с которым устанавливается статус дружбы.
 * @param {number} currentUserId - ID текущего пользователя.
 * @returns {Object} данные о статусе дружбы.
 */

export const useFriendshipStatusApi = ({ targetUserId, currentUserId }) => {
  const [data, setData] = useState({
    status: null,
    direction: null,
    friendshipId: null,
  });

  const dataRef = useRef(data);
  dataRef.current = data;

  /**
   * Загрузка начального статуса.
   * @param {AbortSignal} signal - сигнал отмены запроса.
   */
  useAbortableRequest(
    async (signal) => {
      if (!targetUserId || !currentUserId || targetUserId === currentUserId) {
        setData({ status: null, direction: null, friendshipId: null });
        return;
      }
      try {
        const res = await fetchFriendshipStatus(targetUserId, { signal });
        setData(res);
      } catch (err) {
        if (signal.aborted) return;
        setData({ status: null, direction: null, friendshipId: null });
      }
    },
    [targetUserId, currentUserId]
  );

  /**
   * Универсальная обёртка для оптимистичного обновления.
   * @param {Function} apiCall – функция, возвращающая промис с ответом сервера
   * @param {Function} optimisticUpdate – синхронная функция, обновляющая состояние немедленно
   * @param {Function} onSuccess – (response) => новое состояние, применяется после успеха
   */

  const optimisticAction = useCallback(
    async (apiCall, optimisticUpdate, onSuccess) => {
      const prevData = dataRef.current;
      optimisticUpdate();
      try {
        const response = await apiCall();
        if (onSuccess) {
          const newState = onSuccess(response, prevData);
          setData(newState);
        }
      } catch (error) {
        setData(prevData);
        throw error;
      }
    },
    []
  );

  /**
   * Отправка запроса на дружбу.
   * @returns {Promise<void>}
   */
  const follow = useCallback(async () => {
    await optimisticAction(
      () => sendFriendRequest(targetUserId),
      () =>
        setData({
          status: 'pending',
          direction: 'outgoing',
          friendshipId: null,
        }),
      (response) => ({
        status: 'pending',
        direction: 'outgoing',
        friendshipId: response?.id || null,
      })
    );
  }, [targetUserId, optimisticAction]);

  /**
   * Отмена запроса на дружбу.
   * @returns {Promise<void>}
   */
  const unfollow = useCallback(async () => {
    if (!data.friendshipId) return;
    await optimisticAction(
      () => rejectFriendRequest(data.friendshipId),
      () => setData({ status: null, direction: null, friendshipId: null }),
      () => ({ status: null, direction: null, friendshipId: null })
    );
  }, [data.friendshipId, optimisticAction]);

  /**
   * Принятие запроса на дружбу.
   * @returns {Promise<void>}
   */
  const accept = useCallback(async () => {
    if (!data.friendshipId) return;
    await optimisticAction(
      () => acceptFriendRequest(data.friendshipId),
      () =>
        setData({
          status: 'accepted',
          direction: 'incoming',
          friendshipId: data.friendshipId,
        }),
      () => ({
        status: 'accepted',
        direction: 'incoming',
        friendshipId: data.friendshipId,
      })
    );
  }, [data.friendshipId, optimisticAction]);

  /**
   * Блокировка пользователя.
   * @returns {Promise<void>}
   */
  const block = useCallback(async () => {
    await optimisticAction(
      () => blockUser(targetUserId),
      () =>
        setData({
          status: 'blocked',
          direction: 'incoming',
          friendshipId: data.friendshipId,
        }),
      (response) => ({
        status: 'blocked',
        direction: 'incoming',
        friendshipId: response?.friendship?.id || data.friendshipId,
      })
    );
  }, [targetUserId, data.friendshipId, optimisticAction]);

  /**
   * Разблокировка пользователя.
   * @returns {Promise<void>}
   */
  const unlock = useCallback(async () => {
    if (!data.friendshipId) return;
    await optimisticAction(
      () => deleteFriend(data.friendshipId),
      () => setData({ status: null, direction: null, friendshipId: null }),
      () => ({ status: null, direction: null, friendshipId: null })
    );
  }, [data.friendshipId, optimisticAction]);

  return {
    ...data,
    follow,
    unfollow,
    accept,
    block,
    unlock,
  };
};
