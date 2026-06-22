const { Router } = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateLike, validateIdParam } = require('../middleware/validationMiddleware');
const { checkLikeOwnership } = require('../middleware/ownershipMiddleware');

const likeRoutes = Router();

console.log('likeRoutes loaded');

likeRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  likeController.getAllLikesUser
);

likeRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  likeController.getAllLikesTarget
);

likeRoutes.get('/check', authMiddleware, likeController.checkLikeUser);

likeRoutes.post('/', authMiddleware, validateLike, likeController.createLike);

likeRoutes.delete('/', authMiddleware, validateLike, likeController.deleteLike);

likeRoutes.delete(
  '/:likeId',
  validateIdParam('likeId'),
  authMiddleware,
  checkLikeOwnership,
  likeController.deleteLikeById
);

module.exports = likeRoutes;
