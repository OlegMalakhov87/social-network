import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFriendshipActions } from '..';
import { selectUser } from '../../../entities/auth';
import { fetchFriendsApi, normalizeFriend } from '../../../entities/friend';
import { useOnline } from '../../../features/users';
import { useInfiniteScroll, useNotify } from '../../../shared/hooks';

/**
 * Хук для загрузки списка друзей/заявок с фильтрацией, поиском и бесконечным скроллом.
 *
 * @param {Object} params - параметры запроса
 * @param {string} params.filter - фильтр
 * @param {string} params.searchQuery - поисковый запрос
 * @returns {Object} - объект с данными о друзьях
 */
export const useFriends = ({ filter, searchQuery }) => {
  const currentUser = useSelector(selectUser);
  const notify = useNotify();

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
      if (!currentUser?.id || currentUser?.id <= 0) {
        return { items: [], hasMore: false };
      }
      return fetchFriendsApi({
        filter: filter || 'all',
        q: searchQuery,
        page,
        limit,
        signal,
      });
    },
    deps: [filter, searchQuery, currentUser?.id],
    onError: () => notify.error('load'),
    options: {
      autoFetch: Boolean(currentUser?.id),
    },
    initialData: {
      items: [],
      hasMore: false,
    },
  });

  const friendshipActions = useFriendshipActions({
    setItems: setFriendsItems,
    getCurrentData: () => friendsItems,
    getUserId: (data) => data?.id,
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
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
        online: onlineMap.get(user?.id) ?? user?.online,
      })),
    [friendsItems, onlineMap]
  );

  /** Нормализация под компоненты. */
  const normalizedFriends = useMemo(
    () => enrichedData.map(normalizeFriend),
    [enrichedData]
  );

  return {
    friends: normalizedFriends,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    currentUserId: currentUser?.id,
    follow: friendshipActions?.follow,
    unfollow: friendshipActions?.unfollow,
    accept: friendshipActions?.accept,
    block: friendshipActions?.block,
    unlock: friendshipActions?.unlock,
    refetch,
  };
};
