import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useFriendshipActions } from '..';
import { selectUser } from '../../../entities/auth';
import { fetchFriendsApi, normalizeFriends } from '../../../entities/friend';
import { useOnline } from '../../../features/users';
import { useInfiniteScroll, useNotify } from '../../../shared/hooks';
import { apiFetchItems, getApiErrorDisplay } from '../../../shared/lib';

/**
 * Возвращает список друзей и заявки с поиском и прокруткой.
 *
 * @param {Object} params - Параметры запроса
 * @param {string} params.filter - Фильтр списка
 * @param {string} [params.searchQuery=''] - Поисковый запрос
 * @returns {{
 *   friends: Array<Object>,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   hasMore: boolean,
 *   loadMore: Function,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   currentUserId: number|undefined,
 *   follow: Function,
 *   unfollow: Function,
 *   accept: Function,
 *   block: Function,
 *   unlock: Function|undefined,
 *   refetch: Function
 * }} Друзья, состояние загрузки и действия
 */
export const useFriends = ({ filter, searchQuery = '' }) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;
  const notify = useNotify();

  const scrollDeps = useMemo(
    () => [filter, searchQuery, currentUserId],
    [filter, searchQuery, currentUserId]
  );

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
    /**
     * Загружает страницу друзей.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница друзей
     */
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
  });

  const friendshipActions = useFriendshipActions({
    setItems: setFriendsItems,
    getCurrentData: () => friendsItems,
    getUserId: (data) => data?.id,
    onSuccess: (action) => notify.info(action),
    onError: (error) =>
      notify.error(getApiErrorDisplay(error, 'Ошибка выполнения')),
  });

  const userIds = useMemo(
    () => friendsItems.map((user) => user?.id),
    [friendsItems]
  );

  const onlineMap = useOnline(userIds);

  const enrichedData = useMemo(
    () =>
      friendsItems.map((user) => ({
        ...user,
        online: onlineMap.get(user?.id) ?? false,
      })),
    [friendsItems, onlineMap]
  );

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
