const { Message, User, Like } = require('../../db/models');
const { Op, QueryTypes } = require('sequelize');
const { createError } = require('../utils/createError');
const { sequelize } = require('../../db/models');

/**
 * Сервис для работы с сообщениями.
 */
const messageService = {
  /**
   * Получить список диалогов
   * @param {Object} params
   * @param {number} params.currentUserId - ID текущего пользователя
   * @param {number} params.page - номер страницы
   * @param {number} params.limit - количество диалогов на странице
   * @param {string} params.q - поисковый запрос
   * @returns {Promise<Object>} { dialogs, pagination }
   */
  async getDialogs({ currentUserId, page = 1, limit = 30, q = '' }) {
    const offset = (page - 1) * limit;
    const search = `%${q}%`;

    const dialogs = await sequelize.query(
      `
      SELECT 
        m.id, m."senderId", m."receiverId", m.content, m."isRead", m."isEdited",
        m."deletedBySender", m."deletedByReceiver", m."createdAt", m."updatedAt",
        u.id as "interlocutor.id", 
        u.name as "interlocutor.name", 
        u."avatarUrl" as "interlocutor.avatarUrl"
      FROM (
        SELECT DISTINCT ON (
          CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END
        )
          id, "senderId", "receiverId", content, "isRead", "isEdited",
          "deletedBySender", "deletedByReceiver", "createdAt", "updatedAt"
        FROM "Messages"
        WHERE ("senderId" = :currentUserId AND "deletedBySender" = false)
           OR ("receiverId" = :currentUserId AND "deletedByReceiver" = false)
        ORDER BY 
          CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END,
          "createdAt" DESC
      ) as m
      JOIN "Users" u ON u.id = CASE WHEN m."senderId" = :currentUserId THEN m."receiverId" ELSE m."senderId" END
      WHERE (:q = '' OR u.name ILIKE :search OR u.nickname ILIKE :search)
      ORDER BY m."createdAt" DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { currentUserId, q, search, limit, offset },
        type: QueryTypes.SELECT,
      }
    );

    const [{ count }] = await sequelize.query(
      `
      SELECT COUNT(*) FROM (
        SELECT DISTINCT ON (
          CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END
        )
          id,
          CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END as "otherId"
        FROM "Messages"
        WHERE ("senderId" = :currentUserId AND "deletedBySender" = false)
           OR ("receiverId" = :currentUserId AND "deletedByReceiver" = false)
        ORDER BY 
          CASE WHEN "senderId" = :currentUserId THEN "receiverId" ELSE "senderId" END,
          "createdAt" DESC
      ) as d
      JOIN "Users" u ON u.id = d."otherId"
      WHERE (:q = '' OR u.name ILIKE :search OR u.nickname ILIKE :search)
      `,
      {
        replacements: { currentUserId, q, search },
        type: QueryTypes.SELECT,
      }
    );

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
      unreadCounts.map((u) => [u.senderId, parseInt(u.count, 10)])
    );

    const formattedDialogs = dialogs.map((d) => {
      const isOwn = d.senderId === currentUserId;
      const interlocutorId = isOwn ? d.receiverId : d.senderId;

      return {
        user: {
          id: d['interlocutor.id'],
          name: d['interlocutor.name'],
          avatarUrl: d['interlocutor.avatarUrl'],
        },
        lastMessage: {
          id: d.id,
          content: d.content,
          createdAt: d.createdAt,
          isRead: d.isRead,
          isOwn,
        },
        unreadCount: isOwn ? 0 : unreadMap.get(interlocutorId) || 0,
      };
    });

    const totalDialogs = parseInt(count, 10);

    return {
      dialogs: formattedDialogs,
      pagination: {
        totalDialogs,
        totalPages: Math.ceil(totalDialogs / limit),
        currentPage: page,
        hasMore: page * limit < totalDialogs,
      },
    };
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
  async getConversation({ currentUserId, partnerId, page = 1, limit = 30 }) {
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
   * Отметить сообщения как прочитанные
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number[]} messageIds - массив ID сообщений
   * @returns {Promise<Object>} { message }
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

    return {
      message: `Сообщения успешно прочитаны: ${updatedCount}`,
    };
  },

  /**
   * Скрыть сообщение (для текущего пользователя)
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} messageId - ID сообщения
   * @returns {Promise<Object>} { message }
   */
  async hideMessage(currentUserId, messageId) {
    const msg = await Message.findByPk(messageId);
    if (!msg)
      throw createError('Сообщение не найдено', 404, 'MESSAGE_NOT_FOUND');

    const updateField =
      msg.senderId === currentUserId ? 'deletedBySender' : 'deletedByReceiver';

    await msg.update({ [updateField]: true });
    return { message: `Сообщение успешно скрыто: ${messageId}` };
  },

  /**
   * Очистить чат (Скрыть всю переписку для текущего пользователя)
   * @param {number} currentUserId - ID текущего пользователя
   * @param {number} partnerId - ID собеседника
   * @returns {Promise<Object>} { message }
   */
  async clearChat(currentUserId, partnerId) {
    await sequelize.transaction(async (transaction) => {
      await Message.update(
        { deletedBySender: true },
        {
          where: {
            senderId: currentUserId,
            receiverId: partnerId,
            deletedBySender: false,
          },
          transaction,
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
          transaction,
        }
      );
    });

    return { message: 'Чат успешно очищен' };
  },

  /**
   * Очищает удаленные сообщения
   * @returns {Promise<number>} - Количество удаленных сообщений
   */
  async cleanupDeletedMessages() {
    return sequelize.transaction(async (transaction) => {
      const messagesToDelete = await Message.findAll({
        where: {
          deletedBySender: true,
          deletedByReceiver: true,
        },
        attributes: ['id'],
        transaction,
      });

      if (messagesToDelete.length === 0) {
        console.log('[MessageService] Нет сообщений для удаления');
        return 0;
      }

      const messageIds = messagesToDelete.map((msg) => msg.id);

      const likesDeleted = await Like.destroy({
        where: {
          targetType: 'Message',
          targetId: { [Op.in]: messageIds },
        },
        transaction,
      });

      const deletedCount = await Message.destroy({
        where: {
          id: { [Op.in]: messageIds },
        },
        transaction,
      });

      console.log('[MessageService] Удалено лайков:', likesDeleted);
      console.log('[MessageService] Удалено сообщений:', deletedCount);

      return deletedCount;
    });
  },
};

module.exports = messageService;
