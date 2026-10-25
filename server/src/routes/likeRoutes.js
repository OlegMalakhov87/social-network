const { Router } = require('express');

const likeController = require('../controllers/likeController');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { validateLike } = require('../middleware/validation/validateLike');

const likeRoutes = Router();

// Создает лайк сущности.
likeRoutes.post(
  '/:targetType/:targetId/add',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.addLike
);

// Удаляет лайк сущности.
likeRoutes.delete(
  '/:targetType/:targetId/delete',
  validateIdParam('targetId'),
  authMiddleware,
  validateLike,
  likeController.deleteLike
);

module.exports = likeRoutes;
