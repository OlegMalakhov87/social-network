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
  useNotify,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Хук для получения постов пользователя с бесконечным скроллом.
 *
 * @param {number} profileUserId - ID пользователя
 * @param {number} currentUserId - ID текущего пользователя
 * @param {string} sortKey - ключ сортировки
 * @returns {Object} - объект с данными о постах пользователя
 */
export const useUserPosts = (profileUserId, currentUserId, sortKey) => {
  const notify = useNotify('posts');

  /** Получение постов с бесконечным скроллом. */
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
    fetchFn: ({ page, limit, signal }) => {
      if (!profileUserId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchPostsApi, {
        params: { userId: profileUserId, page, limit, sortKey },
        signal,
      });
    },
    deps: [profileUserId, sortKey],
    onSuccess: () => notify.success('load'),
    onError: () => notify.error('load'),
  });

  /** Оптимистичные мутации (CRUD). */
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
    onSuccess: (action) => {
      notify.success(action);
    },
    onError: (action) => {
      notify.error(action);
    },
  });

  /** Нормализация и сортировка постов. */
  const posts = useNormalizedData({
    items: postsItems,
    normalizeFn: normalizePosts,
    userId: currentUserId,
  });

  /** Возвращаем объект с данными о постах пользователя. */
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
