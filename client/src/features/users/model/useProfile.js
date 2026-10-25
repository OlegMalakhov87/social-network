import { useMemo } from 'react';

import { useOnline } from '..';
import { fetchUserProfileApi } from '../../../entities/user';
import { useAbortableRequest, useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay } from '../../../shared/lib';
import { useFriendshipActions } from '../../friends';

/**
 * Возвращает данные профиля и обновляет статус дружбы.
 *
 * @param {number} profileUserId - Идентификатор пользователя
 * @returns {{
 *   user: Object|null,
 *   userLoading: boolean,
 *   userError: { message: string, fieldErrors?: Object }|null,
 *   refetchUser: Function,
 *   followUser: Function,
 *   unfollowUser: Function,
 *   acceptUser: Function,
 *   blockUser: Function,
 *   unlockUser: Function|undefined
 * }} Данные профиля и действия дружбы
 */
export const useProfile = (profileUserId) => {
  const notify = useNotify();

  const {
    data: user,
    setData: setUser,
    isLoading,
    error,
    execute: refetchUser,
  } = useAbortableRequest({
    /**
     * Загружает профиль и статус дружбы.
     *
     * @param {AbortSignal} signal - Сигнал отмены
     * @returns {Promise<Object|null>} Данные профиля
     */
    fetcher: async (signal) => {
      if (!profileUserId || profileUserId <= 0) {
        return null;
      }
      return await fetchUserProfileApi(profileUserId, signal);
    },
    deps: [profileUserId],
    options: {
      autoFetch: Boolean(profileUserId),
      initialData: null,
    },
  });

  const friendshipActions = useFriendshipActions({
    setItems: setUser,
    getCurrentData: () => user,
    getUserId: (data) => data?.id,
    onSuccess: (action) => notify.info(action),
    onError: (error) =>
      notify.error(getApiErrorDisplay(error, 'Ошибка выполнения')),
  });

  const onlineMap = useOnline(user?.id);

  const enrichedUser = useMemo(() => {
    if (!user) return null;
    const online = onlineMap.get(user.id) ?? false;
    if (user.online === online) return user;
    return { ...user, online };
  }, [user, onlineMap]);

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
