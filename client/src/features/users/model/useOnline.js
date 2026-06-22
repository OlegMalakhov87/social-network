import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchUsersOnlineStatus } from '../../../entities/user';

/**
 * Хук для отслеживания онлайн-статусов пользователей.
 * @param {number|number[]} userIds – ID пользователя или массив ID пользователей
 * @returns {Map<number, boolean>} карта userId → online
 */
export function useOnline(userIds) {
  const [statusMap, setStatusMap] = useState(new Map());
  const intervalRef = useRef(null);

  // Приводим входные данные к стабильному массиву (мемоизация)
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
        const map = new Map(data.users.map((u) => [u.userId, u.online]));
        setStatusMap(map);
      } catch (err) {
        console.error('Ошибка получения онлайн-статусов:', err);
      }
    };

    updateStatuses(); // первый запрос
    intervalRef.current = setInterval(updateStatuses, 30000); // обновление каждые 30 сек

    return () => clearInterval(intervalRef.current);
  }, [normalizedIds]);

  return statusMap;
}
