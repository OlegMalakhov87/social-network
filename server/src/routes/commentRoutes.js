const { Router } = require('express');
const commentController = require('../controllers/commentController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  validateComment,
} = require('../middleware/validation/commentValidation');

const commentRoutes = Router();

// Получение комментариев для конкретной сущности
commentRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  commentController.getAllCommentsTarget
);

// Получение комментария по ID для shared комментария
commentRoutes.get(
  '/:commentId/shared',
  validateIdParam('commentId'),
  authMiddleware,
  commentController.getCommentById
);

// Создание комментария
commentRoutes.post(
  '/add',
  authMiddleware,
  validateComment,
  commentController.createComment
);

// Обновление комментария
commentRoutes.patch(
  '/:commentId/update',
  validateIdParam('commentId'),
  authMiddleware,
  validateComment,
  commentController.updateComment
);

// Удаление комментария
commentRoutes.delete(
  '/:commentId/delete',
  validateIdParam('commentId'),
  authMiddleware,
  commentController.deleteComment
);

module.exports = commentRoutes;
