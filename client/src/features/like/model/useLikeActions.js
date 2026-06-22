import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { addLike, deleteLike } from '../../../entities/like';

/**
 * Хук для выполнения лайков/дизлайков через API.
 * @returns {{ handleLike: Function, handleUnlike: Function }}
 */
export function useLikeActions() {
  const currentUserId = useSelector((state) => state.auth?.user?.id);

  const handleLike = useCallback(
    async (targetType, targetId) => {
      if (!currentUserId) return false;
      try {
        await addLike(targetType, targetId);
        return true;
      } catch (error) {
        console.error('Ошибка лайка:', error);
        return false;
      }
    },
    [currentUserId]
  );

  const handleUnlike = useCallback(
    async (targetType, targetId) => {
      if (!currentUserId) return false;
      try {
        await deleteLike(targetType, targetId);
        return true;
      } catch (error) {
        console.error('Ошибка дизлайка:', error);
        return false;
      }
    },
    [currentUserId]
  );

  return { handleLike, handleUnlike };
}
