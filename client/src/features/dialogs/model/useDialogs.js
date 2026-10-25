import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { selectUser } from '../../../entities/auth';
import { fetchDialogsApi, normalizeDialogs } from '../../../entities/dialog';
import { useOnline } from '../../../features/users';
import { useInfiniteScroll } from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';
import { parseSharedEntity } from '../../../shared/utils';

/**
 * Возвращает список диалогов и дополняет его статусами собеседников.
 *
 * @param {Object} params - Параметры запроса
 * @param {string} [params.searchQuery=''] - Поисковый запрос
 * @returns {{
 *   dialogs: Array<Object>,
 *   currentUserId: number|undefined,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   hasMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   refetch: Function
 * }} Диалоги и состояние загрузки
 */
export function useDialogs({ searchQuery = '' }) {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

  const scrollDeps = useMemo(
    () => [currentUserId, searchQuery],
    [currentUserId, searchQuery]
  );

  const {
    items: dialogsItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useInfiniteScroll({
    /**
     * Загружает страницу диалогов.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница диалогов
     */
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

  const interlocutorIds = useMemo(
    () => [...new Set(dialogsItems.map((d) => d.user.id).filter(Boolean))],
    [dialogsItems]
  );

  const onlineMap = useOnline(interlocutorIds);

  const enrichedData = useMemo(
    () =>
      dialogsItems.map((dialog) => ({
        ...dialog,
        lastMessage: dialog.lastMessage
          ? {
              ...dialog.lastMessage,
              // Заменяет общую сущность короткой подписью.
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

  const normalizedDialogs = useMemo(
    () => enrichedData.map(normalizeDialogs),
    [enrichedData]
  );

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
