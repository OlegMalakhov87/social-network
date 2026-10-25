import { useMemo } from 'react';

import {
  addPostApi,
  deletePostApi,
  fetchPostsApi,
  normalizePosts,
  updatePostApi,
} from '../../../entities/post';
import {
  useInfiniteScroll,
  useNormalizedData,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Возвращает посты пользователя и изменяет их локально.
 *
 * @param {Object} params - Параметры запроса
 * @param {number|null} params.profileUserId - Идентификатор пользователя
 * @param {number|null} params.currentUserId - Идентификатор текущего пользователя
 * @param {boolean} params.isOwnProfile - Признак своего профиля
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {{
 *   posts: Array<Object>,
 *   hasMore: boolean,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   refetch: Function,
 *   addPost: Function,
 *   updatePost: Function,
 *   deletePost: Function,
 *   setPostsItems: Function
 * }} Посты и действия
 */
export const usePosts = ({
  profileUserId,
  currentUserId,
  isOwnProfile,
  sortKey,
}) => {
  const scrollDeps = useMemo(
    () => [profileUserId, sortKey, currentUserId],
    [profileUserId, sortKey, currentUserId]
  );

  const {
    items: postsItems,
    setItems: setPostsItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useInfiniteScroll({
    /**
     * Загружает страницу постов.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница постов
     */
    fetchFn: ({ page, limit, signal }) => {
      if (!profileUserId || profileUserId <= 0) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchPostsApi, {
        params: { userId: profileUserId, page, limit, sortKey },
        signal,
      });
    },
    deps: scrollDeps,
  });

  const {
    add: addPost,
    edit: updatePost,
    remove: deletePost,
  } = useOptimisticMutation({
    items: postsItems,
    setItems: setPostsItems,
    addFn: addPostApi,
    editFn: updatePostApi,
    deleteFn: deletePostApi,
  });

  const posts = useNormalizedData({
    items: postsItems,
    normalizeFn: normalizePosts,
  });

  return {
    posts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refetch,
    addPost,
    updatePost,
    deletePost,
    setPostsItems,
  };
};
