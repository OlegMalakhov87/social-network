const { Router } = require('express');

const friendController = require('../controllers/friendController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');

const friendRoutes = Router();

// Возвращает пользователей со статусом дружбы.
friendRoutes.get(
  '/with-friendship-status',
  authMiddleware,
  friendController.getUsersWithFriendshipStatus
);

// Отправляет заявку в друзья.
friendRoutes.post('/requests', authMiddleware, friendController.sendRequest);

// Принимает заявку в друзья.
friendRoutes.patch(
  '/:friendshipId/accept',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.acceptRequest
);

// Блокирует пользователя.
friendRoutes.patch('/block', authMiddleware, friendController.blockUser);

// Удаляет дружбу, снимает блокировку или отменяет заявку.
friendRoutes.delete(
  '/:friendshipId/reject',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.rejectRequest
);

module.exports = friendRoutes;
