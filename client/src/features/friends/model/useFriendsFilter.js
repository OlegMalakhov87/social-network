import { useSelector } from 'react-redux';
import { selectFriendshipMap, selectFilteredFriends } from '../../../entities/friend';

/**
 * Хук получения отфильтрованных пользователей.
 * @param {Object} params
 * @param {string} params.filter - категория ('All', 'Friends', ...)
 * @param {string} params.searchQuery - поисковый запрос
 * @returns {{ friends: Array, isLoading: boolean }}
 */
export const useFriendsFilter = ({ filter, searchQuery }) => {
  const currentUserId = useSelector((state) => state.auth?.user?.id);
  const status = useSelector((state) => state.friends?.status ?? 'idle');
  const friendshipMap = useSelector((state) => selectFriendshipMap(state, currentUserId));
  const friends = useSelector((state) =>
    selectFilteredFriends(state, currentUserId, friendshipMap, searchQuery, filter)
  );

  return {
    friends,
    isLoading: status === 'loading' || !currentUserId,
  };
};
