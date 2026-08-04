const { Router } = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateIdParam,
  validateLike,
} = require('../middleware/validationMiddleware');

const likeRoutes = Router();

// Проверить, поставил ли текущий пользователь лайк
likeRoutes.get(
  '/check/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  likeController.checkLike
);

// Получить все лайки конкретной сущности
likeRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  likeController.getLikesByTarget
);

// Поставить лайк
likeRoutes.post(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.addLike
);

// Убрать лайк
likeRoutes.delete(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.removeLike
);

// Получить все лайки пользователя
likeRoutes.get(
  '/user/:userId',
  validateIdParam('userId'),
  authMiddleware,
  likeController.getUserLikes
);

module.exports = likeRoutes;
