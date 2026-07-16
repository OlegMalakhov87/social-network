import { useCallback } from 'react';

import { addLike, deleteLike } from '../../../entities/like';

import {
  createNewsApi,
  deleteNewsApi,
  editNewsApi,
  incrementNewsView,
} from '../../../entities/news';

import {
  useOptimisticField,
  useOptimisticMutation,
} from '../../../shared/hooks';

/**
 * CRUD + optimistic update новостей.
 *
 * Не занимается загрузкой данных.
 * Работает только с уже полученным списком.
 *
 * @param {Object} params
 * @param {Function} params.setRawNews
 * @param {number} params.userId
 */
export const useNewsActions = ({ setRawNews, userId }) => {
  const { addItem, removeItem, updateItem, patchItem } =
    useOptimisticMutation(setRawNews);

  const { incrementField, decrementField, updateField } =
    useOptimisticField(setRawNews);

  /**
   * Добавление новости
   */
  const handleAddNews = useCallback(
    async (newsData) => {
      if (!userId || !newsData) return false;

      try {
        const news = await createNewsApi(newsData);

        addItem(news);

        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    [userId, addItem]
  );

  /**
   * Удаление новости
   */
  const handleDeleteNews = useCallback(
    async (newsId) => {
      if (!newsId) return false;

      try {
        await deleteNewsApi(newsId);

        removeItem(newsId);

        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    [removeItem]
  );

  /**
   * Обновление новости
   */
  const handleEditNews = useCallback(
    async (newsId, newsData) => {
      if (!newsId || !newsData) return false;

      try {
        await editNewsApi(newsId, newsData);

        updateItem(newsId, newsData);

        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    },
    [updateItem]
  );

  /**
   * Лайк
   */
  const toggleLikeNews = useCallback(
    async (newsId, currentlyLiked) => {
      if (!userId) return;

      updateField(newsId, 'likes', (likes = []) => {
        if (currentlyLiked) {
          return likes.filter((like) => like.userId !== userId);
        }

        return [...likes, { userId }];
      });

      try {
        if (currentlyLiked) {
          await deleteLike('News', newsId);
        } else {
          await addLike('News', newsId);
        }
      } catch (err) {
        updateField(newsId, 'likes', (likes = []) => {
          if (currentlyLiked) {
            return [...likes, { userId }];
          }

          return likes.filter((like) => like.userId !== userId);
        });

        console.error(err);
      }
    },
    [userId, updateField]
  );

  /**
   * Просмотры
   */
  const incrementViewCount = useCallback(
    async (newsId) => {
      incrementField(newsId, 'viewCount');

      try {
        await incrementNewsView(newsId);
      } catch (err) {
        decrementField(newsId, 'viewCount');
        console.error(err);
      }
    },
    [incrementField, decrementField]
  );

  /**
   * Комментарии
   */
  const updateCommentCount = useCallback(
    (newsId, delta) => {
      if (delta > 0) {
        incrementField(newsId, 'commentsCount', delta);
      } else {
        decrementField(newsId, 'commentsCount', Math.abs(delta));
      }
    },
    [incrementField, decrementField]
  );

  return {
    handleAddNews,
    handleDeleteNews,
    handleEditNews,
    toggleLikeNews,
    incrementViewCount,
    updateCommentCount,
  };
};
