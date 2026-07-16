import { useCallback } from 'react';

/**
 * Универсальный хук для оптимистичного управления избранным.
 *
 * @param {Function} setItems - функция обновления массива
 * @param {Function} updateFavoriteFn - функция обновления избранного
 * @param {string} targetType - тип сущности (video, track)
 * @param {Function} onSuccess - функция обработки успеха.
 * @param {Function} onError - функция обработки ошибки
 * @returns {Function} - функция для добавления/удаления из избранного
 */
export function useOptimisticFavorite({
  setItems,
  updateFavoriteFn,
  targetType,
  onSuccess,
  onError,
}) {
  // Функция для добавления/удаления из избранного
  const toggleFavorite = useCallback(
    async (itemId, libraryId, currentlyFavorite, count, lastWatchedAt) => {
      if (!itemId || !libraryId) return;

      const newFavorite = !currentlyFavorite;

      // Оптимистично обновляем UI
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
    [setItems, updateFavoriteFn, targetType, onError, onSuccess]
  );
  return toggleFavorite;
}
