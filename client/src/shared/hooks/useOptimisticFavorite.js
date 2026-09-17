import { useCallback } from 'react';
import { parseApiError } from '../lib';
/**
 * Универсальный хук для оптимистичного управления избранным.
 *
 * @param {Object} params - параметры запроса
 * @param {Function} params.setItems - функция обновления массива
 * @param {Function} params.updateFavoriteFn - функция обновления избранного
 * @param {Function} [params.onSuccess] - функция обработки успеха.
 * @param {Function} [params.onError] - функция обработки ошибки
 * @returns {Function} - функция для добавления/удаления из избранного
 */
export const useOptimisticFavorite = ({
  setItems,
  updateFavoriteFn,
  onSuccess,
  onError,
}) => {
  const toggleFavorite = useCallback(
    async (itemId, libraryId, currentlyFavorite) => {
      if (!itemId || !libraryId) return false;
      const newFavorite = !currentlyFavorite;
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isFavorite: newFavorite } : item
        )
      );
      try {
        await updateFavoriteFn(libraryId, {
          isFavorite: newFavorite,
        });
        onSuccess?.(newFavorite);
        return true;
      } catch (err) {
        // Откат при ошибке
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, isFavorite: currentlyFavorite }
              : item
          )
        );
        onError?.(parseApiError(err, 'Ошибка избранного'));
        return false;
      }
    },
    [setItems, updateFavoriteFn, onError, onSuccess]
  );
  return toggleFavorite;
};
