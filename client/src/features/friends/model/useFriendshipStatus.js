import { useCallback, useRef } from 'react';
import {
  acceptFriendRequest,
  blockUser,
  deleteFriend,
  fetchFriendshipStatus,
  rejectFriendRequest,
  sendFriendRequest,
} from '../../../entities/friend';
import { useAbortableRequest, useNotify } from '../../../shared/hooks';

/**
 * Хук для управления статусом дружбы.
 *
 * @param {number} targetUserId - ID пользователя, с которым устанавливается статус дружбы.
 * @param {number} currentUserId - ID текущего пользователя.
 * @returns {Object} - объект с данными о статусе дружбы.
 */
export const useFriendshipStatus = (targetUserId, currentUserId) => {
  const dataRef = useRef({ status: null, direction: null, friendshipId: null });
  const notify = useNotify();

  /**
   * Загрузка начального статуса.
   * @param {AbortSignal} signal - сигнал отмены запроса.
   * @returns {Object} - объект с данными о статусе дружбы.
   */
  const {
    data,
    isLoading,
    error,
    execute: refetchStatus,
    setData,
  } = useAbortableRequest({
    fetcher: async (signal) => {
      if (!targetUserId || !currentUserId || targetUserId === currentUserId) {
        return { status: null, direction: null, friendshipId: null };
      }
      return await fetchFriendshipStatus(targetUserId, { signal });
    },
    deps: [targetUserId, currentUserId],
    options: {
      initialData: { status: null, direction: null, friendshipId: null },
    },
  });

  /**
   * Ссылка на данные для оптимистичного обновления.
   * @returns {void}
   */
  dataRef.current = data;

  /**
   * Оптимистичное обновление статуса дружбы.
   * @param {Function} apiCall - функция, возвращающая промис с ответом сервера
   * @param {Function} optimisticUpdate - синхронная функция, обновляющая состояние немедленно
   * @param {Function} onSuccess - (response) => новое состояние, применяется после успеха
   * @returns {void}
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
          notify.success('Статус дружбы обновлен');
        }
      } catch (error) {
        setData(prevData);
        console.error('Ошибка при обновлении статуса дружбы', error);
        notify.error('Ошибка при обновлении статуса дружбы');
      }
    },
    [setData, notify]
  );

  /**
   * Отправка запроса на дружбу.
   * @returns {void}
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
  }, [targetUserId, optimisticAction, setData]);

  /**
   * Отмена запроса на дружбу.
   * @returns {void}
   */
  const unfollow = useCallback(async () => {
    if (!data.friendshipId) return;
    await optimisticAction(
      () => rejectFriendRequest(data.friendshipId),
      () => setData({ status: null, direction: null, friendshipId: null }),
      () => ({ status: null, direction: null, friendshipId: null })
    );
  }, [data.friendshipId, optimisticAction, setData]);

  /**
   * Принятие запроса на дружбу.
   * @returns {void}
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
  }, [data.friendshipId, optimisticAction, setData]);

  /**
   * Блокировка пользователя.
   * @returns {void}
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
  }, [targetUserId, data.friendshipId, optimisticAction, setData]);

  /**
   * Разблокировка пользователя.
   * @returns {void}
   */
  const unlock = useCallback(async () => {
    if (!data.friendshipId) return;
    await optimisticAction(
      () => deleteFriend(data.friendshipId),
      () => setData({ status: null, direction: null, friendshipId: null }),
      () => ({ status: null, direction: null, friendshipId: null })
    );
  }, [data.friendshipId, optimisticAction, setData]);

  return {
    data,
    isLoading,
    error,
    refetch: refetchStatus,
    follow,
    unfollow,
    accept,
    block,
    unlock,
  };
};
