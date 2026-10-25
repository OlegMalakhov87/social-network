import { useCallback } from 'react';

/**
 * Обновляет количество комментариев у элемента.
 *
 * @param {Function} setItems - Обновляет массив элементов
 * @returns {Function} Меняет количество комментариев и возвращает признак обновления.
 */
export const useOptimisticCommentCount = (setItems) => {
  /**
   * Меняет количество комментариев на дельту.
   *
   * @param {number|string} itemId - Идентификатор элемента
   * @param {number} [delta=1] - Изменение счётчика
   * @returns {boolean} Признак обновления или false, если идентификатор пуст.
   */
  const updateCommentCount = useCallback(
    (itemId, delta = 1) => {
      if (!itemId) return false;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                commentsCount: Math.max(0, (item.commentsCount ?? 0) + delta),
              }
            : item
        )
      );

      return true;
    },
    [setItems]
  );
  return updateCommentCount;
};
