import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { addLike, deleteLike } from '../../../app/providers/slices/likesSlice';
import { addTrackToLibrary, removeTrackFromLibrary } from '../../../entities/track';
import { createTrack, deleteTrack } from '../../../entities/track';

/**
 * Хук для действий с треками
 * @returns {Object}
 * @property {Function} handleAddTrack - Добавить трек
 * @property {Function} handleDeleteTrack- Удалить трек
 * @property {Function} handleAddToLibrary - Добавить трек в библиотеку
 * @property {Function} handleRemoveFromLibrary - Удалить трек из библиотеки
 * @property {Function} handleLike - Поставить лайк треку
 * @property {Function} handleUnlike - Удалить лайк с трека
 * @property {Object} currentUser - Текущий пользователь
 */

export const useTrackActions = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);

  const handleAddTrack = useCallback(
    (formData) => {
      if (!currentUser?.id || !formData) return;
      dispatch(createTrack({ currentUserId: currentUser.id, formData }));
    },
    [dispatch, currentUser?.id]
  );

  const handleDeleteTrack = useCallback(
    (trackId) => {
      if (!currentUser?.id || !trackId) return;
      dispatch(deleteTrack({ currentUser, trackId }));
    },
    [dispatch, currentUser]
  );

  const handleAddToLibrary = useCallback(
    (trackId) => {
      if (!currentUser?.id || !trackId) return;
      dispatch(addTrackToLibrary({ currentUserId: currentUser.id, trackId }));
    },
    [dispatch, currentUser?.id]
  );

  const handleRemoveFromLibrary = useCallback(
    (trackId) => {
      if (!currentUser?.id || !trackId) return;
      dispatch(removeTrackFromLibrary({ currentUserId: currentUser.id, trackId }));
    },
    [dispatch, currentUser?.id]
  );

  const handleLike = useCallback(
    (trackId) => {
      if (!currentUser?.id || !trackId) return;
      dispatch(addLike({ currentUserId: currentUser.id, targetId: trackId, targetType: 'Music' }));
    },
    [dispatch, currentUser?.id]
  );

  const handleUnlike = useCallback(
    (trackId) => {
      if (!currentUser?.id || !trackId) return;
      dispatch(
        deleteLike({ currentUserId: currentUser.id, targetId: trackId, targetType: 'Music' })
      );
    },
    [dispatch, currentUser?.id]
  );

  return {
    handleAddTrack,
    handleDeleteTrack,
    handleAddToLibrary,
    handleRemoveFromLibrary,
    handleLike,
    handleUnlike,
    currentUser,
  };
};
