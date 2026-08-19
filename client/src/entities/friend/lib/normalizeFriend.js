/**
 * Преобразует сырой объект пользователя с сервера в формат для FriendCard.
 *
 * @param {Object} user – один пользователь из ответа API
 * @returns {Object} – плоский объект друга
 */
export function normalizeFriend(user) {
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    avatar: user.avatar,
    online: user.online,
    age: user.age,
    address: user.address,
    job: user.job,
    status: user.status,
    friendshipStatus: user.friendshipStatus || null,
    friendshipDirection: user.friendshipDirection || null,
    friendshipId: user.friendshipId || null,
  };
}
