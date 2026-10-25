const messageService = require('../services/messageService');
const { notifyUser } = require('../websocket');

const messageController = {
  /**
   * Возвращает список диалогов.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getDialogs: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const { page, limit, q } = req.query;
      const result = await messageService.getDialogs({
        currentUserId,
        page: Number(page),
        limit: Number(limit),
        q: q || '',
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Возвращает переписку с выбранным пользователем.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getConversation: async (req, res, next) => {
    try {
      const { partnerId } = req.params;
      const { page, limit } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await messageService.getConversation({
        currentUserId,
        partnerId: Number(partnerId),
        page: Number(page),
        limit: Number(limit),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Возвращает сообщение по идентификатору.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getMessageById: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await messageService.getMessageById(
        Number(messageId),
        currentUserId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отправляет сообщение.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  sendMessage: async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const currentUserId = Number(req.user?.id);
      const result = await messageService.sendMessage(
        currentUserId,
        Number(receiverId),
        content
      );

      res.status(201).json(result);

      notifyUser(Number(receiverId), {
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
   * Обновляет сообщение.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updateMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const currentUserId = Number(req.user?.id);
      const result = await messageService.updateMessage(
        currentUserId,
        Number(messageId),
        content
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отмечает сообщения как прочитанные.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  markAsRead: async (req, res, next) => {
    try {
      const { messageIds } = req.body;
      const currentUserId = Number(req.user?.id);
      const result = await messageService.markAsRead(currentUserId, messageIds);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Скрывает сообщение у текущего пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  hideMessage: async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await messageService.hideMessage(
        currentUserId,
        Number(messageId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Очищает переписку у текущего пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  clearChat: async (req, res, next) => {
    try {
      const { receiverId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await messageService.clearChat(
        currentUserId,
        Number(receiverId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = messageController;
