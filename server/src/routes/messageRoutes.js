const { Router } = require('express');
const messageController = require('../controllers/messageController');
const { validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const messageRoutes = Router();

// Получить список диалогов
messageRoutes.get('/dialogs', authMiddleware, messageController.getDialogs);

// Получить переписку с конкретным пользователем
messageRoutes.get(
  '/conversation/:userId',
  validateIdParam('userId'),
  authMiddleware,
  messageController.getConversation
);

// Отправить сообщение
messageRoutes.post('/send', authMiddleware, messageController.sendMessage);

// Обновить сообщение
messageRoutes.put(
  '/:messageId/edit',
  validateIdParam('messageId'),
  authMiddleware,
  messageController.updateMessage
);

// Скрыть сообщение (удалить у себя)
messageRoutes.delete(
  '/:messageId/hide',
  validateIdParam('messageId'),
  authMiddleware,
  messageController.hideMessage
);

// Отметить сообщения как прочитанные
messageRoutes.put('/read', authMiddleware, messageController.markAsRead);

// Очистить чат (удалить всю переписку с пользователем у себя)
messageRoutes.put(
  '/clear/:userId',
  validateIdParam('userId'),
  authMiddleware,
  messageController.clearChat
);

module.exports = messageRoutes;
