import { useState, useEffect } from 'react';
import { fetchUserById } from '../../../entities/user';

/**
 * Хук для получения данных пользователя с сервера.
 * @param {number} userId - ID пользователя
 * @returns {{ user: Object|null, isLoading: boolean, error: string|null }}
 */
export function useUserProfile(userId) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    //Строгая валидация: только целое положительное число
    const isValidId = Number.isInteger(userId) && userId > 0;
    if (!isValidId) {
      setUser(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    fetchUserById(userId, { signal: controller.signal })
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
  }, [userId]);

  return { user, isLoading, error };
}
