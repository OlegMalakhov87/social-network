const { Router } = require('express');
const postController = require('../controllers/postController');
const { validatePost, validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { checkPostOwnership } = require('../middleware/ownershipMiddleware');

const postRoutes = Router();

postRoutes.get('/search', authMiddleware, postController.searchPosts);

postRoutes.get('/feed', authMiddleware, postController.getFeed);

postRoutes.get('/:userId', validateIdParam('userId'), authMiddleware, postController.getUserPosts);

postRoutes.get(
  '/:postId/shared',
  validateIdParam('postId'),
  authMiddleware,
  postController.getPostById
);

postRoutes.post('/', authMiddleware, validatePost, postController.createPost);

postRoutes.put(
  '/:postId',
  validateIdParam('postId'),
  authMiddleware,
  checkPostOwnership,
  postController.updatePost
);
postRoutes.delete(
  '/:postId',
  validateIdParam('postId'),
  authMiddleware,
  checkPostOwnership,
  postController.deletePost
);

module.exports = postRoutes;
