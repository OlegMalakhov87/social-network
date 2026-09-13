import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFriendshipActions } from '..';
import { selectUser } from '../../../entities/auth';
import { fetchFriendsApi, normalizeFriends } from '../../../entities/friend';
import { useOnline } from '../../../features/users';
import { useInfiniteScroll, useNotify } from '../../../shared/hooks';
import { apiFetchItems, getApiErrorDisplay } from '../../../shared/lib';

/**
 * Хук для загрузки списка друзей/заявок с фильтрацией, поиском и бесконечным скроллом.
 *
 * @param {Object} params - параметры запроса
 * @param {string} params.filter - фильтр
 * @param {string} [params.searchQuery] - поисковый запрос
 * @returns {Object} - объект с данными о друзьях
 */
export const useFriends = ({ filter, searchQuery = '' }) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;
  const notify = useNotify();

  /** Зависимости для бесконечного скролла */
  const scrollDeps = useMemo(
    () => [filter, searchQuery, currentUserId],
    [filter, searchQuery, currentUserId]
  );

  /** Получение пользователей со статусом связи с текущим пользователем. */
  const {
    items: friendsItems,
    setItems: setFriendsItems,
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
      return apiFetchItems(fetchFriendsApi, {
        params: {
          filter,
          q: searchQuery,
          page,
          limit,
        },
        signal,
      });
    },
    deps: scrollDeps,
    options: {
      autoFetch: Boolean(currentUserId),
    },
    initialData: {
      items: [],
      hasMore: false,
    },
  });

  /** Экшены для управления статусом дружбы. */
  const friendshipActions = useFriendshipActions({
    setItems: setFriendsItems,
    getCurrentData: () => friendsItems,
    getUserId: (data) => data?.id,
    onSuccess: (action) => notify.info(action),
    onError: (error) =>
      notify.error(getApiErrorDisplay(error, 'Ошибка выполнения')),
  });

  /** Получение ID пользователей из списка друзей. */
  const userIds = useMemo(
    () => friendsItems.map((user) => user?.id),
    [friendsItems]
  );

  /** Получение статуса пользователя (в сети или нет) */
  const onlineMap = useOnline(userIds);

  /** Обогащаем данные с онлайн статусом. */
  const enrichedData = useMemo(
    () =>
      friendsItems.map((user) => ({
        ...user,
        online: onlineMap.get(user?.id) ?? false,
      })),
    [friendsItems, onlineMap]
  );

  /** Нормализация под компоненты. */
  const normalizedFriends = useMemo(
    () => enrichedData.map(normalizeFriends),
    [enrichedData]
  );

  return {
    friends: normalizedFriends,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    currentUserId,
    follow: friendshipActions?.follow,
    unfollow: friendshipActions?.unfollow,
    accept: friendshipActions?.accept,
    block: friendshipActions?.block,
    unlock: friendshipActions?.unlock,
    refetch,
  };
};
