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
    photoUrl: user.photoUrl,
    online: user.online,
    age: user.age,
    city: user.address,
    job: user.job,
    status: user.status,
    friendshipStatus: user.type || null,
    friendshipDirection: user._friendshipDirection || null,
    friendshipId: user.friendshipId || null,
  };
}
