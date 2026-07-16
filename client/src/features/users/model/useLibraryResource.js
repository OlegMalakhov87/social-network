import { useCallback } from 'react';
import { addLike, deleteLike } from '../../../entities/like';
import {
  addTrackToLibrary,
  deleteTrackFromLibrary,
  updateTrackFromLibrary,
} from '../../../entities/track';
import {
  addVideoToLibrary,
  deleteVideoFromLibrary,
  updateVideoFromLibrary,
} from '../../../entities/video ';
import {
  useNotify,
  useOptimisticCommentCount,
  useOptimisticCounter,
  useOptimisticFavorite,
  useOptimisticLike,
} from '../../../shared/hooks';

/**
 * Хук для управления ресурсами библиотеки.
 * @param {Array} items - массив сущностей.
 * @param {number|null} userId - ID текущего пользователя.
 * @param {boolean} isOwnProfile - является ли текущий пользователь владельцем профиля.
 * @param {string} activeTab - текущая вкладка.
 * @param {Object} refetch - объект с функциями для обновления ресурсов.
 * @param {Function} setItems - функция для обновления items.
 * @param {Function} onError - функция обработки ошибки.
 * @param {Function} onSuccess - функция обработки успеха.
 */
export function useLibraryResource({
  items,
  userId,
  isOwnProfile,
  activeTab,
  refetch,
  setItems,
  onError,
  onSuccess,
}) {
  const notify = useNotify();
  /**
   *Оптимистичное добавление сущности в библиотеку.
   * @param {number} itemId – ID сущности.
   * @returns {Promise<void>}
   */
  const addItemOptimistic = useCallback(
    async (itemId) => {
      // Обновляем setItems для мгновенного UI
      if (isOwnProfile) {
        // Свой профиль – сбрасываем счётчик, ставим дату добавления
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isInLibrary: true,
                  ...(activeTab === 'videos'
                    ? { viewCount: 0, lastWatchedAt: new Date().toISOString() }
                    : { playCount: 0 }),
                  libraryCreatedAt: new Date().toISOString(),
                }
              : item
          )
        );
      } else {
        // Чужой профиль – меняем только кнопку, данные профиля не трогаем
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: true } : item
          )
        );
      }
      try {
        let result;
        if (activeTab === 'videos') {
          result = await addVideoToLibrary(itemId);
        } else if (activeTab === 'tracks') {
          result = await addTrackToLibrary(itemId);
        }
        if (result) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, libraryId: result.libraryItem.id }
                : item
            )
          );
        }
        onSuccess?.('add', result);
      } catch (err) {
        console.error(
          `Ошибка добавления сущности в библиотеку ${activeTab}:`,
          err
        );
        onError?.('add', err);
        // Откат при ошибке
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: false } : item
          )
        );
        if (activeTab === 'videos') {
          refetch.refetchVideos();
        } else if (activeTab === 'tracks') {
          refetch.refetchTracks();
        }
      }
    },
    [isOwnProfile, activeTab, refetch, setItems, onError, onSuccess]
  );

  /**
   * Удаление сущности из библиотеки.
   * @param {number} itemId – ID сущности.
   * @param {number} libraryId – запись в библиотеке
   * @returns {Promise<void>}
   */
  const deleteItemOptimistic = useCallback(
    async (itemId, libraryId) => {
      if (!itemId || !libraryId) return;

      // Обновляем setItems для мгновенного UI
      if (isOwnProfile) {
        // Свой профиль – сбрасываем состояние библиотеки
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isInLibrary: false,
                  isFavorite: false,
                  libraryCreatedAt: null, // дата добавления в библиотеку
                  ...(activeTab === 'videos'
                    ? { viewCount: 0, lastWatchedAt: null }
                    : { playCount: 0 }),
                }
              : item
          )
        );
      } else {
        // Чужой профиль – меняем только кнопку, данные профиля не трогаем
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: false } : item
          )
        );
      }
      try {
        let result;
        if (activeTab === 'videos') {
          result = await deleteVideoFromLibrary(libraryId);
        } else if (activeTab === 'tracks') {
          result = await deleteTrackFromLibrary(libraryId);
        }
        if (result) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, libraryId: false } : item
            )
          );
        }
        onSuccess?.('delete', result);
      } catch (err) {
        console.error(
          `Ошибка удаления сущности из библиотеки ${activeTab}:`,
          err
        );
        onError?.('delete', err);
        // Откат при ошибке
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: true } : item
          )
        );
        if (activeTab === 'videos') {
          refetch.refetchVideos();
        } else if (activeTab === 'tracks') {
          refetch.refetchTracks();
        }
      }
    },
    [activeTab, refetch, setItems, onError, isOwnProfile, onSuccess]
  );

  /** Оптимистичное управление лайками. */
  const toggleLikeItem = useOptimisticLike({
    setItems,
    addLikeFn: addLike,
    deleteLikeFn: deleteLike,
    currentUserId: userId,
    targetType: activeTab,
    onSuccess: (action) => {
      notify.success(action);
    },
    onError: (action) => {
      notify.error(action);
    },
  });

  /** Оптимистичный счётчик просмотров. */
  const { incrementWithApi: incrementCounter } = useOptimisticCounter({
    items,
    setItems,
    countField: activeTab === 'videos' ? 'viewCount' : 'playCount',
    updateFn:
      activeTab === 'videos' ? updateVideoFromLibrary : updateTrackFromLibrary,
    targetType: activeTab,
  });

  /** Оптимистичное управление избранным. */
  const toggleFavoriteItem = useOptimisticFavorite({
    setItems,
    updateFavoriteFn:
      activeTab === 'videos' ? updateVideoFromLibrary : updateTrackFromLibrary,
    targetType: activeTab,
    onSuccess: (action) => {
      notify.success(action);
    },
    onError: (action) => {
      notify.error(action);
    },
  });

  /** Оптимистичный счётчик комментариев. */
  const updateCommentCount = useOptimisticCommentCount({
    setItems,
  });

  return {
    toggleLikeItem,
    deleteItemOptimistic,
    addItemOptimistic,
    incrementCounter,
    toggleFavoriteItem,
    updateCommentCount,
  };
}
