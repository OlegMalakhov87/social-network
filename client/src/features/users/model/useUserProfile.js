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
      if (userId != null) {
        return;
      }
      setUser(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchUserById(userId)
      .then((data) => {
        if (!cancelled) {
          setUser(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { user, isLoading, error };
}
