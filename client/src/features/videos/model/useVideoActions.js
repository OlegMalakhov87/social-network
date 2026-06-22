import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { addLike, deleteLike } from '../../../app/providers/slices/likesSlice';
import { addVideoToLibrary, removeVideoFromLibrary } from '../../../entities/video';
import { createVideo, deleteVideo } from '../../../entities/video';

/**
 *  Хук для действий с видео
 * @returns {Object}
 * @property {Function} handleAddVideo - Добавить видео
 * @property {Function} handleDeleteVideo - Удалить видео
 * @property {Function} handleAddToLibrary - Добавить видео в библиотеку
 * @property {Function} handleRemoveFromLibrary - Убрать видео из библиотеки
 * @property {Function} handleLike - Поставить лайк видео
 * @property {Function} handleUnlike - Убрать лайк с видео
 */

export const useVideoActions = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);

  const handleAddVideo = useCallback(
    (formData) => {
      if (!currentUser?.id || !formData) return;
      dispatch(createVideo({ currentUserId: currentUser.id, formData }));
    },
    [dispatch, currentUser?.id]
  );

  const handleDeleteVideo = useCallback(
    (videoId) => {
      if (!currentUser?.id || !videoId) return;
      dispatch(deleteVideo({ currentUser, videoId }));
    },
    [dispatch, currentUser]
  );

  const handleAddToLibrary = useCallback(
    (videoId) => {
      if (!currentUser?.id || !videoId) return;
      dispatch(
        addVideoToLibrary({
          currentUserId: currentUser.id,
          videoId,
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleRemoveFromLibrary = useCallback(
    (videoId) => {
      if (!currentUser?.id || !videoId) return;
      dispatch(
        removeVideoFromLibrary({
          currentUserId: currentUser.id,
          videoId,
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleLike = useCallback(
    (videoId) => {
      if (!currentUser?.id || !videoId) return;
      dispatch(
        addLike({
          currentUserId: currentUser.id,
          targetId: videoId,
          targetType: 'Video',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  const handleUnlike = useCallback(
    (videoId) => {
      if (!currentUser?.id || !videoId) return;
      dispatch(
        deleteLike({
          currentUserId: currentUser.id,
          targetId: videoId,
          targetType: 'Video',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  return {
    handleAddVideo,
    handleDeleteVideo,
    handleAddToLibrary,
    handleRemoveFromLibrary,
    handleLike,
    handleUnlike,
    currentUser,
  };
};
