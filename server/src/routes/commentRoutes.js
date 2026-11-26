const { Router } = require('express');

const commentController = require('../controllers/commentController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { validateComment } = require('../middleware/validation/validateComment');
const {
  validatePagination,
} = require('../middleware/validation/paginationValidation');

const commentRoutes = Router();

// Возвращает комментарий по идентификатору для общего доступа.
commentRoutes.get(
  '/:commentId/shared',
  validateIdParam('commentId'),
  authMiddleware,
  commentController.getCommentById
);

// Возвращает комментарии сущности.
commentRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  validatePagination,
  commentController.getAllCommentsTarget
);

// Создает комментарий.
commentRoutes.post(
  '/add',
  authMiddleware,
  validateComment,
  commentController.createComment
);

// Обновляет комментарий.
commentRoutes.patch(
  '/:commentId/update',
  validateIdParam('commentId'),
  authMiddleware,
  validateComment,
  commentController.updateComment
);

// Удаляет комментарий.
commentRoutes.delete(
  '/:commentId/delete',
  validateIdParam('commentId'),
  authMiddleware,
  commentController.deleteComment
);

module.exports = commentRoutes;
