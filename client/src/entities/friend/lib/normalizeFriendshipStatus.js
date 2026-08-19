/**
 * Статус дружбы из GET /friends/status/:userId
 * (friendshipStatus, friendshipDirection, friendshipId).
 */
export const normalizeFriendshipStatus = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      status: null,
      direction: null,
      friendshipId: null,
    };
  }

  return {
    status: data.friendshipStatus ?? data.status ?? null,
    direction: data.friendshipDirection ?? data.direction ?? null,
    friendshipId: data.friendshipId ?? null,
  };
};
