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
 * Хук для управления библиотекой и лайками/счётчиками для вкладок «Музыка» и «Видео».
 *
 * @param {Object} params - параметры запроса
 * @param {Array} params.items - массив элементов
 * @param {number} params.userId - ID пользователя
 * @param {boolean} params.isOwnProfile - является ли текущий пользователь владельцем профиля
 * @param {Function} params.setItems - функция для установки массива элементов
 * @param {boolean} params.isTracks - является ли текущая вкладка вкладкой «Музыка»
 * @param {boolean} params.isVideos - является ли текущая вкладка вкладкой «Видео»
 * @param {string} params.currentTab - название текущей вкладки
 * @param {string} params.activeTab - название активной вкладки
 * @param {Function} params.getAddStateTransform - функция для получения состояния добавления элемента
 * @param {Function} params.getRemoveStateTransform - функция для получения состояния удаления элемента
 * @returns {Object} - объект с функциями для управления библиотекой и лайками/счётчиками
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
  /** Функция для получения состояния добавления элемента (меняем только для своего профиля) */
  const mapOnAdd = useCallback(
    () => (isOwnProfile ? (getAddStateTransform?.() ?? {}) : {}),
    [isOwnProfile, getAddStateTransform]
  );

  /** Функция для получения состояния удаления элемента (меняем только для своего профиля) */
  const mapOnRemove = useCallback(
    () => (isOwnProfile ? (getRemoveStateTransform?.() ?? {}) : {}),
    [isOwnProfile, getRemoveStateTransform]
  );

  /** Хук для управления библиотекой */
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
    targetType: currentTab ? (isTracks ? 'tracks' : 'videos') : null,
    mapOnAdd,
    mapOnRemove,
  });

  /** Хук для управления лайками */
  const toggleLikeItem = useOptimisticLike({
    setItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: userId,
    targetType: activeTab === 'photos' ? 'posts' : activeTab,
  });

  /** Хук для управления счётчиками */
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

  /** Хук для управления избранным */
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
