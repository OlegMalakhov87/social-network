import { useCallback } from 'react';

/**
 * Хук для обновления счётчика комментариев.
 *
 * @param {Function} setItems - функция для обновления массива элементов
 * @returns {Function} - функция для обновления счётчика комментариев
 */
export const useOptimisticCommentCount = (setItems) => {
  const updateCommentCount = useCallback(
    (itemId, delta) => {
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
    },
    [setItems]
  );
  return updateCommentCount;
};
