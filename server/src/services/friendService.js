const { Friend, User } = require('../../db/models');
const { Op } = require('sequelize');
const { createError } = require('../utils/createError');

const friendService = {
  /**
   * Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя.
   *
   * @param {Object} params
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} [params.page=1] - номер страницы
   * @param {number} [params.limit=30] - количество на странице
   * @param {string} [params.category='all'] - категория
   * @param {string} [params.q=''] - поисковый запрос
   * @returns {Promise<Object>} { users, pagination }
   */
  async getUsersWithFriendshipStatus({
    currentUserId,
    page = 1,
    limit = 30,
    category = 'all',
    q = '',
  } = {}) {
    // Формируем условие для поиска пользователей
    const where = { id: { [Op.ne]: currentUserId } };

    if (q && q.trim().length >= 2) {
      const searchTerm = `%${q.trim()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: searchTerm } },
        { nickname: { [Op.iLike]: searchTerm } },
      ];
    }

    // --- Фильтрация по категориям через подзапросы ---

    if (category === 'friends') {
      // Получаем список друзей
      const friendIds = await Friend.findAll({
        where: {
          [Op.or]: [
            { userId: currentUserId, status: 'accepted' },
            { friendId: currentUserId, status: 'accepted' },
          ],
        },
        attributes: ['userId', 'friendId'],
      });

      // Получаем список ID друзей
      const ids = friendIds.map((rel) =>
        rel.userId === currentUserId ? rel.friendId : rel.userId
      );

      // Добавляем ID друзей в условие
      where.id = { [Op.in]: ids };
    } else if (category === 'subscribers') {
      // Получаем список ID подписчиков
      const subscriberIds = await Friend.findAll({
        where: {
          friendId: currentUserId,
          status: 'pending',
        },
        attributes: ['userId'],
      });

      // Добавляем ID подписчиков в условие
      where.id = { [Op.in]: subscriberIds.map((rel) => rel.userId) };
    } else if (category === 'subscriptions') {
      // Получаем список ID подписок
      const subscriptionIds = await Friend.findAll({
        where: {
          userId: currentUserId,
          status: 'pending',
        },
        attributes: ['friendId'],
      });

      // Добавляем ID подписок в условие
      where.id = { [Op.in]: subscriptionIds.map((rel) => rel.friendId) };
    } else if (category === 'friendsOfFriends') {
      // Получаем список моих друзей
      const myFriends = await Friend.findAll({
        where: {
          [Op.or]: [
            { userId: currentUserId, status: 'accepted' },
            { friendId: currentUserId, status: 'accepted' },
          ],
        },
        attributes: ['userId', 'friendId'],
      });

      // Получаем список ID моих друзей
      const myFriendIds = myFriends.map((rel) =>
        rel.userId === currentUserId ? rel.friendId : rel.userId
      );

      // Если у меня нет друзей, возвращаем пустой список
      if (myFriendIds.length === 0) {
        return {
          users: [],
          pagination: {
            totalUsers: 0,
            totalPages: 0,
            currentPage: page,
            hasMore: false,
          },
        };
      }

      // Получаем связи моих друзей (кто дружит с моими друзьями)
      const friendsOfFriendsRelations = await Friend.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            { userId: { [Op.in]: myFriendIds } },
            { friendId: { [Op.in]: myFriendIds } },
          ],
        },
        attributes: ['userId', 'friendId'],
      });

      // Получаем список ID друзей друзей
      const friendsOfFriendsIds = new Set();

      // Добавляем ID друзей друзей в условие
      friendsOfFriendsRelations.forEach((rel) => {
        const otherId = myFriendIds.includes(rel.userId)
          ? rel.friendId
          : rel.userId;

        if (otherId !== currentUserId && !myFriendIds.includes(otherId)) {
          friendsOfFriendsIds.add(otherId);
        }
      });

      // Если у меня нет друзей друзей, возвращаем пустой список
      if (friendsOfFriendsIds.size === 0) {
        return {
          users: [],
          pagination: {
            totalUsers: 0,
            totalPages: 0,
            currentPage: page,
            hasMore: false,
          },
        };
      }

      // Добавляем ID друзей друзей в условие
      where.id = { [Op.in]: [...friendsOfFriendsIds] };
    }

    // Получить пользователей только для текущей страницы
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: [
        'id',
        'name',
        'nickname',
        'avatarUrl',
        'birthDate',
        'address',
        'job',
        'status',
      ],
      limit: limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });

    // Если пользователей нет, возвращаем пустой список
    if (users.length === 0) {
      return {
        users: [],
        pagination: {
          totalUsers: 0,
          totalPages: 0,
          currentPage: page,
          hasMore: false,
        },
      };
    }

    // Получаем список ID пользователей
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

    // Строим карту для быстрого доступа к связям
    const friendshipMap = new Map();
    relations.forEach((rel) => {
      const otherId = rel.userId === currentUserId ? rel.friendId : rel.userId;
      const direction = rel.userId === currentUserId ? 'outgoing' : 'incoming';

      // Приоритет статусу 'accepted', если вдруг есть дубликаты
      const existing = friendshipMap.get(otherId);
      if (!existing || rel.status === 'accepted') {
        friendshipMap.set(otherId, {
          status: rel.status,
          direction,
          friendshipId: rel.id,
        });
      }
    });

    // Обогащаем пользователей данными о дружбе и статусе дружбы
    const enrichedUsers = users.map((user) => {
      const info = friendshipMap.get(user.id) || {};
      return {
        ...user.toJSON(),
        friendshipStatus: info.status,
        friendshipDirection: info.direction,
        friendshipId: info.friendshipId,
        isBlocked: info.status === 'blocked' && info.direction === 'outgoing',
      };
    });

    // Возвращаем пользователей с данными о статусе дружбы
    return {
      users: enrichedUsers,
      pagination: {
        totalUsers: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
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
    // Если пользователь пытается добавить себя в друзья, выбрасываем ошибку
    if (currentUserId === friendId) {
      throw createError(
        'Нельзя добавить себя в друзья',
        400,
        'SELF_FRIEND_REQUEST'
      );
    }

    // Получаем пользователя, которому отправляем заявку
    const friend = await User.findByPk(friendId, { attributes: ['id'] });
    if (!friend)
      throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');

    // Проверяем, существует ли уже связь между пользователями
    const existing = await Friend.findOne({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: friendId, friendId: currentUserId },
        ],
      },
    });

    // Если связь уже существует, выбрасываем ошибку
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

    // Создаем заявку в друзья
    const friendship = await Friend.create({
      userId: currentUserId,
      friendId,
      status: 'pending',
    });

    // Возвращаем заявку в друзья
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
    // Получаем заявку в друзья
    const friendship = await Friend.findByPk(friendshipId);
    // Если заявки не найдена, выбрасываем ошибку
    if (!friendship)
      throw createError('Заявка не найдена', 404, 'REQUEST_NOT_FOUND');

    // Принять может только получатель (friendId)
    if (friendship.friendId !== currentUserId) {
      throw createError('Вы не можете принять эту заявку', 403, 'FORBIDDEN');
    }

    // Если заявка уже принята, выбрасываем ошибку
    if (friendship.status === 'accepted') {
      throw createError('Заявка уже принята', 400, 'ALREADY_ACCEPTED');
    }

    // Обновляем статус заявки в друзья
    await friendship.update({ status: 'accepted' });
    // Возвращаем заявку в друзья
    return {
      friendshipId: friendship.id,
      friendshipStatus: 'accepted',
      friendshipDirection: 'incoming',
    };
  },

  /**
   * Удалить из друзей, разблокировать, отменить заявку на дружбу
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.friendshipId - ID заявки
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async rejectRequest({ currentUserId, friendshipId }) {
    // Получаем заявку в друзья
    const friendship = await Friend.findByPk(friendshipId);
    // Если заявки не найдена, выбрасываем ошибку
    if (!friendship)
      throw createError('Запись не найдена', 404, 'REQUEST_NOT_FOUND');

    // Удаляем заявку в друзья
    await friendship.destroy();
    // Возвращаем сообщение о успешном удалении заявки
    return { message: `Запись успешно удалена: ${friendshipId}` };
  },

  /**
   * Заблокировать пользователя
   * @param {Object} params - параметры запроса
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.friendId - ID пользователя, которого блокируем
   * @returns {Promise<Object>} { message, friendshipId }
   */
  async blockUser({ currentUserId, friendId }) {
    // Если пользователь пытается заблокировать себя, выбрасываем ошибку
    if (currentUserId === friendId) {
      throw createError('Нельзя заблокировать себя', 400, 'SELF_BLOCK');
    }

    // Создаем запись где userId  - блокирующий, friendId - блокируемый
    const [friendship, created] = await Friend.findOrCreate({
      where: {
        [Op.or]: [
          { userId: currentUserId, friendId },
          { userId: currentUserId, friendId: friendId },
        ],
      },
      defaults: {
        userId: currentUserId,
        friendId: friendId,
        status: 'blocked',
      },
    });

    // Если запись уже существовала, обновляем её
    if (!created) {
      await friendship.update({
        userId: currentUserId,
        friendId: friendId,
        status: 'blocked',
      });
    }

    // Возвращаем запись о блокировке
    return {
      friendshipId: friendship.id,
      friendshipStatus: 'blocked',
      friendshipDirection: 'outgoing',
    };
  },
};

module.exports = friendService;
