const { Router } = require('express');
const postController = require('../controllers/postController');
const {
  validatePost,
  validateIdParam,
} = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const postRoutes = Router();

// Получение постов пользователя
postRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  postController.getUserPosts
);

// Получение поста по id для shared поста
postRoutes.get(
  '/:postId/shared',
  validateIdParam('postId'),
  authMiddleware,
  postController.getPostById
);

// Загрузка медиа файла для поста
postRoutes.post(
  '/upload-media',
  authMiddleware,
  upload.single('media'),
  handleUploadError,
  postController.uploadMedia
);

// Создание поста
postRoutes.post('/', authMiddleware, validatePost, postController.createPost);

// Обновление поста
postRoutes.put(
  '/:postId',
  validateIdParam('postId'),
  authMiddleware,
  postController.updatePost
);

// Удаление поста
postRoutes.delete(
  '/:postId',
  validateIdParam('postId'),
  authMiddleware,
  postController.deletePost
);

module.exports = postRoutes;
