import { useCallback } from 'react';
import { selectUser } from '../../../app/providers/slices/auth/authSelectors';
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
  const currentUser = selectUser();
  const makeHandler = useCallback(
    (apiFunc, successMessage) => (targetUserId) => async (e) => {
      e?.stopPropagation?.();
      if (!currentUser) return;
      try {
        await apiFunc(targetUserId);
      } catch (error) {
        console.error(error);
      }
    },
    [currentUser]
  );

  return {
    handleFollow: makeHandler(sendFriendRequest),
    handleUnfollow: makeHandler(rejectFriendRequest),
    handleAccept: makeHandler(acceptFriendRequest),
    handleUnlock: makeHandler(deleteFriend),
    handleBlock: makeHandler(blockUser),
    currentUser,
  };
};
