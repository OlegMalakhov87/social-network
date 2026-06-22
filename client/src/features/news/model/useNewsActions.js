import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { addLike, deleteLike } from '../../../app/providers/slices/likesSlice';
import { addNews, deleteNews } from '../../../entities/news';

/**
 *  Хук для действий с новостями
 * @returns {Object}
 * @property {Function} handleAddNews - Добавить новость
 * @property {Function} handleDeleteNews - Убрать новость
 * @property {Function} handleLike - Поставить лайк видео
 * @property {Function} handleUnlike - Убрать лайк с видео
 */

export const useNewsActions = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);

  const handleLike = useCallback(
    (newsId) => {
      if (!currentUser?.id || !newsId) return;
      dispatch(
        addLike({
          currentUserId: currentUser.id,
          targetId: newsId,
          targetType: 'News',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleUnlike = useCallback(
    (newsId) => {
      if (!currentUser?.id || !newsId) return;
      dispatch(
        deleteLike({
          currentUserId: currentUser.id,
          targetId: newsId,
          targetType: 'News',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleAddNews = useCallback(
    (formData) => {
      if (!currentUser?.id || !formData) return;
      dispatch(
        addNews({
          currentUserId: currentUser.id,
          formData,
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleDeleteNews = useCallback(
    (newsId) => {
      if (!currentUser?.id || !newsId) return;
      dispatch(
        deleteNews({
          currentUser,
          newsId,
        })
      );
    },
    [dispatch, currentUser]
  );
  return {
    handleAddNews,
    handleDeleteNews,
    handleLike,
    handleUnlike,
    currentUser,
  };
};
