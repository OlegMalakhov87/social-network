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
postRoutes.post(
  '/add',
  authMiddleware,
  validatePost,
  postController.createPost
);

// Обновление поста (владелец)
postRoutes.put(
  '/:postId/update',
  validateIdParam('postId'),
  authMiddleware,
  validatePost,
  postController.updatePost
);

// Обновление приватности постов
postRoutes.put(
  '/update-privacy',
  authMiddleware,
  postController.updatePostPrivacy
);

// Удаление поста (владелец)
postRoutes.delete(
  '/:postId/delete',
  validateIdParam('postId'),
  authMiddleware,
  postController.deletePost
);

module.exports = postRoutes;
