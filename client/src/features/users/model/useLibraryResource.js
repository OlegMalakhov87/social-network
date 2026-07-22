import { useCallback } from 'react';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import { updateTrackFromLibrary } from '../../../entities/track';
import { updateVideoFromLibrary } from '../../../entities/video ';
import {
  useNotify,
  useOptimisticCommentCount,
  useOptimisticCounter,
  useOptimisticFavorite,
  useOptimisticLike,
} from '../../../shared/hooks';

/**
 * Хук для управления ресурсами библиотеки.
 *
 * @param {Object} params - параметры запроса
 * @param {Array} params.items - массив сущностей.
 * @param {number} params.userId - ID текущего пользователя.
 * @param {boolean} params.isOwnProfile - является ли текущий пользователь владельцем профиля.
 * @param {string} params.activeTab - текущая вкладка.
 * @param {Object} params.refetch - объект с функциями для обновления ресурсов.
 * @param {Function} params.setItems - функция для обновления items.
 * @param {Function} params.getAddStateTransform - функция для получения состояния добавления.
 * @param {Function} params.getRemoveStateTransform - функция для получения состояния удаления.
 * @param {Function} params.addFn - функция для добавления в библиотеку.
 * @param {Function} params.removeFn - функция для удаления из библиотеки.
 */
export const useLibraryResource = ({
  items,
  userId,
  isOwnProfile,
  refetch,
  setItems,
  getAddStateTransform,
  getRemoveStateTransform,
  addFn,
  removeFn,
  activeTab,
}) => {
  const notify = useNotify();
  /**
   *Оптимистичное добавление сущности в библиотеку.
   * @param {number} itemId – ID сущности.
   * @returns {Promise<void>} - promise для добавления сущности в библиотеку
   */
  const addItemOptimistic = useCallback(
    async (itemId) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...(isOwnProfile ? getAddStateTransform() : {}),
                isInLibrary: true,
              }
            : item
        )
      );

      try {
        const result = await addFn(itemId);
        if (result?.libraryItem?.id) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, libraryId: result.libraryItem.id }
                : item
            )
          );
        }
        notify.success('add');
      } catch (err) {
        console.error('Ошибка добавления в библиотеку профиля:', err);
        notify.error('add');
        // Откат
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, isInLibrary: false } : item
          )
        );
        refetch?.();
      }
    },
    [setItems, isOwnProfile, getAddStateTransform, addFn, refetch, notify]
  );

  const deleteItemOptimistic = useCallback(
    async (libraryId, itemId) => {
      if (!itemId || !libraryId) return;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...(isOwnProfile ? getRemoveStateTransform() : {}),
                isInLibrary: false,
                libraryId: null,
              }
            : item
        )
      );

      try {
        await removeFn(libraryId);
        notify.success('delete');
      } catch (err) {
        console.error('Ошибка удаления из библиотеки профиля:', err);
        notify.error('delete');
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, isInLibrary: true, libraryId }
              : item
          )
        );
        refetch?.();
      }
    },
    [setItems, isOwnProfile, getRemoveStateTransform, removeFn, refetch, notify]
  );

  /** Оптимистичное управление лайками. */
  const toggleLikeItem = useOptimisticLike({
    setItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
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
};
