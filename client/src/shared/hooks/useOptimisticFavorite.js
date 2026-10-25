import { useCallback } from 'react';

import { parseApiError } from '../lib';

/**
 * Переключает избранное до ответа сервера и возвращает прежнее состояние при ошибке.
 *
 * @param {Object} params - Параметры избранного
 * @param {Function} params.setItems - Обновляет массив элементов
 * @param {Function} params.updateFavoriteFn - Сохраняет признак избранного на сервере
 * @param {Function} [params.onSuccess] - Вызывается после успешного сохранения
 * @param {Function} [params.onError] - Получает разобранную ошибку
 * @returns {Function} Переключает избранное и возвращает признак успеха.
 */
export const useOptimisticFavorite = ({
  setItems,
  updateFavoriteFn,
  onSuccess,
  onError,
}) => {
  /**
   * Переключает избранное у элемента.
   *
   * @param {number|string} itemId - Идентификатор элемента
   * @param {number|string} libraryId - Идентификатор элемента библиотеки
   * @param {boolean} currentlyFavorite - Элемент уже в избранном
   * @returns {Promise<boolean>} Признак успеха или false, если идентификаторы пусты или сервер вернул ошибку.
   */
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
        // Возвращает прежнее состояние при ошибке.
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
