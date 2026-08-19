import { useCallback } from 'react';

/**
 * Универсальный хук для оптимистичного управления лайками.
 *
 * @param {Object} params - параметры запроса
 * @param {Function} params.setItems - функция обновления массива
 * @param {Function} params.addLikeFn - функция добавления лайка (async)
 * @param {Function} params.deleteLikeFn - функция удаления лайка (async)
 * @param {number|string} params.currentUserId - ID текущего пользователя
 * @param {string} params.targetType - тип сущности (posts, tracks, videos, news, comments, messages)
 * @returns {Function} - функция для добавления/удаления лайка
 */
export const useOptimisticLike = ({
  setItems,
  addLikeFn,
  deleteLikeFn,
  currentUserId,
  targetType,
}) => {
  const toggleLike = useCallback(
    async (itemId, currentlyLiked) => {
      if (!currentUserId || !itemId) return;

      const delta = currentlyLiked ? -1 : 1;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;

          return {
            ...item,
            likesCount: Math.max(0, (item.likesCount ?? 0) + delta),
            isLiked: !currentlyLiked,
          };
        })
      );

      try {
        const response = currentlyLiked
          ? await deleteLikeFn(targetType, itemId)
          : await addLikeFn(targetType, itemId);
        if (typeof response?.likesCount === 'number') {
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== itemId) return item;

              return {
                ...item,
                likesCount: response.likesCount,
                isLiked: !currentlyLiked,
              };
            })
          );
        }

        return true;
      } catch (err) {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;

            return {
              ...item,
              likesCount: Math.max(0, (item.likesCount ?? 0) - delta),
              isLiked: currentlyLiked,
            };
          })
        );

        console.error(`Ошибка лайка ${targetType}:`, err);

        return false;
      }
    },
    [setItems, addLikeFn, deleteLikeFn, currentUserId, targetType]
  );

  return toggleLike;
};
