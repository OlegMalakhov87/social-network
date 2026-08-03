const { Router } = require('express');
const newsController = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateIdParam,
  validateNews,
} = require('../middleware/validationMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const newsRoutes = Router();

// Получить новости
newsRoutes.get('/', authMiddleware, newsController.getNews);

// Получить новость по ID для шеринга
newsRoutes.get(
  '/:newsId/shared',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.getNewsById
);

// Создать новость
newsRoutes.post('/', authMiddleware, validateNews, newsController.createNews);

// Увеличить счетчик просмотров новости
newsRoutes.put(
  '/:newsId/views',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.incrementViewsCount
);

// Загрузка медиа файла для новости
newsRoutes.post(
  '/upload-media',
  authMiddleware,
  upload.single('media'),
  handleUploadError,
  newsController.uploadMedia
);
// Обновить новость
newsRoutes.put(
  '/:newsId',
  validateIdParam('newsId'),
  authMiddleware,
  validateNews,
  newsController.updateNews
);

// Удалить новость
newsRoutes.delete(
  '/:newsId',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.deleteNews
);

module.exports = newsRoutes;
