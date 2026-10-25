/**
 * Приводит пользователя с сервера к формату карточки друга.
 *
 * @param {Object} user - Пользователь с сервера
 * @returns {Object} Друг карточки
 */
export function normalizeFriends(user) {
  if (!user || typeof user !== 'object') return user;

  return {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    online: user.online,
    birthDate: user.birthDate,
    address: user.address,
    job: user.job,
    status: user.status,
    isPublic: user.isPublic ?? false,
    gender: user.gender,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    friendshipStatus: user.friendshipStatus || null,
    friendshipDirection: user.friendshipDirection || null,
    friendshipId: user.friendshipId || null,
    isBlocked: user.isBlocked || false,
  };
}
