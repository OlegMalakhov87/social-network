import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addPostApi,
  deletePostApi,
  editPostApi,
  fetchUserPosts,
  normalizePost,
} from '../../../entities/post';

/**
 * Хук для получения постов пользователя.
 * @param {number|null} profileUserId - ID пользователя
 * @param {number|null} currentUserId - ID текущего пользователя
 * @param {boolean} isOwnProfile - является ли текущий пользователь владельцем профиля
 * @returns {{ posts: Array, pagination: Object|null, isLoading: boolean, error: string|null, refetch: Function, setRawPosts: Function, handleAddPost: Function, handleEditPost: Function, handleDeletePost: Function }}
 */
export function useUserPosts(profileUserId, currentUserId, isOwnProfile) {
  const [rawPosts, setRawPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Получение постов пользователя.
   */
  const fetchPosts = useCallback(async () => {
    if (!profileUserId || profileUserId <= 0) {
      setRawPosts([]);
      setPagination(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchUserPosts(
        isOwnProfile ? currentUserId : profileUserId,
        { page: 1, limit: 30 }
      );
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
  }, [profileUserId, currentUserId, isOwnProfile]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const posts = useMemo(() => {
    if (!Array.isArray(rawPosts)) return [];
    return rawPosts.map((entry) => normalizePost(entry, currentUserId));
  }, [rawPosts, currentUserId]);

  /**
   * Добавление поста.
   * @param {Object} formData - данные поста.
   */
  const handleAddPost = useCallback(
    async (formData) => {
      if (!currentUserId || !formData) return;
      try {
        await addPostApi(formData);
        fetchPosts();
      } catch (error) {
        console.error('Ошибка добавления поста', error);
        return false;
      }
    },
    [currentUserId, fetchPosts]
  );

  /**
   * Редактирование поста.
   * @param {number} postId - ID поста.
   * @param {string} message - текст поста.
   * @param {string} visibility - видимость поста.
   * @param {string} postType - тип поста.
   * @param {string} mediaUrl - URL медиа файла.
   */
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

  /**
   * Удаление поста.
   * @param {number} postId - ID поста.
   */
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

  /**
   * Возвращаем объект с данными о постах пользователя.
   */
  return {
    posts,
    pagination,
    isLoading,
    error,
    setRawPosts,
    handleAddPost,
    handleEditPost,
    handleDeletePost,
    refetch: fetchPosts,
  };
}
