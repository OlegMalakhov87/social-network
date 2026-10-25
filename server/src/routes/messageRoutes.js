const { Router } = require('express');

const {
  validateCreateMessage,
} = require('../middleware/validation/validateCreateMessage');
const {
  validateUpdateMessage,
} = require('../middleware/validation/validateUpdateMessage');
const messageController = require('../controllers/messageController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');

const messageRoutes = Router();

// Возвращает список диалогов.
messageRoutes.get('/dialogs', authMiddleware, messageController.getDialogs);

// Возвращает переписку с выбранным собеседником.
messageRoutes.get(
  '/conversation/:partnerId',
  validateIdParam('partnerId'),
  authMiddleware,
  messageController.getConversation
);

// Возвращает сообщение по идентификатору для кнопки «Поделиться».
messageRoutes.get(
  '/:messageId/shared',
  validateIdParam('messageId'),
  authMiddleware,
  messageController.getMessageById
);

// Отправляет сообщение собеседнику.
messageRoutes.post(
  '/send',
  validateCreateMessage,
  authMiddleware,
  messageController.sendMessage
);

// Обновляет сообщение владельца.
messageRoutes.patch(
  '/:messageId/edit',
  validateIdParam('messageId'),
  authMiddleware,
  validateUpdateMessage,
  messageController.updateMessage
);

// Отмечает сообщения как прочитанные.
messageRoutes.patch('/read', authMiddleware, messageController.markAsRead);

// Скрывает сообщение у текущего пользователя.
messageRoutes.patch(
  '/:messageId/hide',
  validateIdParam('messageId'),
  authMiddleware,
  messageController.hideMessage
);

// Очищает переписку с пользователем у текущего пользователя.
messageRoutes.patch(
  '/clear/:receiverId',
  validateIdParam('receiverId'),
  authMiddleware,
  messageController.clearChat
);

module.exports = messageRoutes;
