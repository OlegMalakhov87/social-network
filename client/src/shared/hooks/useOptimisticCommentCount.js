import { useCallback } from 'react';

/**
 * Обновление счётчика комментариев.
 * @param {Object} props
 * @param {Function} props.setItems - функция для обновления массива элементов
 * @returns {Function} - функция для обновления счётчика комментариев
 */
export function useOptimisticCommentCount({ setItems }) {
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
}
