import { useCallback, useMemo } from 'react';

import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import {
  addTrackToLibrary,
  deleteTrackFromLibrary,
  incrementPlaysCount,
  updateFavoriteTrack,
} from '../../../entities/track';
import {
  addVideoToLibrary,
  deleteVideoFromLibrary,
  incrementViewsCount,
  updateFavoriteVideo,
} from '../../../entities/video';
import {
  useOptimisticCounter,
  useOptimisticFavorite,
  useOptimisticLibraryToggle,
  useOptimisticLike,
} from '../../../shared/hooks';

/**
 * Обновляет библиотеку, отметки и счётчики музыки или видео.
 *
 * @param {Object} params - Параметры библиотеки
 * @param {Array<Object>} params.items - Элементы библиотеки
 * @param {number} params.userId - Идентификатор пользователя
 * @param {boolean} params.isOwnProfile - Признак своего профиля
 * @param {Function} params.setItems - Обновляет список элементов
 * @param {boolean} params.isTracks - Признак вкладки музыки
 * @param {boolean} params.isVideos - Признак вкладки видео
 * @param {string|null} params.currentTab - Текущая вкладка библиотеки
 * @param {string} params.activeTab - Активная вкладка профиля
 * @param {Function|null} params.getAddStateTransform - Поля при добавлении в библиотеку
 * @param {Function|null} params.getRemoveStateTransform - Поля при удалении из библиотеки
 * @returns {{
 *   toggleLikeItem: Function,
 *   addToLibrary: Function,
 *   deleteFromLibrary: Function,
 *   incrementCounter: Function,
 *   toggleFavoriteItem: Function
 * }} Действия библиотеки
 */
export const useLibraryResource = ({
  items,
  userId,
  isOwnProfile,
  setItems,
  isTracks,
  isVideos,
  currentTab,
  activeTab,
  getAddStateTransform,
  getRemoveStateTransform,
}) => {
  const isActive = Boolean(items) && Boolean(setItems);
  const mapOnAdd = useCallback(
    () => (isOwnProfile ? (getAddStateTransform?.() ?? {}) : {}),
    [isOwnProfile, getAddStateTransform]
  );

  const mapOnRemove = useCallback(
    () => (isOwnProfile ? (getRemoveStateTransform?.() ?? {}) : {}),
    [isOwnProfile, getRemoveStateTransform]
  );

  const { addToLibrary, deleteFromLibrary } = useOptimisticLibraryToggle({
    setItems: isActive ? setItems : () => {},
    addFn: currentTab
      ? isTracks
        ? addTrackToLibrary
        : addVideoToLibrary
      : null,
    deleteFn: currentTab
      ? isTracks
        ? deleteTrackFromLibrary
        : deleteVideoFromLibrary
      : null,
    mapOnAdd,
    mapOnRemove,
  });

  const toggleLikeItem = useOptimisticLike({
    setItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: userId,
    targetType: activeTab === 'photos' ? 'posts' : activeTab,
  });

  const { incrementWithApi: incrementCounter } = useOptimisticCounter({
    items: isActive ? items : [],
    setItems: isActive ? setItems : () => {},
    countField: currentTab ? (isVideos ? 'viewsCount' : 'playsCount') : null,
    updateFn: currentTab
      ? isVideos
        ? incrementViewsCount
        : incrementPlaysCount
      : null,
    targetType: currentTab ? (isVideos ? 'videos' : 'tracks') : null,
  });

  const toggleFavoriteItem = useOptimisticFavorite({
    setItems: isActive ? setItems : () => {},
    updateFavoriteFn: currentTab
      ? isTracks
        ? updateFavoriteTrack
        : updateFavoriteVideo
      : null,
    targetType: currentTab ? (isTracks ? 'tracks' : 'videos') : null,
  });

  return useMemo(
    () => ({
      toggleLikeItem,
      addToLibrary,
      deleteFromLibrary,
      incrementCounter,
      toggleFavoriteItem,
    }),
    [
      toggleLikeItem,
      addToLibrary,
      deleteFromLibrary,
      incrementCounter,
      toggleFavoriteItem,
    ]
  );
};
