const { Router } = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateIdParam,
  validateLike,
} = require('../middleware/validationMiddleware');

const likeRoutes = Router();

// Получить все лайки конкретной сущности
likeRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.getLikesByTarget
);

// Получить все лайки пользователя
likeRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  likeController.getUserLikes
);

// Проверить, поставил ли текущий пользователь лайк
likeRoutes.get(
  ':targetType/:targetId/check',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.checkLike
);

// Поставить лайк
likeRoutes.post(
  '/:targetType/:targetId/add',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.addLike
);

// Удалить лайк
likeRoutes.delete(
  '/:targetType/:targetId/delete',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.deleteLike
);

module.exports = likeRoutes;
