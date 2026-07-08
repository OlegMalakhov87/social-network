import { useEffect, useState } from 'react';
import { fetchUserById } from '../../../entities/user';

/**
 * Хук для получения данных пользователя с сервера.
 * @param {number} profileUserId - ID пользователя
 * @returns {{ user: Object|null, isLoading: boolean, error: string|null }}
 */
export function useUserProfile(profileUserId) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Получение данных пользователя с сервера.
   */
  useEffect(() => {
    if (!profileUserId || profileUserId <= 0) {
      setUser(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    fetchUserById(profileUserId, { signal: controller.signal })
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;

        setError(err.message);
        setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [profileUserId]);

  /**
   * Возвращаем объект с данными о пользователе.
   */
  return { user, isLoading, error };
}
