const { Router } = require('express');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkCommentOwnership } = require('../middleware/ownershipMiddleware');
const { validateComment, validateIdParam } = require('../middleware/validationMiddleware');

const commentRoutes = Router();

commentRoutes.get(
  '/user/:userId',
  validateIdParam('userId'),
  authMiddleware,
  commentController.getAllCommentsUser
);

commentRoutes.get(
  '/:commentId',
  validateIdParam('commentId'),
  authMiddleware,
  commentController.getCommentById
);

commentRoutes.get(
  '/:targetType/:targetId',
  validateIdParam('targetId'),
  authMiddleware,
  commentController.getAllCommentsTarget
);

commentRoutes.post('/', authMiddleware, validateComment, commentController.createComment);

commentRoutes.put(
  '/:commentId',
  validateIdParam('commentId'),
  authMiddleware,
  validateComment,
  checkCommentOwnership,
  commentController.updateComment
);

commentRoutes.delete(
  '/:commentId',
  validateIdParam('commentId'),
  authMiddleware,
  checkCommentOwnership,
  commentController.deleteComment
);
module.exports = commentRoutes;
