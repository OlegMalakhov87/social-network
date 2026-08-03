const messageService = require('../services/messageService');
const { notifyUser } = require('../websocket');

const messageController = {
  /**
   * Получить список диалогов
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  getDialogs: async (req, res, next) => {
    try {
      const result = await messageService.getDialogs(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить переписку с конкретным пользователем
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  getConversation: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
      const result = await messageService.getConversation(
        req.user.id,
        parseInt(userId),
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отправить сообщение
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  sendMessage: async (req, res, next) => {
    try {
      const { userId, text } = req.body;
      const result = await messageService.sendMessage(
        req.user.id,
        parseInt(userId),
        text
      );

      res.status(201).json(result);

      notifyUser(parseInt(userId), {
        type: 'new_message',
        data: result.message,
      }).catch((err) => console.error('WS notify error:', err));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить сообщение
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  updateMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const result = await messageService.updateMessage(
        req.user.id,
        parseInt(messageId),
        content
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Скрыть сообщение
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  hideMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const result = await messageService.hideMessage(
        req.user.id,
        parseInt(messageId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отметить сообщения как прочитанные
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  markAsRead: async (req, res, next) => {
    try {
      const { messageIds } = req.body;
      const result = await messageService.markAsRead(req.user.id, messageIds);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Очистить чат
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  clearChat: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await messageService.clearChat(
        req.user.id,
        parseInt(userId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = messageController;
