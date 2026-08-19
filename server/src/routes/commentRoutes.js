const { Router } = require('express');
const commentController = require('../controllers/commentController');
const {
  validateComment,
  validateIdParam,
} = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const commentRoutes = Router();

// Получение комментариев для конкретной сущности
commentRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  commentController.getAllCommentsTarget
);

// Получение комментариев пользователя (для админки)
commentRoutes.get(
  '/user/:userId',
  validateIdParam('userId'),
  authMiddleware,
  commentController.getAllCommentsUser
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
commentRoutes.put(
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
