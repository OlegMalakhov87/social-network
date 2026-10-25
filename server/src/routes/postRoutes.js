const { Router } = require('express');

const postController = require('../controllers/postController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const {
  validateCreatePost,
} = require('../middleware/validation/validateCreatePost');
const {
  validateUpdatePost,
} = require('../middleware/validation/validateUpdatePost');
const {
  validatePrivacyUpdate,
} = require('../middleware/validation/validatePrivacyUpdate');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');
const {
  validateUploadedMedia,
} = require('../middleware/validation/validateUploadedMedia');

const postRoutes = Router();

// Возвращает посты пользователя.
postRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  postController.getUserPosts
);

// Возвращает пост по идентификатору для общего доступа.
postRoutes.get(
  '/:postId/shared',
  validateIdParam('postId'),
  authMiddleware,
  postController.getPostById
);

// Создает пост.
postRoutes.post(
  '/add',
  authMiddleware,
  validateCreatePost,
  postController.createPost
);

// Загружает медиафайл поста.
postRoutes.post(
  '/upload-media',
  authMiddleware,
  upload.single('postUrl'),
  handleUploadError,
  validateUploadedMedia,
  postController.uploadMedia
);

// Обновляет пост владельца.
postRoutes.put(
  '/:postId/update',
  validateIdParam('postId'),
  authMiddleware,
  validateUpdatePost,
  postController.updatePost
);

// Обновляет приватность постов.
postRoutes.patch(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  postController.updatePostPrivacy
);

// Удаляет пост владельца.
postRoutes.delete(
  '/:postId/delete',
  validateIdParam('postId'),
  authMiddleware,
  postController.deletePost
);

// Удаляет загруженные медиафайлы.
postRoutes.delete(
  '/delete-uploaded-media',
  authMiddleware,
  postController.deleteUploadedMedia
);

module.exports = postRoutes;
