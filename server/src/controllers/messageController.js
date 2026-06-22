const { Message, User } = require('../../db/models');
const { Op } = require('sequelize');
const { notifyUser } = require('../websocket');

const messageController = {
  // ==================== GET запросы ====================

  // 1. Получить список диалогов пользователя
  getDialogs: async (req, res) => {
    try {
      const currentUserId = req.user.id;
      // Все сообщения, где участвует текущий пользователь
      const messages = await Message.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [{ senderId: currentUserId }, { receiverId: currentUserId }],
            },
            {
              [Op.not]: [
                {
                  [Op.or]: [
                    { senderId: currentUserId, deletedBySender: true },
                    { receiverId: currentUserId, deletedByReceiver: true },
                  ],
                },
              ],
            },
          ],
        },

        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'photoUrl'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Группируем по собеседнику, берём последнее сообщение
      const dialogsMap = new Map();

      messages.forEach((msg) => {
        const isOutgoing = msg.senderId === currentUserId;
        const interlocutor = isOutgoing ? msg.receiver : msg.sender;
        const interlocutorId = interlocutor.id;

        if (!dialogsMap.has(interlocutorId)) {
          dialogsMap.set(interlocutorId, {
            user: {
              id: interlocutor.id,
              name: interlocutor.name,
              nickname: interlocutor.nickname,
              photoUrl: interlocutor.photoUrl,
            },
            lastMessage: {
              id: msg.id,
              text: msg.message,
              date: msg.createdAt,
              isRead: msg.isRead,
              isOwn: isOutgoing,
            },
            unreadCount: 0,
          });
        }

        // Считаем непрочитанные входящие
        if (!isOutgoing && !msg.isRead) {
          dialogsMap.get(interlocutorId).unreadCount += 1;
        }
      });

      const dialogs = Array.from(dialogsMap.values());

      res.json({ dialogs });
    } catch (error) {
      console.error('GET /dialogs error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Получить все сообщения пользователя (отправленные и полученные)
  getAllMessagesByUserId: async (req, res) => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const offset = (page - 1) * limit;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const { count, rows: messages } = await Message.findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { senderId: userId, receiverId: currentUserId },
                { senderId: currentUserId, receiverId: userId },
              ],
            },
            {
              [Op.not]: [
                {
                  [Op.or]: [
                    { senderId: currentUserId, deletedBySender: true },
                    { receiverId: currentUserId, deletedByReceiver: true },
                  ],
                },
              ],
            },
          ],
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'photoUrl'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });
      if (!messages || messages.length === 0)
        return res.status(404).json({ message: 'Сообщений нет' });
      res.json({
        messages,
        pagination: {
          totalMessages: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /messages/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Получить диалог между двумя пользователями
  getMessagesByUsers: async (req, res) => {
    try {
      const { userId: partnerId } = req.params;
      const currentUserId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const offset = (page - 1) * limit;

      const sender = await User.findByPk(partnerId);
      const receiver = await User.findByPk(currentUserId);
      if (!sender || !receiver) {
        return res.status(404).json({ message: 'Один из пользователей не найден' });
      }

      const { count, rows: messages } = await Message.findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { senderId: partnerId, receiverId: currentUserId },
                { senderId: currentUserId, receiverId: partnerId },
              ],
            },
            {
              [Op.not]: [
                {
                  [Op.or]: [
                    { senderId: currentUserId, deletedBySender: true },
                    { receiverId: currentUserId, deletedByReceiver: true },
                  ],
                },
              ],
            },
          ],
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'photoUrl'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'name', 'photoUrl'],
          },
        ],
        order: [['createdAt', 'ASC']],
        limit,
        offset,
        distinct: true,
      });

      if (!messages || messages.length === 0)
        return res.status(404).json({ message: 'Сообщений нет' });
      res.json({
        messages,
        participants: {
          user1: partnerId,
          user2: currentUserId,
        },
        pagination: {
          totalMessages: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /messages/conversation/:id error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== POST запросы ====================

  // 3. Отправить сообщение
  createMessage: async (req, res) => {
    try {
      const { receiverId, message } = req.body;
      const senderId = req.user.id; // из токена

      if (!senderId || !receiverId) {
        return res.status(400).json({ error: 'Отправитель и получатель обязательны' });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Сообщение не может быть пустым' });
      }

      if (senderId === receiverId) {
        return res.status(400).json({ error: 'Нельзя отправить сообщение самому себе' });
      }

      const newMessage = await Message.create({
        senderId,
        receiverId,
        message: message.trim(),
        isRead: false,
      });

      const messageWithUsers = await Message.findByPk(newMessage.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'name'],
          },
        ],
      });

      res.status(201).json(messageWithUsers);
      notifyUser(receiverId, {
        type: 'new message',
        message: {
          id: newMessage.id,
          senderId,
          receiverId,
          text: message.trim(),
          createdAt: newMessage.createdAt,
          isRead: false,
        },
      });
    } catch (error) {
      console.error('POST /message error:', error);

      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'Пользователь не существует' });
      }

      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== PUT запросы ====================

  // 4. Обновить сообщение (только текст)
  updateMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const { message } = req.body;
      const senderId = req.user.id; // из токена

      const msg = await Message.findByPk(messageId);

      if (!msg) {
        return res.status(404).json({ error: 'Сообщение не найдено' });
      }

      // Проверка отправителя (временно из тела)
      if (msg.senderId !== parseInt(senderId)) {
        return res.status(403).json({ error: 'Вы не можете редактировать это сообщение' });
      }

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Сообщение не может быть пустым' });
      }

      await msg.update({
        message: message.trim(),
        updatedAt: new Date().toISOString(),
        isEdited: true,
      });

      const updatedMessage = await Message.findByPk(messageId, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name'],
          },
        ],
      });

      res.json(updatedMessage);
    } catch (error) {
      console.error('PUT /messages/:messageId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 5. Пометить сообщение как прочитанное
  markMessageAsRead: async (req, res) => {
    try {
      const { messageIds } = req.body;
      const currentUserId = req.user.id; // из токена

      // Проверка, что передан массив и он не пуст
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ error: 'Нет массива сообщений' });
      }

      // Находим все сообщения, которые принадлежат текущему пользователю и не прочитаны
      const messages = await Message.findAll({
        where: {
          id: messageIds,
          receiverId: currentUserId,
          isRead: false,
        },
      });

      if (messages.length === 0) {
        return res.json({
          success: true,
          updated: 0,
          message: 'Нет сообщений для отметки, все сообщения прочитаны',
        });
      }

      // Обновляем все найденные сообщения
      await Message.update({ isRead: true }, { where: { id: messages.map((m) => m.id) } });

      res.json({ success: true, updated: messages.length, messageIds: messages.map((m) => m.id) });
    } catch (error) {
      console.error('PUT /messages/read error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 6. Очистить чат (скрывает чат от текущего пользователя)
  clearChat: async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { partnerId } = req.params;

      // Обновляем все сообщения между currentUserId и partnerId,
      // помечая их как удалённые для текущего пользователя
      await Message.update(
        { deletedBySender: true },
        { where: { senderId: currentUserId, receiverId: partnerId, deletedBySender: false } }
      );
      await Message.update(
        { deletedByReceiver: true },
        { where: { senderId: partnerId, receiverId: currentUserId, deletedByReceiver: false } }
      );

      res.json({ success: true, message: 'Чат очищен' });
    } catch (error) {
      console.error('PUT /messages/clear/:partnerId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== DELETE запросы ====================

  // 7. Удалить сообщение (скрывает сообщения от текущего пользователя)
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.id; // из токена

      const msg = await Message.findByPk(messageId);

      if (!msg) {
        return res.status(404).json({ error: 'Сообщение не найдено' });
      }

      // Может удалить только отправитель или получатель
      if (msg.senderId === parseInt(userId)) {
        msg.deletedBySender = true;
      } else if (msg.receiverId === parseInt(userId)) {
        msg.deletedByReceiver = true;
      } else {
        return res.status(403).json({ error: 'Вы не можете удалить это сообщение' });
      }

      await msg.save();

      res.json({
        success: true,
        message: 'Сообщение удалено',
        messageId: messageId,
      });
    } catch (error) {
      console.error('DELETE /messages/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = messageController;
