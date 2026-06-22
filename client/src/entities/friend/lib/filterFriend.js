/**
 * Отфильтровать и обогатить пользователей согласно категории и поисковому запросу.
 * @param {Object} params
 * @param {Array} params.usersData - все пользователи
 * @param {Array} params.friendsData - записи о дружбе
 * @param {number} params.currentUserId
 * @param {Map} params.friendshipMap - Map<friendId, {status, direction}>
 * @param {string} params.filter - категория
 * @param {string} params.searchQuery
 * @returns {Array} пользователи с полями _friendshipStatus, _friendshipDirection
 */
export const filterFriend = ({
  usersData,
  friendsData,
  currentUserId,
  friendshipMap,
  filter,
  searchQuery,
}) => {
  const getInfo = (userId) => friendshipMap.get(userId) || null;

  const filteredByStatus = usersData.filter((user) => {
    if (!user.id || !currentUserId || user.id === currentUserId) return false;

    const info = getInfo(user.id);
    const status = info?.status || null;

    switch (filter) {
      case 'All':
        return status === null;
      case 'Friends':
        return status === 'accepted';
      case 'Friends of friends': {
        const myFriends = Array.from(friendshipMap.entries())
          .filter(([_, i]) => i.status === 'accepted')
          .map(([id]) => id);
        return (
          myFriends.some((friendId) =>
            friendsData.some(
              (f) =>
                ((f.userId === user.id && f.friendId === friendId) ||
                  (f.userId === friendId && f.friendId === user.id)) &&
                f.status === 'accepted'
            )
          ) && status !== 'accepted'
        );
      }
      case 'Subscribers':
        return (
          (info?.status === 'pending' && info?.direction === 'incoming') ||
          (info?.status === 'blocked' && info?.direction === 'incoming')
        );
      case 'Subscriptions':
        return (
          (info?.status === 'pending' && info?.direction === 'outgoing') ||
          (info?.status === 'blocked' && info?.direction === 'outgoing')
        );
      default:
        return true;
    }
  });

  let result = filteredByStatus;
  if (searchQuery?.trim()) {
    const s = searchQuery.trim().toLowerCase();
    result = filteredByStatus.filter(
      (user) => user.name?.toLowerCase().includes(s) || user.nickname?.toLowerCase().includes(s)
    );
  }

  return result.map((user) => {
    const info = getInfo(user.id);
    return {
      ...user,
      _friendshipStatus: info?.status || null,
      _friendshipDirection: info?.direction || null,
    };
  });
};
