const { Router } = require('express');
const postController = require('../controllers/postController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { validatePost } = require('../middleware/validation/postValidation');
const {
  validatePrivacyUpdate,
} = require('../middleware/validation/validatePrivacyUpdate');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');

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

// Создание поста
postRoutes.post(
  '/add',
  authMiddleware,
  validatePost,
  postController.createPost
);

// Загрузка медиа файла для поста
postRoutes.post(
  '/upload-media',
  authMiddleware,
  upload.single('postUrl'),
  handleUploadError,
  postController.uploadMedia
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
postRoutes.patch(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  postController.updatePostPrivacy
);

// Удаление поста (владелец)
postRoutes.delete(
  '/:postId/delete',
  validateIdParam('postId'),
  authMiddleware,
  postController.deletePost
);

// Удаление (очистка мусора) загруженных медиа файлов
postRoutes.delete(
  '/delete-uploaded-media',
  authMiddleware,
  postController.deleteUploadedMedia
);

module.exports = postRoutes;
