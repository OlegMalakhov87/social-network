/**
 * Преобразует сырой объект пользователя с сервера в формат для FriendCard.
 * @param {Object} user – один пользователь из ответа API
 * @returns {Object} – плоский объект друга
 */
export function normalizeFriend(user) {
  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    photoUrl: user.photoUrl,
    online: user.online,
    age: user.age,
    city: user.city,
    job: user.job,
    status: user.status,
    _friendshipStatus: user.type || null,
    _friendshipDirection: user._friendshipDirection || null,
    friendshipId: user.friendshipId || null,
  };
}
