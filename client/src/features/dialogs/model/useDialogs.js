import { useMemo } from 'react';
import { selectUser } from '../../../app/providers/slices/auth/authSelectors';
import { fetchDialogsApi } from '../../../entities/dialog';
import { useOnline } from '../../../features/users';
import { useInfiniteScroll, useNotify } from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';
import { parseSharedEntity } from '../../../entities/sharedEntity';

/**
 * Хук для получения и отображения списка диалогов.
 * Загружает диалоги текущего пользователя, обогащает их онлайн-статусами собеседников и фильтрует по поисковому запросу.
 *
 * @param {string} [searchQuery=''] – поисковый запрос для фильтрации диалогов
 * @returns {Object} { dialogs, isLoading, error, refetch }
 */
export function useDialogs(searchQuery = '') {
  const currentUser = selectUser();
  const notify = useNotify('dialogs');

  /** Получение новостей с бесконечным скроллом. */
  const {
    items: dialogsItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ page, limit, signal }) => {
      if (!currentUser?.id) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchDialogsApi, {
        params: { q: searchQuery, page, limit },
        signal,
      });
    },
    deps: [currentUser?.id, searchQuery],
    options: {
      autoFetch: true,
      onSuccess: () => notify.success('load'),
      onError: () => notify.error('load'),
    },
  });

  /** Все ID собеседников (уникальные). */
  const interlocutorIds = useMemo(
    () => [...new Set(dialogsItems.map((d) => d.user.id).filter(Boolean))],
    [dialogsItems]
  );

  /** Карта онлайн-статусов для всех собеседников. */
  const onlineMap = useOnline(interlocutorIds);

  /** Обогащение диалогов статусами и форматирование последнего сообщения. */
  const dialogs = useMemo(
    () =>
      dialogsItems.map((dialog) => ({
        ...dialog,
        lastMessage: dialog.lastMessage
          ? {
              ...dialog.lastMessage,
              text: parseSharedEntity(dialog.lastMessage.text)
                ? 'Поделился'
                : dialog.lastMessage.text,
            }
          : null,
        user: {
          ...dialog.user,
          online: onlineMap.get(dialog.user.id) ?? false,
        },
      })),
    [dialogsItems, onlineMap]
  );

  /** Объект с данными о диалогах. */
  return {
    dialogs,
    currentUser,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  };
}
