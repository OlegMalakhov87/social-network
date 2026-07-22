import { useCallback } from 'react';

/**
 * Универсальный хук для оптимистичного управления избранным.
 *
 * @param {Object} params - параметры запроса
 * @param {Function} params.setItems - функция обновления массива
 * @param {Function} params.updateFavoriteFn - функция обновления избранного
 * @param {string} params.targetType - тип сущности (video, track)
 * @param {Function} params.onSuccess - функция обработки успеха.
 * @param {Function} params.onError - функция обработки ошибки
 * @returns {Function} - функция для добавления/удаления из избранного
 */
export const useOptimisticFavorite = ({
  setItems,
  updateFavoriteFn,
  targetType,
  onSuccess,
  onError,
}) => {
  const toggleFavorite = useCallback(
    async (itemId, libraryId, currentlyFavorite, count, lastWatchedAt) => {
      if (!itemId || !libraryId) return;
      const newFavorite = !currentlyFavorite;
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isFavorite: newFavorite } : item
        )
      );
      try {
        const result = await updateFavoriteFn(libraryId, {
          isFavorite: newFavorite,
          ...(targetType === 'video'
            ? { viewCount: count }
            : { playCount: count }),
          ...(targetType === 'video'
            ? { lastWatchedAt: lastWatchedAt }
            : undefined),
        });
        onSuccess?.(newFavorite ? 'add' : 'delete', result);
        return result;
      } catch (err) {
        // Откат при ошибке
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, isFavorite: currentlyFavorite }
              : item
          )
        );
        console.error(`Ошибка избранного ${targetType}:`, err);
        onError?.(newFavorite ? 'add' : 'delete', err);
        return false;
      }
    },
    [targetType, setItems, updateFavoriteFn, onError, onSuccess]
  );
  return toggleFavorite;
};
