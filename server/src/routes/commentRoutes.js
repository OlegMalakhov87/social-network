const { Router } = require('express');
const commentController = require('../controllers/commentController');
const {
  validateComment,
  validateIdParam,
} = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const commentRoutes = Router();

// Получение комментариев пользователя
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

// Получение комментариев для конкретной сущности
commentRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  commentController.getAllCommentsTarget
);

// Создание комментария
commentRoutes.post(
  '/',
  authMiddleware,
  validateComment,
  commentController.createComment
);

// Обновление комментария
commentRoutes.put(
  '/:commentId',
  validateIdParam('commentId'),
  authMiddleware,
  validateComment,
  commentController.updateComment
);

// Удаление комментария
commentRoutes.delete(
  '/:commentId',
  validateIdParam('commentId'),
  authMiddleware,
  commentController.deleteComment
);

module.exports = commentRoutes;
