import { useEffect, useMemo, useRef, useState } from 'react';

import { fetchUsersOnlineStatus } from '../../../entities/user';

/** Задаёт интервал обновления статусов в миллисекундах. */
const USERS_ONLINE_REFRESH_INTERVAL_MS = 60 * 1000;

/**
 * Возвращает статусы присутствия пользователей.
 *
 * @param {number|Array<number>|null} userIds - Идентификатор или список идентификаторов
 * @returns {Map<number, boolean>} Статус присутствия по идентификатору
 */
export const useOnline = (userIds) => {
  const [statusMap, setStatusMap] = useState(new Map());
  const intervalRef = useRef(null);

  const normalizedIds = useMemo(() => {
    if (Array.isArray(userIds)) return userIds.filter(Boolean);
    if (userIds) return [userIds];
    return [];
  }, [userIds]);

  useEffect(() => {
    if (normalizedIds.length === 0) {
      setStatusMap(new Map());
      return;
    }

    const uniqueIds = [...new Set(normalizedIds)];

    const updateStatuses = async () => {
      try {
        const data = await fetchUsersOnlineStatus(uniqueIds);
        const map = new Map(data?.users?.map((u) => [u.userId, u.online]));
        setStatusMap(map);
      } catch (err) {
        setStatusMap(new Map());
      }
    };

    updateStatuses();

    intervalRef.current = setInterval(
      updateStatuses,
      USERS_ONLINE_REFRESH_INTERVAL_MS
    );

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [normalizedIds]);

  return statusMap;
};
