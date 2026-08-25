const { Friend, User } = require('../../db/models');
const { Op } = require('sequelize');
const createError = require('../utils/createError');

const friendService = {
  /**
   * Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя
   *
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.page - номер страницы
   * @param {number} params.limit - количество на странице
   * @param {string} params.category - категория друзей
   * @param {string} [params.q] - поисковый запрос
   * @returns {Promise<Object>} { users, pagination }
   */
  async getUsersWithFriendshipStatus({
    currentUserId,
    page = 1,
    limit = 30,
    category = 'all',
    q = '',
  }) {
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
      attributes: [
        'id',
        'name',
        'nickname',
        'avatarUrl',
        'age',
        'address',
        'job',
        'status',
        'phone',
        'isPublic',
        'gender',
        'createdAt',
        'updatedAt',
      ],
      limit: limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });

    if (users.length === 0) {
      return {
        users: [],
        pagination: { total: 0, page, pages: 0 },
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
        friendshipStatus: info.status,
        friendshipDirection: info.direction,
        friendshipId: info.friendshipId,
      };
    });

    return {
      users: enrichedUsers,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
      },
    };
  },

  /**
   * Получить пользователя с информацией о статусе дружбы между двумя пользователями
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.targetUserId - ID пользователя, с которым проверяем статус дружбы
   * @returns {Promise<Object>} { user, friendshipStatus, friendshipDirection, friendshipId }
   */
  async getFriendshipStatus({ currentUserId, targetUserId }) {
    const isOwner = currentUserId === targetUserId;
    const targetUser = await User.findByPk(targetUserId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!targetUser) {
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    if (isOwner) {
      return {
        ...targetUser.toJSON(),
        friendshipStatus: null,
        friendshipDirection: null,
        friendshipId: null,
      };
    }

    // Проверка на дружбу с пользователем которого просматриваем
    let isFriend = false;
    let friendship = null;

    if (!isOwner) {
      friendship = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId: currentUserId, friendId: targetUserId },
            { userId: targetUserId, friendId: currentUserId },
          ],
        },
      });
    }

    isFriend = friendship?.status === 'accepted';

    // Проверяем, может ли текущий пользователь увидеть полный профиль целевого пользователя
    const canSeeFullProfile =
      isOwner || isFriend || targetUser.isPublic === true;

    // Выбираем атрибуты для возврата
    const attributesToReturn = canSeeFullProfile
      ? { exclude: ['passwordHash'] }
      : ['id', 'name', 'avatarUrl', 'isPublic', 'createdAt'];

    // Получаем пользователя с нужными атрибутами
    const user = await User.findByPk(targetUserId, {
      attributes: attributesToReturn,
    });

    // Если связи нет, возвращаем только профиль пользователя
    if (!friendship) {
      return {
        ...user.toJSON(),
        friendshipStatus: null,
        friendshipDirection: null,
        friendshipId: null,
      };
    }

    // Возвращаем профиль пользователя с информацией о дружбе
    return {
      ...user.toJSON(),
      friendshipStatus: friendship.status,
      friendshipDirection:
        friendship.userId === currentUserId ? 'outgoing' : 'incoming',
      friendshipId: friendship.id,
    };
  },

  /**
   * Отправить заявку в друзья
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.friendId - ID пользователя, которому отправляем заявку
   * @returns {Promise<Object>} { friendshipId, status, direction }
   */
  async sendRequest({ currentUserId, friendId }) {
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
      friendshipStatus: 'pending',
      friendshipDirection: 'outgoing',
    };
  },

  /**
   * Принять заявку в друзья
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.friendshipId - ID заявки
   * @returns {Promise<Object>} { friendshipId, status }
   */
  async acceptRequest({ currentUserId, friendshipId }) {
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
    return {
      friendshipId: friendship.id,
      friendshipStatus: 'accepted',
      friendshipDirection: 'incoming',
    };
  },

  /**
   * Отклонить/отменить заявку в друзья
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.friendshipId - ID заявки
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async rejectRequest({ currentUserId, friendshipId }) {
    const friendship = await Friend.findByPk(friendshipId);
    if (!friendship)
      throw createError('Заявка не найдена', 404, 'REQUEST_NOT_FOUND');

    // Отклонить/отменить заявку может только получатель или отправитель
    if (
      friendship.friendId !== currentUserId &&
      friendship.userId !== currentUserId
    ) {
      throw createError('Вы не можете удалить эту заявку', 403, 'FORBIDDEN');
    }

    await friendship.destroy();
    return { message: 'Заявка удалена', friendshipId };
  },

  /**
   * Удалить дружбу
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.friendshipId - ID дружбы
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async deleteFriendship({ currentUserId, friendshipId }) {
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
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.friendId - ID пользователя, которого блокируем
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async blockUser({ currentUserId, friendId }) {
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
