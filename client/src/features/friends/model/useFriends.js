import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import {
  acceptFriendRequest,
  blockUser,
  deleteFriend,
  fetchFriendsApi,
  normalizeFriend,
  rejectFriendRequest,
  sendFriendRequest,
} from '../../../entities/friend';
import { useOnline } from '../../../features/users';
import { useInfiniteScroll, useNotify } from '../../../shared/hooks';

/**
 * Хук для загрузки списка друзей/заявок с фильтрацией, поиском и бесконечным скроллом.
 *
 * @param {Object|string} params - параметры запроса
 * @param {string} [searchQueryArg=''] поисковый запрос
 * @returns {Object} - объект с данными о друзьях
 */
export const useFriends = (params, searchQueryArg = '') => {
  const isParamsObject =
    typeof params === 'object' && params !== null && !Array.isArray(params);

  const filter = isParamsObject ? (params.filter ?? 'all') : params;

  const searchQuery = isParamsObject
    ? (params.searchQuery ?? '')
    : searchQueryArg;

  const currentUser = useSelector(selectUser);
  const notify = useNotify('friends');

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
      if (!currentUser?.id) {
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
  });

  /** Оптимистическое обновление статуса (связи) между пользователями. */
  const updateFriendStatus = useCallback(
    (userId, updates) => {
      setFriendsItems((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...updates } : user
        )
      );
    },
    [setFriendsItems]
  );

  /** Отправка запроса на дружбу. */
  const follow = useCallback(
    async (userId) => {
      updateFriendStatus(userId, {
        friendshipStatus: 'pending',
        friendshipDirection: 'outgoing',
        friendshipId: null,
      });
      try {
        const result = await sendFriendRequest(userId);
        const newFriendshipId = result?.id;
        if (newFriendshipId) {
          updateFriendStatus(userId, { friendshipId: newFriendshipId });
        }
        notify.success('send');
      } catch (error) {
        updateFriendStatus(userId, {
          friendshipStatus: null,
          friendshipDirection: null,
          friendshipId: null,
        });
        console.error('Ошибка при отправке запроса на дружбу', error);
        notify.error('send');
      }
    },
    [updateFriendStatus, notify]
  );

  /** Отмена запроса на дружбу. */
  const unfollow = useCallback(
    async (friendshipId, userId) => {
      updateFriendStatus(userId, {
        friendshipStatus: null,
        friendshipDirection: null,
        friendshipId: null,
      });
      try {
        await rejectFriendRequest(friendshipId);
        notify.success('cancel');
      } catch (error) {
        console.error('Ошибка при отмене запроса на дружбу', error);
        notify.error('cancel');
        refetch();
      }
    },
    [updateFriendStatus, notify, refetch]
  );

  /** Принятие запроса на дружбу. */
  const accept = useCallback(
    async (friendshipId, userId) => {
      updateFriendStatus(userId, {
        friendshipStatus: 'accepted',
        friendshipDirection: 'incoming',
        friendshipId,
      });
      try {
        await acceptFriendRequest(friendshipId);
        notify.success('accept');
      } catch (error) {
        console.error('Ошибка при принятии запроса на дружбу', error);
        notify.error('accept');
        refetch();
      }
    },
    [updateFriendStatus, notify, refetch]
  );

  /** Блокировка пользователя. */
  const block = useCallback(
    async (userId) => {
      updateFriendStatus(userId, {
        friendshipStatus: 'blocked',
        friendshipDirection: 'incoming',
        friendshipId: null,
      });
      try {
        const result = await blockUser(userId);
        const newFriendshipId = result?.friendship?.id;
        if (newFriendshipId) {
          updateFriendStatus(userId, { friendshipId: newFriendshipId });
        }
        notify.success('block');
      } catch (error) {
        console.error('Ошибка при блокировке пользователя', error);
        notify.error('block');
        refetch();
      }
    },
    [updateFriendStatus, notify, refetch]
  );

  /** Разблокировка пользователя. */
  const unlock = useCallback(
    async (friendshipId, userId) => {
      updateFriendStatus(userId, {
        friendshipStatus: null,
        friendshipDirection: null,
        friendshipId: null,
      });
      try {
        await deleteFriend(friendshipId);
        notify.success('unlock');
      } catch (error) {
        console.error('Ошибка при разблокировке пользователя', error);
        notify.error('unlock');
        refetch();
      }
    },
    [updateFriendStatus, notify, refetch]
  );

  /** ID пользователей в зависимости от вкладки(фильтра). */
  const userIds = useMemo(
    () => friendsItems.map((u) => u.id).filter(Boolean),
    [friendsItems]
  );
  const onlineMap = useOnline(userIds);

  /** Обогащаем данные с онлайн статусом. */
  const enrichedData = useMemo(
    () =>
      friendsItems.map((user) => ({
        ...user,
        online: onlineMap.get(user.id) ?? user.online,
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
    follow,
    unfollow,
    accept,
    block,
    unlock,
    refetch,
  };
};
