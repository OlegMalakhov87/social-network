const { Router } = require('express');
const friendController = require('../controllers/friendController');
const { validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const friendRoutes = Router();

// Получить список пользователей со статусом дружбы
friendRoutes.get(
  '/with-friendship-status',
  authMiddleware,
  friendController.getUsersWithFriendshipStatus
);

// Отправить заявку в друзья
friendRoutes.post('/requests', authMiddleware, friendController.sendRequest);

// Принять заявку
friendRoutes.put(
  '/:friendshipId/accept',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.acceptRequest
);

// Отклонить/отменить заявку
friendRoutes.delete(
  '/:friendshipId/reject',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.rejectRequest
);

// Удалить из друзей (любое направление)
friendRoutes.delete(
  '/:friendshipId/delete',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.deleteFriendship
);

// Заблокировать пользователя
friendRoutes.post('/block', authMiddleware, friendController.blockUser);

module.exports = friendRoutes;
