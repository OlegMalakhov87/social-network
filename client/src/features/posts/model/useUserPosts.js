import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  normalizePost,
  addPostApi,
  fetchUserPosts,
  editPostApi,
  deletePostApi,
} from '../../../entities/post';
import { addLike, deleteLike } from '../../../entities/like';

/**
 * Хук для получения постов пользователя.
 * @param {number} userId
 * @param {Object} filters – { page, limit, visibility }
 * @returns {{ posts: Array, pagination: Object|null, isLoading: boolean, error: string|null, refetch: Function }}
 */
export function useUserPosts(userId) {
  const [rawPosts, setRawPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = useSelector((state) => state.auth.user?.id);

  const fetchPosts = useCallback(async () => {
    if (!userId || userId <= 0) {
      setRawPosts([]);
      setPagination(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchUserPosts(userId, { page: 1, limit: 30 });
      const posts = Array.isArray(data?.posts) ? data.posts : [];
      const postsWithCount = posts.map((post) => ({
        ...post,
        commentsCount: post.comments?.length ?? 0,
      }));
      setRawPosts(postsWithCount || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      setRawPosts([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const posts = useMemo(() => {
    if (!Array.isArray(rawPosts)) return [];
    return rawPosts.map((entry) => normalizePost(entry, currentUserId));
  }, [rawPosts, currentUserId]);

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} postId
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikePost = useCallback(
    async (postId, currentlyLiked) => {
      setRawPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: currentlyLiked
                  ? (post.likesCount ?? 1) - 1
                  : (post.likesCount ?? 0) + 1,
                isLiked: !currentlyLiked,
                likes: currentlyLiked
                  ? (post.likes || []).filter((like) => like.userId !== currentUserId)
                  : [...(post.likes || []), { userId: currentUserId }],
              }
            : post
        )
      );

      try {
        if (currentlyLiked) {
          await deleteLike('Post', postId);
        } else {
          await addLike('Post', postId);
        }
      } catch (err) {
        setRawPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likesCount: currentlyLiked
                    ? (post.likesCount ?? 1) + 1
                    : (post.likesCount ?? 0) - 1,
                  isLiked: currentlyLiked,
                  likes: currentlyLiked
                    ? [...(post.likes || []), { userId: currentUserId }]
                    : (post.likes || []).filter((like) => like.userId !== currentUserId),
                }
              : post
          )
        );
        console.error('Ошибка лайка:', err);
      }
    },
    [currentUserId]
  );

  const handleAddPost = useCallback(
    async (formData) => {
      if (!currentUserId || !formData) return;
      try {
        await addPostApi(formData);
        fetchPosts();
      } catch (error) {
        console.error('Ошибка добавления поста', error);
      }
    },
    [currentUserId, fetchPosts]
  );

  const handleEditPost = useCallback(
    async (postId, message, visibility, postType, mediaUrl) => {
      if (!currentUserId) return false;
      try {
        await editPostApi(postId, message, visibility, postType, mediaUrl);
        fetchPosts();
        return true;
      } catch (error) {
        console.error('Ошибка обновления поста:', error);
        return false;
      }
    },
    [currentUserId, fetchPosts]
  );

  const handleDeletePost = useCallback(
    async (postId) => {
      if (!currentUserId || !postId) return false;
      try {
        await deletePostApi(postId);
        fetchPosts();
        return true;
      } catch (error) {
        console.error('Ошибка удаления поста:', error);
        return false;
      }
    },
    [currentUserId, fetchPosts]
  );

  const updateCommentCount = useCallback((postId, delta) => {
    setRawPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, commentsCount: (post.commentsCount ?? 0) + delta } : post
      )
    );
  }, []);

  return {
    posts,
    pagination,
    isLoading,
    error,
    toggleLikePost,
    handleAddPost,
    handleEditPost,
    handleDeletePost,
    updateCommentCount,
    refetch: fetchPosts,
  };
}
