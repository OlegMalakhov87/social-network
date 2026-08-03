const { Message, User } = require('../../db/models');
const { Op, QueryTypes } = require('sequelize');
const { createError } = require('./authService');
const { sequelize } = require('../../db/models');

/**
 * Сервис для работы с сообщениями
 * @module messageService
 */
const messageService = {
  /**
   * Получить список диалогов (ОПТИМИЗИРОВАННЫЙ RAW-ЗАПРОС)
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} { dialogs }
   */
  async getDialogs(currentUserId) {
    // Этот запрос находит ПОСЛЕДНЕЕ сообщение для каждого уникального собеседника
    // и сразу джойнит данные пользователя. Работает за миллисекунды даже при миллионах сообщений.
    const dialogs = await sequelize.query(
      `
      SELECT 
        m.id, m."senderId", m."receiverId", m.content, m."isRead", m."createdAt", m."updatedAt",
        u.id as "interlocutor.id", 
        u.name as "interlocutor.name", 
        u.nickname as "interlocutor.nickname", 
        u.avatar as "interlocutor.avatar"
      FROM (
        SELECT DISTINCT ON (
          CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END
        )
        id, "senderId", "receiverId", content, "isRead", "createdAt", "updatedAt"
        FROM "Messages"
        WHERE ("senderId" = :currentUserId AND "deletedBySender" = false)
           OR ("receiverId" = :currentUserId AND "deletedByReceiver" = false)
        ORDER BY 
          CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END,
          "createdAt" DESC
      ) as m
      JOIN "Users" u ON u.id = CASE WHEN m."senderId" = :currentUserId THEN m."receiverId" ELSE m."senderId" END
      ORDER BY m."createdAt" DESC
    `,
      {
        replacements: { currentUserId },
        type: QueryTypes.SELECT,
      }
    );

    // Отдельный быстрый запрос для подсчета непрочитанных (только для входящих)
    const unreadCounts = await Message.findAll({
      attributes: [
        'senderId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        receiverId: currentUserId,
        isRead: false,
        deletedByReceiver: false,
      },
      group: ['senderId'],
      raw: true,
    });

    const unreadMap = new Map(
      unreadCounts.map((u) => [u.senderId, parseInt(u.count)])
    );

    // Форматируем результат
    const formattedDialogs = dialogs.map((d) => {
      const isOwn = d.senderId === currentUserId;
      return {
        interlocutor: {
          id: d['interlocutor.id'],
          name: d['interlocutor.name'],
          nickname: d['interlocutor.nickname'],
          avatar: d['interlocutor.avatar'],
        },
        lastMessage: {
          id: d.id,
          content: d.content,
          date: d.createdAt,
          isRead: d.isRead,
          isOwn,
        },
        unreadCount: isOwn ? 0 : unreadMap.get(d.senderId) || 0,
      };
    });

    return { dialogs: formattedDialogs };
  },

  /**
   * Получить переписку с конкретным пользователем
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} partnerId - ID собеседника
   * @param {number} page - номер страницы
   * @param {number} limit - количество сообщений на странице
   * @returns {Promise<Object>} { messages, pagination }
   */
  async getConversation(currentUserId, partnerId, page = 1, limit = 50) {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { senderId: currentUserId, receiverId: partnerId },
              { senderId: partnerId, receiverId: currentUserId },
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
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return {
      messages,
      pagination: {
        totalMessages: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        hasMore: parseInt(page) * parseInt(limit) < count,
      },
    };
  },

  /**
   * Отправить сообщение
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} receiverId - ID собеседника
   * @param {string} text - текст сообщения
   * @returns {Promise<Object>} { message }
   */
  async sendMessage(currentUserId, receiverId, text) {
    if (currentUserId === receiverId) {
      throw createError(
        'Нельзя отправить сообщение самому себе',
        400,
        'SELF_MESSAGE'
      );
    }

    const receiver = await User.findByPk(receiverId, { attributes: ['id'] });
    if (!receiver) {
      throw createError('Получатель не найден', 404, 'USER_NOT_FOUND');
    }

    const newMessage = await Message.create({
      senderId: currentUserId,
      receiverId,
      content: text.trim(),
      isRead: false,
    });

    const messageWithUsers = await Message.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    return {
      message: messageWithUsers.toJSON(),
    };
  },

  // 4. Обновить сообщение
  async updateMessage(currentUserId, messageId, newText) {
    const msg = await Message.findByPk(messageId);
    if (!msg)
      throw createError('Сообщение не найдено', 404, 'MESSAGE_NOT_FOUND');

    if (msg.senderId !== currentUserId) {
      throw createError(
        'Вы не можете редактировать это сообщение',
        403,
        'FORBIDDEN'
      );
    }

    if (!newText || newText.trim().length === 0) {
      throw createError('Сообщение не может быть пустым', 400, 'EMPTY_MESSAGE');
    }

    const [, updatedRows] = await Message.update(
      {
        content: newText.trim(),
        isEdited: true,
        updatedAt: new Date(),
      },
      {
        where: { id: messageId },
        returning: true,
        plain: true,
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] },
        ],
      }
    );

    return {
      message: updatedRows.toJSON(),
    };
  },

  /**
   * Скрыть сообщение (Soft Delete для текущего пользователя)
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} messageId - ID сообщения
   * @returns {Promise<Object>} { success: boolean, messageId }
   */
  async hideMessage(currentUserId, messageId) {
    const msg = await Message.findByPk(messageId);
    if (!msg)
      throw createError('Сообщение не найдено', 404, 'MESSAGE_NOT_FOUND');

    const updateField =
      msg.senderId === currentUserId ? 'deletedBySender' : 'deletedByReceiver';

    await msg.update({ [updateField]: true });
    return { success: true, messageId };
  },

  /**
   * Отметить сообщения как прочитанные (ОПТИМИЗИРОВАННО)
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number[]} messageIds - массив ID сообщений
   * @returns {Promise<Object>} { success: boolean, updated: number }
   */
  async markAsRead(currentUserId, messageIds) {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw createError(
        'Не передан массив ID сообщений',
        400,
        'INVALID_PAYLOAD'
      );
    }

    const [updatedCount] = await Message.update(
      { isRead: true },
      {
        where: {
          id: { [Op.in]: messageIds },
          receiverId: currentUserId,
          isRead: false,
        },
      }
    );

    return { success: true, updated: updatedCount };
  },

  /**
   * Очистить чат (Скрыть всю переписку для текущего пользователя)
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} partnerId - ID собеседника
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  async clearChat(currentUserId, partnerId) {
    await Message.update(
      { deletedBySender: true },
      {
        where: {
          senderId: currentUserId,
          receiverId: partnerId,
          deletedBySender: false,
        },
      }
    );
    await Message.update(
      { deletedByReceiver: true },
      {
        where: {
          senderId: partnerId,
          receiverId: currentUserId,
          deletedByReceiver: false,
        },
      }
    );

    return { success: true, message: 'Чат очищен' };
  },
};

module.exports = messageService;
