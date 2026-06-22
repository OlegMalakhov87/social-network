import { useState, useEffect, useCallback } from 'react';
import {
  fetchFriendshipStatus,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend,
  blockUser,
} from '../../../entities/friend';

export const useFriendshipStatus = ({ targetUserId, currentUserId }) => {
  const [data, setData] = useState({ status: null, direction: null, friendshipId: null });

  // Загрузка начального статуса
  useEffect(() => {
    if (!targetUserId || !currentUserId || targetUserId === currentUserId) {
      setData({ status: null, direction: null, friendshipId: null });
      return;
    }
    let cancelled = false;
    fetchFriendshipStatus(targetUserId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ status: null, direction: null, friendshipId: null });
      });
    return () => {
      cancelled = true;
    };
  }, [targetUserId, currentUserId]);

  /**
   * Универсальная обёртка для оптимистичного обновления.
   * @param {Function} apiCall – функция, возвращающая промис с ответом сервера
   * @param {Function} optimisticUpdate – синхронная функция, обновляющая состояние немедленно
   * @param {Function} onSuccess – (response) => новое состояние, применяется после успеха
   */

  const optimisticAction = useCallback(
    async (apiCall, optimisticUpdate, onSuccess) => {
      const prevData = data;
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
    [data]
  );

  const follow = useCallback(async () => {
    await optimisticAction(
      () => sendFriendRequest(targetUserId),
      () => setData({ status: 'pending', direction: 'outgoing', friendshipId: null }),
      (response) => ({
        status: 'pending',
        direction: 'outgoing',
        friendshipId: response?.id || null,
      })
    );
  }, [targetUserId, optimisticAction]);

  const unfollow = useCallback(async () => {
    if (!data.friendshipId) return;
    await optimisticAction(
      () => rejectFriendRequest(data.friendshipId),
      () => setData({ status: null, direction: null, friendshipId: null }),
      () => ({ status: null, direction: null, friendshipId: null })
    );
  }, [data.friendshipId, optimisticAction]);

  const accept = useCallback(async () => {
    if (!data.friendshipId) return;
    await optimisticAction(
      () => acceptFriendRequest(data.friendshipId),
      () => setData({ status: 'accepted', direction: 'incoming', friendshipId: data.friendshipId }),
      () => ({ status: 'accepted', direction: 'incoming', friendshipId: data.friendshipId })
    );
  }, [data.friendshipId, optimisticAction]);

  const block = useCallback(async () => {
    await optimisticAction(
      () => blockUser(targetUserId),
      () => setData({ status: 'blocked', direction: 'incoming', friendshipId: data.friendshipId }),
      (response) => ({
        status: 'blocked',
        direction: 'incoming',
        friendshipId: response?.friendship?.id || data.friendshipId,
      })
    );
  }, [targetUserId, data.friendshipId, optimisticAction]);

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
