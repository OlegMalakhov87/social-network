import { useSelector } from 'react-redux';
import { selectFriendshipMap } from '../../../entities/friend';

/**
 * Хук статуса дружбы с конкретным пользователем.
 * @param {Object} params
 * @param {number} params.targetUserId
 * @param {number} params.currentUserId
 * @returns {{ status: string|null, direction: string|null }}
 */
export const useFriendshipStatus = ({ targetUserId, currentUserId }) => {
  const friendshipMap = useSelector((state) => selectFriendshipMap(state, currentUserId));

  if (!targetUserId || !currentUserId || !(friendshipMap instanceof Map)) {
    return { status: null, direction: null };
  }

  const data = friendshipMap.get(targetUserId);
  return {
    status: data?.status || null,
    direction: data?.direction || null,
  };
};
