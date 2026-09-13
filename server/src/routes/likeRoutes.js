const { Router } = require('express');
const likeController = require('../controllers/likeController');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { validateLike } = require('../middleware/validation/likeValidation');

const likeRoutes = Router();

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
