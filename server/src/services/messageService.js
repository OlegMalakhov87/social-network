const { Message, User, Like } = require('../../db/models');
const { Op, QueryTypes } = require('sequelize');
const { createError } = require('../utils/createError');
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
        u.avatarUrl as "interlocutor.avatarUrl"
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
          avatarUrl: d['interlocutor.avatarUrl'],
        },
        lastMessage: {
          id: d.id,
          content: d.content,
          createdAt: d.createdAt,
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
   *
   * @param {Object} params
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.partnerId - ID собеседника
   * @param {number} params.page - номер страницы
   * @param {number} params.limit - количество сообщений на странице
   * @returns {Promise<Object>} { messages, pagination }
   */
  async getConversation({ currentUserId, partnerId, page = 1, limit = 50 }) {
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
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatarUrl'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    return {
      messages: messages.map((message) => ({
        ...message.toJSON(),
        likesCount: message.likes?.length,
        isLiked: message.likes?.some((like) => like.userId === currentUserId),
      })),
      pagination: {
        totalMessages: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasMore: page * limit < count,
      },
    };
  },

  /**
   * Получить сообщение по ID (для кнопки "Поделиться")
   *
   * @param {number} messageId - ID сообщения
   * @param {number} currentUserId - ID текущего пользователя
   * @returns {Promise<Object>} { message }
   */
  async getMessageById(messageId, currentUserId) {
    const message = await Message.findByPk(messageId, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Like, as: 'likes', attributes: ['id', 'userId'] },
      ],
    });
    if (!message) {
      throw createError('Сообщение не найдено', 404, 'MESSAGE_NOT_FOUND');
    }
    return {
      message: {
        ...message.toJSON(),
        likesCount: message.likes?.length,
        isLiked: message.likes?.some((like) => like.userId === currentUserId),
      },
    };
  },

  /**
   * Отправить сообщение
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} receiverId - ID собеседника
   * @param {string} content - контент сообщения
   * @returns {Promise<Object>} { message }
   */
  async sendMessage(currentUserId, receiverId, content) {
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
      content: content.trim(),
      isRead: false,
      isEdited: false,
      deletedBySender: false,
      deletedByReceiver: false,
    });

    const messageWithUsers = await Message.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatarUrl'],
        },
      ],
    });

    return {
      message: messageWithUsers.toJSON(),
    };
  },

  /**
   * Обновить сообщение
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} messageId - ID сообщения
   * @param {string} content - новый контент сообщения
   * @returns {Promise<Object>} { message }
   */
  async updateMessage(currentUserId, messageId, content) {
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

    const [, updatedRows] = await Message.update(
      {
        content: content.trim(),
        isEdited: true,
      },
      {
        where: { id: messageId },
        returning: true,
        plain: true,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'avatarUrl'],
          },
        ],
      }
    );

    return {
      message: updatedRows.toJSON(),
    };
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
   * Скрыть сообщение (для текущего пользователя)
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
