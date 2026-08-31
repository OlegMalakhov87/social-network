import { useMemo } from 'react';
import { useOnline } from '..';
import { fetchUserProfileApi } from '../../../entities/user';
import { useAbortableRequest, useNotify } from '../../../shared/hooks';
import { useFriendshipActions } from '../../friends';
/**
 * Хук для получения данных о пользователе и управления статусом дружбы.
 *
 * @param {number} profileUserId - ID пользователя, с которым проверяем статус дружбы
 * @returns {Object} - объект с данными о статусе дружбы и экшенами
 */
export const useUserProfile = (profileUserId) => {
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
      return await fetchUserProfileApi(profileUserId, signal);
    },
    deps: [profileUserId],
    onError: () => notify.error('load'),
    options: {
      autoFetch: Boolean(profileUserId),
      initialData: null,
    },
  });

  /** Экшены для управления статусом дружбы. */
  const friendshipActions = useFriendshipActions({
    setItems: setUser,
    getCurrentData: () => user,
    getUserId: (data) => data?.id,
    onSuccess: (action) => notify.info(action),
    onError: (action) => notify.error(action),
  });

  /** Получение статуса пользователя (в сети или нет) */
  const onlineMap = useOnline(user?.id);

  /** Обогащаем данные пользователя статусом онлайн. */
  const enrichedUser = useMemo(
    () => (user ? { ...user, online: onlineMap.get(user?.id) ?? false } : null),
    [user, onlineMap]
  );

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
