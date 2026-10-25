const { Router } = require('express');

const newsController = require('../controllers/newsController');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const {
  validateCreateNews,
} = require('../middleware/validation/validateCreateNews');
const {
  validateUpdateNews,
} = require('../middleware/validation/validateUpdateNews');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');
const {
  validateUploadedMedia,
} = require('../middleware/validation/validateUploadedMedia');

const newsRoutes = Router();

// Возвращает список новостей.
newsRoutes.get('/', authMiddleware, newsController.getNews);

// Возвращает новость по идентификатору для общего доступа.
newsRoutes.get(
  '/:newsId/shared',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.getNewsById
);

// Создает новость.
newsRoutes.post(
  '/add',
  authMiddleware,
  validateCreateNews,
  newsController.createNews
);

// Загружает медиафайл новости.
newsRoutes.post(
  '/upload-media',
  authMiddleware,
  upload.single('newsUrl'),
  handleUploadError,
  validateUploadedMedia,
  newsController.uploadMedia
);

// Обновляет новость владельца.
newsRoutes.put(
  '/:newsId/update',
  validateIdParam('newsId'),
  authMiddleware,
  validateUpdateNews,
  newsController.updateNews
);

// Увеличивает счетчик просмотров новости.
newsRoutes.patch(
  '/:newsId/views',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.incrementViewsCount
);

// Удаляет новость владельца.
newsRoutes.delete(
  '/:newsId/delete',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.deleteNews
);

// Удаляет загруженные медиафайлы.
newsRoutes.delete(
  '/delete-uploaded-media',
  authMiddleware,
  newsController.deleteUploadedMedia
);

module.exports = newsRoutes;
