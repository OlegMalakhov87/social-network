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
 * @param {Object} params - параметры запроса
 * @param {number|null} params.profileUserId - ID пользователя
 * @param {number|null} params.currentUserId - ID текущего пользователя
 * @param {boolean} params.isOwnProfile - является ли текущий пользователь владельцем профиля
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Object} - объект с данными о постах пользователя
 */
export const useUserPosts = ({
  profileUserId,
  currentUserId,
  isOwnProfile,
  sortKey,
}) => {
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
      if (!profileUserId || profileUserId <= 0) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchPostsApi, {
        params: { userId: profileUserId, page, limit, sortKey },
        signal,
      });
    },
    deps: [profileUserId, sortKey],
    onError: () => notify.error('load'),
  });

  /** Оптимистичные мутации */
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

  /** Нормализация постов. */
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
