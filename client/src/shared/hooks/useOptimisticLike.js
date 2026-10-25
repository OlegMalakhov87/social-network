import { useCallback } from 'react';

/**
 * Переключает отметку до ответа сервера и возвращает прежнее состояние при ошибке.
 *
 * @param {Object} params - Параметры отметки
 * @param {Function} params.setItems - Обновляет массив элементов
 * @param {Function} params.addLikeFn - Добавляет отметку на сервере
 * @param {Function} params.deleteLikeFn - Удаляет отметку на сервере
 * @param {number|string} params.currentUserId - Идентификатор текущего пользователя
 * @param {string} params.targetType - Тип сущности
 * @returns {Function} Переключает отметку и возвращает признак успеха.
 */
export const useOptimisticLike = ({
  setItems,
  addLikeFn,
  deleteLikeFn,
  currentUserId,
  targetType,
}) => {
  /**
   * Переключает отметку и счётчик.
   *
   * @param {number|string} itemId - Идентификатор элемента
   * @param {boolean} currentlyLiked - Отметка уже стоит
   * @returns {Promise<boolean|undefined>} Признак успеха, false при ошибке сервера или undefined без пользователя и идентификатора.
   */
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

        return false;
      }
    },
    [setItems, addLikeFn, deleteLikeFn, currentUserId, targetType]
  );

  return toggleLike;
};
