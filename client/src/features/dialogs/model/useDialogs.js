import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOnline } from '../../../features/users';
import { fetchDialogs } from '../../../entities/dialog';
import { isSharedPost } from '../../../shared/lib';

/**
 * Хук для получения и отображения списка диалогов.
 * Загружает диалоги текущего пользователя, обогащает их онлайн-статусами собеседников
 * и фильтрует по поисковому запросу.
 *
 * @param {string} [searchQuery=''] – поисковый запрос для фильтрации диалогов
 * @returns {{
 *   dialogs: Array<{ user: Object, lastMessage: Object|null, unreadCount: number }>,
 *   isLoading: boolean,
 *   error: string|null,
 *   refetch: Function
 * }}
 */
export function useDialogs(searchQuery = '') {
  const [rawDialogs, setRawDialogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка диалогов с сервера
  const loadDialogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDialogs();
      setRawDialogs(data.dialogs || []);
    } catch (err) {
      setError(err.message);
      setRawDialogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDialogs();
  }, [loadDialogs]);

  // Все ID собеседников (уникальные)
  const interlocutorIds = useMemo(
    () => [...new Set(rawDialogs.map((d) => d.user.id).filter(Boolean))],
    [rawDialogs]
  );

  // Получаем карту онлайн-статусов для всех собеседников
  const onlineMap = useOnline(interlocutorIds);

  // Обогащаем диалоги статусами и форматируем последнее сообщение
  const dialogs = useMemo(
    () =>
      rawDialogs.map((dialog) => ({
        ...dialog,
        lastMessage: dialog.lastMessage
          ? {
              ...dialog.lastMessage,
              text: isSharedPost(dialog.lastMessage.text)
                ? 'Поделился постом'
                : dialog.lastMessage.text,
            }
          : null,
        user: {
          ...dialog.user,
          online: onlineMap.get(dialog.user.id) ?? false,
        },
      })),
    [rawDialogs, onlineMap]
  );

  // Фильтрация по поисковому запросу
  const filteredDialogs = useMemo(() => {
    if (!searchQuery.trim()) return dialogs;
    const q = searchQuery.trim().toLowerCase();
    return dialogs.filter(
      (d) => d.user.name?.toLowerCase().includes(q) || d.user.nickname?.toLowerCase().includes(q)
    );
  }, [dialogs, searchQuery]);

  return { dialogs: filteredDialogs, isLoading, error, refetch: loadDialogs };
}
