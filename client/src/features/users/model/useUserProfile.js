import { fetchUserById } from '../../../entities/user';
import { useAbortableRequest } from '../../../shared/hooks';

/**
 * Хук для получения данных пользователя с сервера
 *
 * @param {number} profileUserId - ID пользователя
 * @returns {Object} - объект с данными о пользователе
 */

export const useUserProfile = (profileUserId) => {
  /**
   * Запрос данных пользователя с сервера.
   * @param {AbortSignal} signal - сигнал отмены запроса.
   */
  const {
    data,
    isLoading,
    error,
    execute: fetchUser,
  } = useAbortableRequest({
    fetcher: (signal) => {
      if (!profileUserId || profileUserId <= 0) {
        return null;
      }
      return fetchUserById({ userId: profileUserId, signal });
    },
    deps: [profileUserId],
    options: {
      autoFetch: Boolean(profileUserId),
      initialData: null,
    },
  });
  /** Объект с данными о пользователе. */
  return {
    user: data,
    isLoading,
    error,
    refetch: fetchUser,
  };
};
