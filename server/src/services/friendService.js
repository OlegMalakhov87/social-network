const { Friend, User } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('./authService');

// Вспомогательная функция для получения данных "друга" (того, кто не является currentUserId)
const getOtherUser = (friendship, currentUserId) => {
  return friendship.userId === currentUserId
    ? friendship.friend
    : friendship.user;
};

const friendService = {
  /**
   * Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} page - номер страницы
   * @param {number} limit - количество на странице
   * @param {string} q - поисковый запрос
   * @returns {Promise<Object>} { users, pagination }
   */
  async getUsersWithFriendshipStatus(
    currentUserId,
    page = 1,
    limit = 30,
    q = ''
  ) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { id: { [Op.ne]: currentUserId } };

    if (q && q.trim().length >= 2) {
      const searchTerm = `%${q.trim()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: searchTerm } },
        { nickname: { [Op.iLike]: searchTerm } },
      ];
    }

    // Получить пользователей только для текущей страницы
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'nickname', 'avatar', 'isPublic'],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    if (users.length === 0) {
      return {
        users: [],
        pagination: { total: 0, page: parseInt(page), pages: 0 },
      };
    }

    // Запрашиваем связи ТОЛЬКО для пользователей на этой странице
    const userIds = users.map((u) => u.id);
    const relations = await Friend.findAll({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId: { [Op.in]: userIds } },
          { friendId: currentUserId, userId: { [Op.in]: userIds } },
        ],
      },
      attributes: ['id', 'userId', 'friendId', 'status'],
    });

    // Строим карту для быстрого доступа
    const friendshipMap = new Map();
    relations.forEach((rel) => {
      const otherId = rel.userId === currentUserId ? rel.friendId : rel.userId;
      const direction = rel.userId === currentUserId ? 'outgoing' : 'incoming';

      // Приоритет статусу 'accepted', если вдруг есть дубли
      const existing = friendshipMap.get(otherId);
      if (!existing || rel.status === 'accepted') {
        friendshipMap.set(otherId, {
          status: rel.status,
          direction,
          friendshipId: rel.id,
        });
      }
    });

    // Обогащаем пользователей данными о дружбе
    const enrichedUsers = users.map((user) => {
      const info = friendshipMap.get(user.id) || {};
      return {
        ...user.toJSON(),
        friendshipStatus: info.status || null,
        friendshipDirection: info.direction || null,
        friendshipId: info.friendshipId || null,
      };
    });

    return {
      users: enrichedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
      },
    };
  },

  /**
   * Получить статус дружбы между двумя пользователями
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} targetUserId - ID пользователя, с которым проверяем статус дружбы
   * @returns {Promise<Object>} { status, direction, friendshipId }
   */
  async getFriendshipStatus(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
      return { status: null, direction: null, friendshipId: null };
    }

    const friendship = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId: targetUserId },
          { userId: targetUserId, friendId: currentUserId },
        ],
      },
    });

    if (!friendship) {
      return { status: null, direction: null, friendshipId: null };
    }

    return {
      status: friendship.status,
      direction: friendship.userId === currentUserId ? 'outgoing' : 'incoming',
      friendshipId: friendship.id,
    };
  },

  /**
   * Отправить заявку в друзья
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} friendId - ID пользователя, которому отправляем заявку
   * @returns {Promise<Object>} { friendshipId, status, direction }
   */
  async sendRequest(currentUserId, friendId) {
    if (currentUserId === friendId) {
      throw createError(
        'Нельзя добавить себя в друзья',
        400,
        'SELF_FRIEND_REQUEST'
      );
    }

    const friend = await User.findByPk(friendId, { attributes: ['id'] });
    if (!friend)
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');

    const existing = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId },
        ],
      },
    });

    if (existing) {
      const messages = {
        pending:
          existing.userId === currentUserId
            ? 'Заявка уже отправлена'
            : 'У вас есть входящая заявка от этого пользователя',
        accepted: 'Вы уже друзья',
        blocked: 'Пользователь заблокирован',
      };
      throw createError(
        messages[existing.status] || 'Связь уже существует',
        400,
        'RELATIONSHIP_EXISTS'
      );
    }

    const friendship = await Friend.create({
      userId: currentUserId,
      friendId,
      status: 'pending',
    });

    return {
      friendshipId: friendship.id,
      status: 'pending',
      direction: 'outgoing',
    };
  },

  /**
   * Принять заявку в друзья
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} friendshipId - ID заявки
   * @returns {Promise<Object>} { friendshipId, status }
   */
  async acceptRequest(currentUserId, friendshipId) {
    const friendship = await Friend.findByPk(friendshipId);
    if (!friendship)
      throw createError('Заявка не найдена', 404, 'REQUEST_NOT_FOUND');

    // Принять может только получатель (friendId)
    if (friendship.friendId !== currentUserId) {
      throw createError('Вы не можете принять эту заявку', 403, 'FORBIDDEN');
    }

    if (friendship.status === 'accepted') {
      throw createError('Заявка уже принята', 400, 'ALREADY_ACCEPTED');
    }

    await friendship.update({ status: 'accepted' });
    return { friendshipId: friendship.id, status: 'accepted' };
  },

  /**
   * Отклонить заявку в друзья
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} friendshipId - ID заявки
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async rejectRequest(currentUserId, friendshipId) {
    const friendship = await Friend.findByPk(friendshipId);
    if (!friendship)
      throw createError('Заявка не найдена', 404, 'REQUEST_NOT_FOUND');

    // Отклонить может только получатель (friendId)
    if (friendship.friendId !== currentUserId) {
      throw createError('Вы не можете отклонить эту заявку', 403, 'FORBIDDEN');
    }

    await friendship.destroy();
    return { message: 'Заявка отклонена', friendshipId };
  },

  /**
   * Удалить дружбу
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} friendshipId - ID дружбы
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async deleteFriendship(currentUserId, friendshipId) {
    const friendship = await Friend.findByPk(friendshipId);
    if (!friendship)
      throw createError('Запись не найдена', 404, 'RELATIONSHIP_NOT_FOUND');

    // Удалить может любой участник
    if (
      friendship.userId !== currentUserId &&
      friendship.friendId !== currentUserId
    ) {
      throw createError('Вы не можете удалить эту связь', 403, 'FORBIDDEN');
    }

    await friendship.destroy();
    return { message: 'Связь удалена', friendshipId };
  },

  /**
   * Заблокировать пользователя
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} friendId - ID пользователя, которого блокируем
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async blockUser(currentUserId, friendId) {
    if (currentUserId === friendId) {
      throw createError('Нельзя заблокировать себя', 400, 'SELF_BLOCK');
    }

    // Создаем запись где userId = блокирующий, friendId = заблокированный
    const [friendship, created] = await Friend.findOrCreate({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId },
        ],
      },
      defaults: {
        userId: currentUserId,
        friendId,
        status: 'blocked',
      },
    });

    // Если запись уже существовала, обновляем её
    if (!created) {
      await friendship.update({
        userId: currentUserId,
        friendId,
        status: 'blocked',
      });
    }

    return {
      message: 'Пользователь заблокирован',
      friendshipId: friendship.id,
    };
  },
};

module.exports = friendService;
