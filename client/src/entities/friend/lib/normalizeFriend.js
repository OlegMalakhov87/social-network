/**
 * Преобразует сырой объект пользователя с сервера в формат для FriendCard.
 *
 * @param {Object} user – один пользователь из ответа API
 * @returns {Object} – плоский объект друга
 */
export function normalizeFriend(user) {
  if (!user || typeof user !== 'object') return user;
  
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    online: user.online,
    age: user.age,
    address: user.address,
    job: user.job,
    status: user.status,
    isPublic: user.isPublic,
    gender: user.gender,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    friendshipStatus: user.friendshipStatus || null,
    friendshipDirection: user.friendshipDirection || null,
    friendshipId: user.friendshipId || null,
  };
}
