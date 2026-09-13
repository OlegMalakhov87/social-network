const messageService = require('../services/messageService');
const { notifyUser } = require('../websocket');

const messageController = {
  /**
   * Получить список диалогов
   */
  getDialogs: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const { page, limit, q } = req.query;
      const result = await messageService.getDialogs(
        parseInt(currentUserId),
        parseInt(page),
        parseInt(limit),
        q
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить переписку с конкретным пользователем
   */
  getConversation: async (req, res, next) => {
    try {
      const { partnerId } = req.params;
      const { page, limit } = req.query;
      const currentUserId = req.user?.id;
      const result = await messageService.getConversation({
        currentUserId: parseInt(currentUserId),
        partnerId: parseInt(partnerId),
        page: parseInt(page),
        limit: parseInt(limit),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить сообщение по ID
   */
  getMessageById: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const currentUserId = req.user?.id;
      const result = await messageService.getMessageById(
        parseInt(messageId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отправить сообщение
   */
  sendMessage: async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const currentUserId = req.user?.id;
      const result = await messageService.sendMessage(
        parseInt(currentUserId),
        parseInt(receiverId),
        content
      );

      res.status(201).json(result);

      notifyUser(parseInt(receiverId), {
        type: 'new_message',
        data: result.message,
      }).catch((err) =>
        console.error('Ошибка отправки сообщения пользователю:', err)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить сообщение
   */
  updateMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const currentUserId = req.user?.id;
      const result = await messageService.updateMessage(
        parseInt(currentUserId),
        parseInt(messageId),
        content
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отметить сообщения как прочитанные
   */
  markAsRead: async (req, res, next) => {
    try {
      const { messageIds } = req.body;
      const currentUserId = req.user?.id;
      const result = await messageService.markAsRead(
        parseInt(currentUserId),
        messageIds
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Скрыть сообщение (удаляет сообщение только у текущего пользователя)
   */
  hideMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const currentUserId = req.user?.id;
      const result = await messageService.hideMessage(
        parseInt(currentUserId),
        parseInt(messageId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Очистить чат
   */
  clearChat: async (req, res, next) => {
    try {
      const { receiverId } = req.params;
      const currentUserId = req.user?.id;
      const result = await messageService.clearChat(
        parseInt(currentUserId),
        parseInt(receiverId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = messageController;
