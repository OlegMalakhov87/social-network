import { useCallback } from 'react';

/**
 * Универсальный хук для оптимистичного управления лайками.
 *
 * @param {Function} setItems - функция обновления массива
 * @param {Function} addLikeFn - функция добавления лайка (async)
 * @param {Function} deleteLikeFn - функция удаления лайка (async)
 * @param {number|string} currentUserId - ID текущего пользователя
 * @param {string} targetType - тип сущности (Post, News, Comment, etc.)
 * @param {Function} onSuccess - функция обработки успеха.
 * @param {Function} onError - функция обработки ошибки
 * @returns {Function} - функция для добавления/удаления лайка
 */
export function useOptimisticLike({
  setItems,
  addLikeFn,
  deleteLikeFn,
  currentUserId,
  targetType,
  onSuccess,
  onError,
}) {
  // Функция для добавления/удаления лайка
  const toggleLike = useCallback(
    async (itemId, currentlyLiked) => {
      if (!currentUserId || !itemId) return;

      // Оптимистично обновляем UI
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;

          return {
            ...item,
            likes: currentlyLiked
              ? (item.likes || []).filter(
                  (like) => like.userId !== currentUserId
                )
              : [...(item.likes || []), { userId: currentUserId }],
          };
        })
      );

      try {
        let result;
        if (currentlyLiked) {
          result = await deleteLikeFn(targetType, itemId);
          onSuccess?.('unlike', result);
        } else {
          result = await addLikeFn(targetType, itemId);
          onSuccess?.('like', result);
        }
        return result;
      } catch (err) {
        // Откат при ошибке
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;

            return {
              ...item,
              likes: currentlyLiked
                ? [...(item.likes || []), { userId: currentUserId }]
                : (item.likes || []).filter(
                    (like) => like.userId !== currentUserId
                  ),
            };
          })
        );
        console.error(`Ошибка лайка ${targetType}:`, err);
        onError?.(currentlyLiked ? 'unlike' : 'like', err);
        return false;
      }
    },
    [
      setItems,
      addLikeFn,
      deleteLikeFn,
      currentUserId,
      targetType,
      onSuccess,
      onError,
    ]
  );

  return toggleLike;
}
