const { Router } = require('express');
const {
  validateMessage,
} = require('../middleware/validation/messageValidation');
const messageController = require('../controllers/messageController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');

const messageRoutes = Router();

// Получить список диалогов
messageRoutes.get('/dialogs', authMiddleware, messageController.getDialogs);

// Получить переписку с выбранным собеседником
messageRoutes.get(
  '/conversation/:partnerId',
  validateIdParam('partnerId'),
  authMiddleware,
  messageController.getConversation
);

// Получить сообщение по ID (для кнопки "Поделиться")
messageRoutes.get(
  '/:messageId/shared',
  validateIdParam('messageId'),
  authMiddleware,
  messageController.getMessageById
);

// Отправить сообщение собеседнику
messageRoutes.post(
  '/send',
  validateMessage,
  authMiddleware,
  messageController.sendMessage
);

// Обновить сообщение (владелец сообщения)
messageRoutes.patch(
  '/:messageId/edit',
  validateIdParam('messageId'),
  authMiddleware,
  validateMessage,
  messageController.updateMessage
);

// Отметить сообщения как прочитанные
messageRoutes.patch('/read', authMiddleware, messageController.markAsRead);

// Скрыть сообщение (удалить у себя)
messageRoutes.patch(
  '/:messageId/hide',
  validateIdParam('messageId'),
  authMiddleware,
  messageController.hideMessage
);

// Очистить чат (удалить всю переписку с пользователем у себя)
messageRoutes.patch(
  '/clear/:receiverId',
  validateIdParam('receiverId'),
  authMiddleware,
  messageController.clearChat
);

module.exports = messageRoutes;
