import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend,
  blockUser,
} from '../../../entities/friend';

/**
 * Хук действий с дружбой.
 * @returns {Object} функции-обработчики, возвращающие функции для stopPropagation
 */
export const useFriendshipActions = () => {
  const currentUserId = useSelector((state) => state.auth?.user?.id);

  const makeHandler = useCallback(
    (apiFunc, successMessage) => (targetUserId) => async (e) => {
      e?.stopPropagation?.();
      if (!currentUserId) return;
      try {
        await apiFunc(targetUserId);
      } catch (error) {
        console.error(error);
      }
    },
    [currentUserId]
  );

  return {
    handleFollow: makeHandler(sendFriendRequest),
    handleUnfollow: makeHandler(rejectFriendRequest),
    handleAccept: makeHandler(acceptFriendRequest),
    handleUnlock: makeHandler(deleteFriend),
    handleBlock: makeHandler(blockUser),
    currentUserId,
  };
};
