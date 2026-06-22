const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');
const { validateMessage, validateIdParam } = require('../middleware/validationMiddleware');
const { checkMessageOwnership } = require('../middleware/ownershipMiddleware');

const messageRoutes = Router();

messageRoutes.get('/dialogs', authMiddleware, messageController.getDialogs);

messageRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  checkMessageOwnership,
  messageController.getAllMessagesByUserId
);

messageRoutes.get(
  '/conversation/:userId',
  validateIdParam('userId'),
  authMiddleware,
  messageController.getMessagesByUsers
);

messageRoutes.post('/', authMiddleware, validateMessage, messageController.createMessage);

messageRoutes.put('/read', authMiddleware, messageController.markMessageAsRead);

messageRoutes.put(
  '/:messageId',
  validateIdParam('messageId'),
  authMiddleware,
  checkMessageOwnership,
  messageController.updateMessage
);

messageRoutes.put(
  '/clear/:partnerId',
  validateIdParam('partnerId'),
  authMiddleware,
  messageController.clearChat
);

messageRoutes.delete(
  '/:messageId',
  validateIdParam('messageId'),
  authMiddleware,
  checkMessageOwnership,
  messageController.deleteMessage
);

module.exports = messageRoutes;
