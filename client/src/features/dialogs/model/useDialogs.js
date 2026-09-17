import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import { fetchDialogsApi, normalizeDialogs } from '../../../entities/dialog';
import { useOnline } from '../../../features/users';
import { useInfiniteScroll } from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';
import { parseSharedEntity } from '../../../shared/utils';

/**
 * Хук для получения и отображения списка диалогов.
 * Загружает диалоги текущего пользователя, обогащает их онлайн-статусами собеседников и фильтрует по поисковому запросу.
 *
 * @param {Object} params - параметры запроса
 * @param {string} [params.searchQuery=''] – поисковый запрос для фильтрации диалогов
 * @returns {Object} - объект с данными о диалогах
 */
export function useDialogs({ searchQuery = '' }) {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

  /** Зависимости для бесконечного скролла */
  const scrollDeps = useMemo(
    () => [currentUserId, searchQuery],
    [currentUserId, searchQuery]
  );

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
      if (!currentUserId || currentUserId <= 0) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchDialogsApi, {
        params: { q: searchQuery, page, limit },
        signal,
      });
    },
    deps: scrollDeps,
  });

  /** Все ID собеседников (уникальные). */
  const interlocutorIds = useMemo(
    () => [...new Set(dialogsItems.map((d) => d.user.id).filter(Boolean))],
    [dialogsItems]
  );

  /** Карта онлайн-статусов для всех собеседников. */
  const onlineMap = useOnline(interlocutorIds);

  /** Обогащение диалогов статусами и форматирование последнего сообщения. */
  const enrichedData = useMemo(
    () =>
      dialogsItems.map((dialog) => ({
        ...dialog,
        lastMessage: dialog.lastMessage
          ? {
              ...dialog.lastMessage,
              content: parseSharedEntity(dialog.lastMessage.content)
                ? 'Поделился'
                : dialog.lastMessage.content,
            }
          : null,
        user: {
          ...dialog.user,
          online: onlineMap.get(dialog.user.id) ?? false,
        },
      })),
    [dialogsItems, onlineMap]
  );

  /** Нормализация под компоненты. */
  const normalizedDialogs = useMemo(
    () => enrichedData.map(normalizeDialogs),
    [enrichedData]
  );

  /** Объект с данными о диалогах. */
  return {
    dialogs: normalizedDialogs,
    currentUserId,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  };
}
