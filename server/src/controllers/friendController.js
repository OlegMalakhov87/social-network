const { Friend, User } = require('../../db/models');
const { Op } = require('sequelize');

const friendController = {
  //======================== GET запросы =============================

  // 1. Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя
  getUsersWithFriendshipStatus: async (req, res) => {
    try {
      const currentUserId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      // Все пользователи, кроме себя
      const { count, rows: users } = await User.findAndCountAll({
        where: { id: { [Op.ne]: currentUserId } },
        attributes: { exclude: ['passwordHash'] },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      // Все связи, где участвует текущий пользователь
      const allRelations = await Friend.findAll({
        where: {
          [Op.or]: [{ userId: currentUserId }, { friendId: currentUserId }],
        },
      });

      // Строим карту
      const friendshipMap = new Map();
      allRelations.forEach((rel) => {
        const isOutgoing = rel.userId === currentUserId;
        const otherUserId = isOutgoing ? rel.friendId : rel.userId;
        const direction = isOutgoing ? 'outgoing' : 'incoming';
        // Если уже есть запись, приоритетнее accepted
        const existing = friendshipMap.get(otherUserId);
        if (!existing || rel.status === 'accepted') {
          friendshipMap.set(otherUserId, {
            type: rel.status,
            direction,
            friendshipId: rel.id,
          });
        }
      });

      // Обогащаем каждого пользователя
      const enrichedUsers = users.map((user) => {
        const info = friendshipMap.get(user.id);
        return {
          ...user.toJSON(),
          friendshipStatus: info?.type || null,
          friendshipDirection: info?.direction || null,
          friendshipId: info?.friendshipId || null,
        };
      });

      res.json({
        users: enrichedUsers,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('GET /fiends/with-friendship-status error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Получение статуса дружбы с конкретным пользователем (для кнопки на профиле пользователя)
  getFriendshipStatus: async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const targetUserId = parseInt(req.params.userId);
      if (currentUserId === targetUserId) {
        return res.json({ status: null, direction: null, friendshipId: null });
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
        return res.json({ status: null, direction: null, friendshipId: null });
      }
      const isOutgoing = friendship.userId === currentUserId;
      res.json({
        status: friendship.status,
        direction: isOutgoing ? 'outgoing' : 'incoming',
        friendshipId: friendship.id,
      });
    } catch (error) {
      console.error('GET /friends/status/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Получить всех друзей пользователя (принятые заявки)
  getAllFriends: async (req, res) => {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: friends } = await Friend.findAndCountAll({
        where: {
          status: 'accepted',
          [Op.or]: [{ userId: userId }, { friendId: userId }],
        },
        include: [
          {
            model: User,
            as: 'users',
            attributes: { exclude: ['passwordHash'] },
          },
          {
            model: User,
            as: 'friends',
            attributes: { exclude: ['passwordHash'] },
          },
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      // Форматируем: определяем кто друг (не сам пользователь)
      const formattedFriends = friends.map((f) => {
        const isUserSender = f.userId == userId;
        const friendUser = isUserSender ? f.friends : f.users;
        const friendshipDirection = isUserSender ? 'outgoing' : 'incoming';

        return {
          friendshipId: f.id,
          friendId: friendUser.id,
          name: friendUser.name,
          nickname: friendUser.nickname,
          photoUrl: friendUser.photoUrl,
          status: friendUser.status,
          age: friendUser.age,
          job: friendUser.job,
          type: f.status,
          direction: friendshipDirection,
          createdAt: f.createdAt,
        };
      });

      res.json({
        friends: formattedFriends,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('GET /friends error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Получить друзей, друзей пользователя
  getFriendsOfFriends: async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      // Все мои друзья
      const myFriendships = await Friend.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [{ userId: currentUserId }, { friendId: currentUserId }],
        },
      });
      const myFriendIds = new Set();
      myFriendships.forEach((f) => {
        if (f.userId === currentUserId) myFriendIds.add(f.friendId);
        else myFriendIds.add(f.userId);
      });
      if (myFriendIds.size === 0) return res.json({ users: [], count: 0 });

      // Друзья моих друзей
      const fofLinks = await Friend.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            { userId: { [Op.in]: Array.from(myFriendIds) } },
            { friendId: { [Op.in]: Array.from(myFriendIds) } },
          ],
        },
      });
      const fofIds = new Set();
      fofLinks.forEach((link) => {
        if (!myFriendIds.has(link.userId) && link.userId !== currentUserId) fofIds.add(link.userId);
        if (!myFriendIds.has(link.friendId) && link.friendId !== currentUserId)
          fofIds.add(link.friendId);
      });

      // Исключаем тех, с кем уже есть связь
      const existing = await Friend.findAll({
        where: {
          [Op.or]: [
            { userId: currentUserId, friendId: { [Op.in]: Array.from(fofIds) } },
            { friendId: currentUserId, userId: { [Op.in]: Array.from(fofIds) } },
          ],
        },
      });
      const excludedIds = new Set(
        existing.map((rel) => (rel.userId === currentUserId ? rel.friendId : rel.userId))
      );
      const finalIds = Array.from(fofIds).filter((id) => !excludedIds.has(id));
      if (finalIds.length === 0) return res.json({ users: [], count: 0 });

      const { count, rows: users } = await User.findAndCountAll({
        where: { id: { [Op.in]: finalIds } },
        attributes: { exclude: ['passwordHash'] },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      const result = users.map((u) => ({ ...u.toJSON(), type: 'friend of friend' }));
      res.json({
        users: result,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('GET /friends/fof error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 5. Получить входящие заявки в друзья
  getIncomingRequests: async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: requests } = await Friend.findAndCountAll({
        where: {
          friendId: currentUserId,
          status: ['pending', 'blocked'],
        },
        include: [
          {
            model: User,
            as: 'users',
            attributes: { exclude: ['passwordHash'] },
          },
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        requests: requests.map((r) => ({
          requestId: r.id,
          user: r.users,
          type: r.status,
          createdAt: r.createdAt,
        })),
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('GET /friends/requests-incoming error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 6. Получить исходящие заявки в друзья
  getOutgoingRequests: async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: requests } = await Friend.findAndCountAll({
        where: {
          userId: currentUserId,
          status: ['pending', 'blocked'],
        },
        include: [
          {
            model: User,
            as: 'friends',
            attributes: { exclude: ['passwordHash'] },
          },
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        requests: requests.map((r) => ({
          requestId: r.id,
          friend: r.friends,
          type: r.status,
          createdAt: r.createdAt,
        })),
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('GET /friends/requests-outgoing error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  //======================== POST запросы =============================

  // 7. Отправить заявку в друзья
  createRequest: async (req, res) => {
    try {
      const { friendId } = req.body;
      const userId = req.user.id; // из токена

      if (!userId || !friendId) {
        return res.status(400).json({ error: 'ID пользователей обязательны' });
      }

      if (userId == friendId) {
        return res.status(400).json({ error: 'Нельзя добавить себя в друзья' });
      }

      // Проверяем существование пользователей
      const user = await User.findByPk(userId);
      const friend = await User.findByPk(friendId);
      if (!user || !friend) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Проверяем на существующую связь в любом направлении
      const existing = await Friend.findOne({
        where: {
          [Op.or]: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      if (existing) {
        const statusMsg = {
          pending: 'Заявка уже отправлена',
          accepted: 'Вы уже друзья',
          blocked: 'Пользователь заблокирован',
        };
        return res.status(400).json({
          error: statusMsg[existing.status] || 'Связь уже существует',
          status: existing.status,
        });
      }

      const friendRequest = await Friend.create({
        userId,
        friendId,
        status: 'pending',
      });

      const requestWithUsers = await Friend.findByPk(friendRequest.id, {
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'nickname'],
          },
          {
            model: User,
            as: 'friends',
            attributes: ['id', 'name', 'nickname'],
          },
        ],
      });

      res.status(201).json(requestWithUsers);
    } catch (error) {
      console.error('POST /friends error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Такая заявка уже существует' });
      }

      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 8. Заблокировать пользователя
  blockedUser: async (req, res) => {
    try {
      const { friendId } = req.body;
      const currentUserId = req.user.id; // из токена

      if (!currentUserId || !friendId) {
        return res.status(400).json({ error: 'ID пользователей обязательны' });
      }

      // Находим существующую запись или создаем новую
      const [friendship, created] = await Friend.findOrCreate({
        where: {
          [Op.or]: [
            { userId: currentUserId, friendId: friendId },
            { userId: friendId, friendId: currentUserId },
          ],
        },
        defaults: {
          userId: friendId,
          friendId: currentUserId,
          status: 'blocked',
        },
      });

      // Если запись существовала, обновляем статус
      if (!created) {
        await friendship.update({ userId: friendId, friendId: currentUserId, status: 'blocked' });
      }

      res.status(200).json({
        success: true,
        message: 'Пользователь заблокирован',
        friendship,
      });
    } catch (error) {
      console.error('POST /friends/block error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  //========================PUT запросы=============================

  // 9. Принять заявку в друзья
  updateRequest: async (req, res) => {
    try {
      const { friendshipId } = req.params;
      const currentUserId = req.user.id; // из токена

      const friendship = await Friend.findByPk(friendshipId);

      if (!friendship) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }

      // Только получатель заявки может принять
      if (friendship.friendId != currentUserId) {
        return res.status(403).json({ error: 'Вы не можете принять эту заявку' });
      }

      if (friendship.status === 'accepted') {
        return res.status(400).json({
          error: 'Заявка уже обработана',
          status: friendship.status,
        });
      }

      await friendship.update({ status: 'accepted' });

      const updatedFriendship = await Friend.findByPk(friendship.id, {
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'nickname'],
          },
          {
            model: User,
            as: 'friends',
            attributes: ['id', 'name', 'nickname'],
          },
        ],
      });

      res.json({
        success: true,
        message: 'Заявка принята',
        friendship: updatedFriendship,
      });
    } catch (error) {
      console.error('PUT /friends/:friendshipId/accept error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  //========================DELETE запросы=============================

  // 10. Отменить отправленную заявку
  deleteRequest: async (req, res) => {
    try {
      const { friendshipId } = req.params;
      const currentUserId = req.user.id; // из токена

      const friendship = await Friend.findByPk(friendshipId);

      if (!friendship) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }

      // Только отправитель может отменить
      if (friendship.userId != currentUserId) {
        return res.status(403).json({ error: 'Вы не можете отменить эту заявку' });
      }

      if (friendship.status !== 'pending') {
        return res.status(400).json({
          error: 'Заявка уже обработана',
        });
      }

      await friendship.destroy();

      res.json({
        success: true,
        message: 'Заявка отменена',
        friendshipId,
      });
    } catch (error) {
      console.error('DELETE /friends/:friendshipId/reject error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 11. Удалить из друзей/отменить заявку если пользователь заблокировал Вас (для обоих участников)
  deleteFriend: async (req, res) => {
    try {
      const { friendshipId } = req.params;
      const userId = req.user.id; // из токена

      const friendship = await Friend.findByPk(friendshipId);

      if (!friendship) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      // Может удалить только участник дружбы
      if (friendship.userId != userId && friendship.friendId != userId) {
        return res.status(403).json({ error: 'Вы не можете удалить эту дружбу' });
      }

      await friendship.destroy();

      res.json({
        success: true,
        message:
          friendship.status === 'accepted' ? 'Пользователь удален из друзей' : 'Заявка удалена',
        friendshipId,
      });
    } catch (error) {
      console.error('DELETE /friends/:friendshipId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = friendController;
