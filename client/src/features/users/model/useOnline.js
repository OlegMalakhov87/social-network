import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchUsersOnlineStatus } from '../../../entities/user';

/** Интервал обновления статусов пользователей в миллисекундах. */
const USERS_ONLINE_REFRESH_INTERVAL_MS = 60 * 1000; // 60 секунд

/**
 * Хук для отслеживания онлайн-статусов пользователей.
 *
 * @param {number|Array<number>} userIds – ID пользователя или массив ID пользователей
 * @returns {Map<number, boolean>} карта userId → online
 */
export const useOnline = (userIds) => {
  const [statusMap, setStatusMap] = useState(new Map());
  const intervalRef = useRef(null);

  /** Приводим входные данные к стабильному массиву (мемоизация). */
  const normalizedIds = useMemo(() => {
    if (Array.isArray(userIds)) return userIds.filter(Boolean);
    if (userIds) return [userIds];
    return [];
  }, [userIds]);

  /** Обновление статусов пользователей. */
  useEffect(() => {
    if (normalizedIds.length === 0) {
      setStatusMap(new Map());
      return;
    }

    const uniqueIds = [...new Set(normalizedIds)];

    /** Обновление статусов пользователей. */
    const updateStatuses = async () => {
      try {
        const data = await fetchUsersOnlineStatus(uniqueIds);
        const map = new Map(data?.users?.map((u) => [u.userId, u.online]));
        setStatusMap(map);
      } catch (err) {
        setStatusMap(new Map());
      }
    };

    updateStatuses(); /** Первый запрос. */

    /** Установка интервала обновления статусов пользователей. Обновление каждые 60 сек.*/
    intervalRef.current = setInterval(
      updateStatuses,
      USERS_ONLINE_REFRESH_INTERVAL_MS
    ); 

    /** Очистка интервала обновления статусов пользователей. Очистка интервала. */
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [normalizedIds]);

  return statusMap; /** Карта userId → online. */
};
