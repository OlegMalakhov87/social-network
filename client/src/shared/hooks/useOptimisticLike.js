import { useCallback } from 'react';

/**
 * Универсальный хук для оптимистичного управления лайками.
 *
 * @param {Object} params - параметры запроса
 * @param {Function} params.setItems - функция обновления массива
 * @param {Function} params.addLikeFn - функция добавления лайка (async)
 * @param {Function} params.deleteLikeFn - функция удаления лайка (async)
 * @param {number|string} params.currentUserId - ID текущего пользователя
 * @param {string} params.targetType - тип сущности (Post, News, Comment, etc.)
 * @param {Function} params.onSuccess - функция обработки успеха.
 * @param {Function} params.onError - функция обработки ошибки
 * @returns {Function} - функция для добавления/удаления лайка
 */
export const useOptimisticLike = ({
  setItems,
  addLikeFn,
  deleteLikeFn,
  currentUserId,
  targetType,
  onSuccess,
  onError,
}) => {
  const toggleLike = useCallback(
    async (itemId, currentlyLiked) => {
      if (!currentUserId || !itemId) return;

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
};
