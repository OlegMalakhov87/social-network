const { Router } = require('express');
const newsController = require('../controllers/newsController');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { validateNews } = require('../middleware/validation/newsValidation');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');

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
newsRoutes.post(
  '/add',
  authMiddleware,
  validateNews,
  newsController.createNews
);

// Загрузка медиа файла для новости
newsRoutes.post(
  '/upload-media',
  authMiddleware,
  upload.single('newsUrl'),
  handleUploadError,
  newsController.uploadMedia
);

// Обновить новость (владелец)
newsRoutes.put(
  '/:newsId/update',
  validateIdParam('newsId'),
  authMiddleware,
  validateNews,
  newsController.updateNews
);

// Увеличить счетчик просмотров новости
newsRoutes.patch(
  '/:newsId/views',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.incrementViewsCount
);

// Удалить новость (владелец)
newsRoutes.delete(
  '/:newsId/delete',
  validateIdParam('newsId'),
  authMiddleware,
  newsController.deleteNews
);

// Удаление (очистка мусора) загруженных медиа файлов
newsRoutes.delete(
  '/delete-uploaded-media',
  authMiddleware,
  newsController.deleteUploadedMedia
);

module.exports = newsRoutes;
