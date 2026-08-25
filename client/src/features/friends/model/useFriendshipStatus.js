import { useMemo } from 'react';
import { useFriendshipActions } from '..';
import { fetchFriendshipStatus } from '../../../entities/friend';
import { useOnline } from '../../../features/users';
import { useAbortableRequest, useNotify } from '../../../shared/hooks';
/**
 * Хук для получения пользователя и управления статусом дружбы.
 *
 * @param {number} profileUserId - ID пользователя, с которым проверяем статус дружбы
 * @returns {Object} - объект с данными о статусе дружбы и экшенами
 */
export const useFriendshipStatus = (profileUserId) => {
  const notify = useNotify();

  /**
   * Загрузка пользователя и начального статуса дружбы.
   */
  const {
    data: user,
    setData: setUser,
    isLoading,
    error,
    execute: refetchUser,
  } = useAbortableRequest({
    fetcher: async (signal) => {
      if (!profileUserId || profileUserId <= 0) {
        return null;
      }
      return await fetchFriendshipStatus(profileUserId, signal);
    },
    deps: [profileUserId],
    onError: () => notify.error('load'),
    options: {
      autoFetch: Boolean(profileUserId),
      initialData: null,
    },
  });

  const friendshipActions = useFriendshipActions({
    setItems: setUser,
    getCurrentData: () => user,
    getUserId: (data) => data?.id,
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  /** Получение статуса пользователя (в сети или нет) */
  const onlineMap = useOnline(user?.id);

  /** Обогащаем данные пользователя статусом онлайн. */
  const enrichedUser = useMemo(
    () =>
      user ? { ...user, online: onlineMap.get(user?.id) ?? user.online } : null,
    [user, onlineMap]
  );

  console.log('enrichedUser', enrichedUser);
  return {
    user: enrichedUser,
    userLoading: isLoading,
    userError: error,
    refetchUser,
    followUser: friendshipActions?.follow,
    unfollowUser: friendshipActions?.unfollow,
    acceptUser: friendshipActions?.accept,
    blockUser: friendshipActions?.block,
    unlockUser: friendshipActions?.unlock,
  };
};
